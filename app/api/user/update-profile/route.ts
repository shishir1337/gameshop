import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations/auth";
import { sanitizeError } from "@/lib/utils/errors";

/**
 * PUT /api/user/update-profile
 * Update user profile information
 */
export async function PUT(req: NextRequest) {
  try {
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

    // Validate input
    const body = await req.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.issues[0]?.message || "Invalid input",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, image } = validationResult.data;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image }),
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        emailVerified: updatedUser.emailVerified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error: unknown) {
    const { message, statusCode } = sanitizeError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

