"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations/auth";
import { sanitizeError } from "@/lib/utils/errors";
import type { UpdateProfileRequest, UpdateProfileResponse } from "@/types/api";
import type { UserProfile } from "@/types";

/**
 * Server Action: Get current authenticated user
 * This replaces the API route for better type safety and SSR support
 */
export async function getCurrentUser(): Promise<{ user: UserProfile } | { error: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Not authenticated" };
    }

    // Fetch full user data including role from database
    const fullUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: {
          where: {
            providerId: {
              in: ["google", "facebook"],
            },
          },
        },
      },
    });

    if (!fullUser) {
      // Fallback to session user if not found in DB
      const userProfile: UserProfile = {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email,
        emailVerified: session.user.emailVerified ?? false,
        image: session.user.image ?? null,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return { user: userProfile };
    }

    // If user has OAuth accounts (Google/Facebook), their email is verified
    const hasOAuthAccount = fullUser.accounts.length > 0;
    const emailVerified = hasOAuthAccount ? true : fullUser.emailVerified;

    // Return user with role information
    const userWithRole = fullUser as typeof fullUser & { role?: string };
    
    const userProfile: UserProfile = {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      emailVerified: emailVerified,
      image: fullUser.image,
      role: userWithRole.role || "user",
      createdAt: fullUser.createdAt,
      updatedAt: fullUser.updatedAt,
    };

    return { user: userProfile };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    return { error: message };
  }
}

/**
 * Server Action: Update user profile
 * This replaces the API route for better type safety and performance
 */
export async function updateProfile(
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Not authenticated");
    }

    // Validate input
    const validationResult = updateProfileSchema.safeParse(data);

    if (!validationResult.success) {
      throw new Error(
        validationResult.error.issues[0]?.message || "Invalid input"
      );
    }

    const { name, image } = validationResult.data;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image }),
      },
    });

    const userProfile: UserProfile = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      emailVerified: updatedUser.emailVerified,
      role: (updatedUser as { role?: string }).role || "user",
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    return {
      message: "Profile updated successfully",
      user: userProfile,
    };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    throw new Error(message);
  }
}

