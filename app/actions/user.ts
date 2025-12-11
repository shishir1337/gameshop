"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations/auth";
import { sanitizeError } from "@/lib/utils/errors";
import type { UpdateProfileRequest, UpdateProfileResponse } from "@/types/api";
import type { UserProfile } from "@/types";

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

