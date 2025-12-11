import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { rateLimiters, getRateLimitIdentifier } from "@/lib/rate-limit";
import { sanitizeError } from "@/lib/utils/errors";

/**
 * POST /api/auth/forgot-password
 * Send password reset email using Resend
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = getRateLimitIdentifier(req);
    const rateLimitResult = await rateLimiters.passwordReset.limit(identifier);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many password reset requests. Please try again later.",
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
    const validationResult = forgotPasswordSchema.safeParse(body);

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
    // But only send email if user exists
    if (user) {
      // Generate password reset token using Better Auth
      const baseUrl = process.env.BETTER_AUTH_URL;
      if (!baseUrl) {
        throw new Error("BETTER_AUTH_URL is not configured");
      }

      // Call Better Auth's request-password-reset to generate the token
      const response = await fetch(`${baseUrl}/api/auth/request-password-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.get("cookie") || "",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Get the reset token from Better Auth's response or generate reset link
        // Better Auth will create a verification record
        const verification = await prisma.verification.findFirst({
          where: {
            identifier: email,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (verification) {
          const resetLink = `${baseUrl}/reset-password?token=${verification.value}`;

          // Send email using Resend (non-blocking)
          sendPasswordResetEmail({
            email,
            resetLink,
            firstName: user.name || undefined,
          }).catch((error) => {
            // Log error but don't fail the request
            if (process.env.NODE_ENV === "development") {
              console.error("Failed to send password reset email:", error);
            }
          });
        }
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent",
    });
  } catch (error: unknown) {
    // Still return success to prevent email enumeration
    if (process.env.NODE_ENV === "development") {
      const { message } = sanitizeError(error);
      console.error("Password reset error:", message);
    }
    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent",
    });
  }
}

