import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/auth/me
 * Get the current authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch full user data including role from database
    const { prisma } = await import("@/lib/prisma");
    const fullUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!fullUser) {
      return NextResponse.json({
        user: session.user,
        session: session.session,
      });
    }

    // Return user with role information
    // Type assertion needed because Prisma types might not include role yet
    const userWithRole = fullUser as typeof fullUser & { role?: string };
    
    return NextResponse.json({
      user: {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        emailVerified: fullUser.emailVerified,
        image: fullUser.image,
        role: userWithRole.role || "user", // Default to "user" if role is missing
        createdAt: fullUser.createdAt,
        updatedAt: fullUser.updatedAt,
      },
      session: session.session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to get user" },
      { status: 400 }
    );
  }
}

