import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { generateOTPWithExpiry } from "@/lib/utils/otp";
import { sanitizeError } from "@/lib/utils/errors";

/**
 * POST /api/auth/register
 * Register a new user
 * Note: Rate limiting is handled by Better Auth's built-in rate limiter
 */
export async function POST(req: NextRequest) {
  try {
    // Validate input
    const body = await req.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.issues[0]?.message || "Invalid input",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;

    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name || "",
      },
      headers: await headers(),
    });

    // Send verification email with OTP (non-blocking)
    if (result.user) {
      // Generate cryptographically secure OTP
      const { code: otpCode, expiresAt } = generateOTPWithExpiry(15);

      // Delete old verification tokens for this email
      await prisma.verification.deleteMany({
        where: {
          identifier: email,
        },
      });

      // Create new verification record with OTP
      await prisma.verification.create({
        data: {
          identifier: email,
          value: otpCode,
          expiresAt,
          userId: result.user.id,
        },
      });

      sendVerificationEmail({
        email: result.user.email,
        otpCode,
        firstName: result.user.name || undefined,
      }).catch((error) => {
        // Log error but don't fail registration
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to send verification email:", error);
        }
      });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const { message, statusCode } = sanitizeError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

