import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { resendVerificationSchema } from "@/lib/validations/auth";
import { generateOTPWithExpiry } from "@/lib/utils/otp";
import { sanitizeError } from "@/lib/utils/errors";

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 * Note: Rate limiting is handled by Better Auth's built-in rate limiter
 */
export async function POST(req: NextRequest) {
  try {
    // Validate input
    const body = await req.json();
    const validationResult = resendVerificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.issues[0]?.message || "Invalid email address",
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (user) {
      // Check if email is already verified
      if (user.emailVerified) {
        return NextResponse.json(
          { message: "Email is already verified" },
          { status: 200 }
        );
      }

      // Delete old verification tokens for this email
      await prisma.verification.deleteMany({
        where: {
          identifier: email,
        },
      });

      // Generate cryptographically secure OTP
      const { code: otpCode, expiresAt } = generateOTPWithExpiry(15);

      await prisma.verification.create({
        data: {
          identifier: email,
          value: otpCode,
          expiresAt,
          userId: user.id,
        },
      });

      // Send email using Resend (non-blocking)
      sendVerificationEmail({
        email: user.email,
        otpCode,
        firstName: user.name || undefined,
      }).catch((error) => {
        // Log error but don't fail the request
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to send verification email:", error);
        }
      });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      { message: "If an account with that email exists and is not verified, a verification email has been sent." },
      { status: 200 }
    );
  } catch (error: unknown) {
    const { message, statusCode } = sanitizeError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

