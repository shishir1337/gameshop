import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * POST /api/auth/verify-email
 * Verify email address with OTP code
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { otp, email } = body;

    if (!otp || !email) {
      return NextResponse.json(
        { error: "OTP code and email are required" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      message: "Email verified successfully",
      user: verification.user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to verify email" },
      { status: 400 }
    );
  }
}

