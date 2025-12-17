"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { registerSchema, verifyEmailSchema, resendVerificationSchema } from "@/lib/validations/auth";
import { generateOTPWithExpiry } from "@/lib/utils/otp";
import { sanitizeError } from "@/lib/utils/errors";
import type { RegisterRequest, RegisterResponse } from "@/types/api";
import type { UserProfile } from "@/types";

/**
 * Server Action: Register a new user
 */
export async function registerUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  try {
    // Validate input
    const validationResult = registerSchema.safeParse(data);

    if (!validationResult.success) {
      throw new Error(
        validationResult.error.issues[0]?.message || "Invalid input"
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

    if (!result.user) {
      throw new Error("Failed to create user");
    }

    // Send verification email with OTP (non-blocking)
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

    const userProfile: UserProfile = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      image: result.user.image ?? null,
      emailVerified: result.user.emailVerified,
      role: (result.user as { role?: string }).role || "user",
      createdAt: result.user.createdAt,
      updatedAt: result.user.updatedAt,
    };

    // Better Auth signUpEmail doesn't return a session - user needs to login
    return {
      user: userProfile,
      session: undefined,
    };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    throw new Error(message);
  }
}

/**
 * Server Action: Verify email with OTP
 */
export async function verifyEmail(data: { otp: string; email: string }) {
  try {
    const validationResult = verifyEmailSchema.safeParse(data);

    if (!validationResult.success) {
      throw new Error(
        validationResult.error.issues[0]?.message || "Invalid input"
      );
    }

    const { otp, email } = validationResult.data;

    // Find verification token
    const verification = await prisma.verification.findUnique({
      where: {
        identifier_value: {
          identifier: email,
          value: otp,
        },
      },
    });

    if (!verification) {
      throw new Error("Invalid or expired verification code");
    }

    // Check if expired
    if (verification.expiresAt < new Date()) {
      await prisma.verification.delete({
        where: { id: verification.id },
      });
      throw new Error("Verification code has expired");
    }

    // Update user email verification status
    await prisma.user.update({
      where: { id: verification.userId || "" },
      data: { emailVerified: true },
    });

    // Delete verification token
    await prisma.verification.delete({
      where: { id: verification.id },
    });

    return { success: true, message: "Email verified successfully" };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    throw new Error(message);
  }
}

/**
 * Server Action: Resend verification email
 */
export async function resendVerificationEmail(data: { email: string }) {
  try {
    const validationResult = resendVerificationSchema.safeParse(data);

    if (!validationResult.success) {
      throw new Error(
        validationResult.error.issues[0]?.message || "Invalid input"
      );
    }

    const { email } = validationResult.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return { success: true, message: "If the email exists, a verification code has been sent" };
    }

    if (user.emailVerified) {
      return { success: true, message: "Email is already verified" };
    }

    // Generate new OTP
    const { code: otpCode, expiresAt } = generateOTPWithExpiry(15);

    // Delete old verification tokens
    await prisma.verification.deleteMany({
      where: { identifier: email },
    });

    // Create new verification record
    await prisma.verification.create({
      data: {
        identifier: email,
        value: otpCode,
        expiresAt,
        userId: user.id,
      },
    });

    // Send email (non-blocking)
    sendVerificationEmail({
      email: user.email,
      otpCode,
      firstName: user.name || undefined,
    }).catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to send verification email:", error);
      }
    });

    return { success: true, message: "Verification code sent successfully" };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    throw new Error(message);
  }
}

