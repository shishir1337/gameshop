import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailSchema } from "@/lib/validations/auth";
import { rateLimiters, getRateLimitIdentifier } from "@/lib/rate-limit";
import { sanitizeError } from "@/lib/utils/errors";

/**
 * POST /api/auth/verify-email
 * Verify email address with OTP code
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(req);
    const rateLimitResult = await rateLimiters.emailVerification.limit(identifier);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many verification attempts. Please try again later.",
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

