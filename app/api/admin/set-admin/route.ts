import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimiters, getRateLimitIdentifier } from "@/lib/rate-limit";
import { sanitizeError } from "@/lib/utils/errors";

const setAdminSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
}).refine((data) => data.userId || data.email, {
  message: "Either userId or email is required",
});

/**
 * POST /api/admin/set-admin
 * Set a user as admin (only existing admins can do this)
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(req);
    const rateLimitResult = await rateLimiters.admin.limit(identifier);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    // Validate input
    const body = await req.json();
    const validationResult = setAdminSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.issues[0]?.message || "Invalid input",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { userId, email } = validationResult.data;

    // Find user by ID or email
    const user = await prisma.user.findUnique({
      where: userId ? { id: userId } : { email: email! },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user role to admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: "admin" },
    });

    return NextResponse.json({
      message: "User set as admin successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  } catch (error: unknown) {
    const { message, statusCode } = sanitizeError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

