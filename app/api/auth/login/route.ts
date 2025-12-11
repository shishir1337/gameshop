import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { loginSchema } from "@/lib/validations/auth";
import { generateOTPWithExpiry } from "@/lib/utils/otp";
import { rateLimiters, getRateLimitIdentifier } from "@/lib/rate-limit";
import { sanitizeError } from "@/lib/utils/errors";

/**
 * POST /api/auth/login
 * Login a user
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(req);
    const rateLimitResult = await rateLimiters.login.limit(identifier);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
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
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: validationResult.error.issues[0]?.message || "Invalid email or password",
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });

    // If login successful but email not verified, send OTP
    if (result.user && !result.user.emailVerified) {
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

      // Send verification email (non-blocking)
      sendVerificationEmail({
        email: result.user.email,
        otpCode,
        firstName: result.user.name || undefined,
      }).catch((error) => {
        // Log error but don't fail login
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to send verification email:", error);
        }
      });
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const { message, statusCode } = sanitizeError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

