import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

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

      // Generate new 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

      await prisma.verification.create({
        data: {
          identifier: email,
          value: otpCode,
          expiresAt,
          userId: user.id,
        },
      });

      // Send email using Resend
      await sendVerificationEmail({
        email: user.email,
        otpCode,
        firstName: user.name || undefined,
      });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json(
      { message: "If an account with that email exists and is not verified, a verification email has been sent." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resend verification email" },
      { status: 400 }
    );
  }
}

