import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: await headers(),
    });

    // Send verification email with OTP (non-blocking)
    if (result.user) {
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

      sendVerificationEmail({
        email: result.user.email,
        otpCode,
        firstName: result.user.name || undefined,
      }).catch((error) => {
        console.error("Failed to send verification email:", error);
        // Don't fail registration if verification email fails
      });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 400 }
    );
  }
}

