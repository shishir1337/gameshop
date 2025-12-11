import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/forgot-password
 * Send password reset email using Resend
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
    // But only send email if user exists
    if (user) {
      // Generate password reset token using Better Auth
      const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
      
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
          
          // Send email using Resend
          await sendPasswordResetEmail({
            email,
            resetLink,
            firstName: user.name || undefined,
          });
        }
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent",
    });
  } catch (error: any) {
    console.error("Password reset error:", error);
    // Still return success to prevent email enumeration
    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent",
    });
  }
}

