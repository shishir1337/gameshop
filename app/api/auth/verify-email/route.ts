import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailSchema } from "@/lib/validations/auth";
import { sanitizeError } from "@/lib/utils/errors";

/**
 * POST /api/auth/verify-email
 * Verify email address with OTP code
 * Note: Rate limiting is handled by Better Auth's built-in rate limiter
 */
export async function POST(req: NextRequest) {
  try {
    // Validate input
    const body = await req.json();
    const validationResult = verifyEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.issues[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const { otp, email } = validationResult.data;

    // Find the verification record
    const verification = await prisma.verification.findFirst({
      where: {
        identifier: email,
        value: otp,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid or expired OTP code" },
        { status: 400 }
      );
    }

    // Manually verify the email by updating the user record
    await prisma.user.update({
      where: {
        id: verification.userId!,
      },
      data: {
        emailVerified: true,
      },
    });

    // Delete the used verification record
    await prisma.verification.delete({
      where: {
        id: verification.id,
      },
    });

    if (!verification.user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Email verified successfully",
      user: {
        id: verification.user.id,
        email: verification.user.email,
        name: verification.user.name,
        emailVerified: true,
      },
    });
  } catch (error: unknown) {
    const { message, statusCode } = sanitizeError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

