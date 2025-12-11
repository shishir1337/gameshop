import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

/**
 * POST /api/auth/login
 * Login a user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });

    // If login successful but email not verified, send OTP
    if (result.user && !result.user.emailVerified) {
      // Generate 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

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
        console.error("Failed to send verification email:", error);
        // Don't fail login if verification email fails
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 401 }
    );
  }
}

