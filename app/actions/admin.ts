"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sanitizeError } from "@/lib/utils/errors";
import type {
  AdminUser,
  ListUsersParams,
  ListUsersResponse,
  UserOperationResponse,
} from "@/types/admin";

/**
 * List all users with pagination and filters
 */
export async function listUsers(
  params: ListUsersParams = {}
): Promise<ListUsersResponse> {
  try {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const offset = (page - 1) * limit;

    // Build query parameters for Better Auth admin API
    const query: Record<string, string | number> = {
      limit,
      offset,
    };

    if (params.search) {
      query.searchValue = params.search;
      query.searchField = "email";
      query.searchOperator = "contains";
    }

    if (params.role) {
      query.filterField = "role";
      query.filterValue = params.role;
      query.filterOperator = "eq";
    }

    if (params.emailVerified !== undefined) {
      query.filterField = "emailVerified";
      query.filterValue = params.emailVerified ? "true" : "false";
      query.filterOperator = "eq";
    }

    const result = await auth.api.listUsers({
      query,
      headers: await headers(),
    });

    if (!result || !result.users) {
      throw new Error("Failed to fetch users");
    }

    // Map Better Auth users to AdminUser format
    const formattedUsers: AdminUser[] = result.users.map((user) => {
      // Handle banned field which can be boolean | null
      const banned = user.banned === null ? false : (user.banned ?? false);
      
      return {
        id: user.id,
        name: user.name ?? null,
        email: user.email,
        image: user.image ?? null,
        emailVerified: user.emailVerified ?? false,
        role: user.role || "user",
        banned,
        banReason: user.banReason ?? null,
        banExpires: user.banExpires ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });

    const total = result.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    throw new Error(message);
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  role: "user" | "admin"
): Promise<UserOperationResponse> {
  try {
    await auth.api.setRole({
      body: {
        userId,
        role,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: `User role updated to ${role}`,
    };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    throw new Error(message);
  }
}

/**
 * Delete a user
 */
export async function deleteUser(
  userId: string
): Promise<UserOperationResponse> {
  try {
    await auth.api.removeUser({
      body: {
        userId,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    throw new Error(message);
  }
}

/**
 * Get user details by ID
 */
export async function getUserById(
  userId: string
): Promise<AdminUser | null> {
  try {
    const result = await auth.api.listUsers({
      query: {
        filterField: "id",
        filterValue: userId,
        filterOperator: "eq",
        limit: 1,
      },
      headers: await headers(),
    });

    if (!result || !result.users || result.users.length === 0) {
      return null;
    }

    const user = result.users[0];
    // Handle banned field which can be boolean | null
    const banned = user.banned === null ? false : (user.banned ?? false);
    
    return {
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      image: user.image ?? null,
      emailVerified: user.emailVerified ?? false,
      role: user.role || "user",
      banned,
      banReason: user.banReason ?? null,
      banExpires: user.banExpires ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    throw new Error(message);
  }
}

/**
 * Toggle user email verification status
 */
export async function toggleUserEmailVerification(
  userId: string,
  emailVerified: boolean
): Promise<UserOperationResponse> {
  try {
    await auth.api.adminUpdateUser({
      body: {
        userId,
        data: {
          emailVerified,
        },
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: `Email verification ${emailVerified ? "enabled" : "disabled"}`,
    };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    throw new Error(message);
  }
}

/**
 * Ban a user
 */
export async function banUser(
  userId: string,
  banReason?: string,
  banExpiresIn?: number
): Promise<UserOperationResponse> {
  try {
    await auth.api.banUser({
      body: {
        userId,
        banReason,
        banExpiresIn,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "User banned successfully",
    };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    throw new Error(message);
  }
}

/**
 * Unban a user
 */
export async function unbanUser(
  userId: string
): Promise<UserOperationResponse> {
  try {
    await auth.api.unbanUser({
      body: {
        userId,
      },
      headers: await headers(),
    });

    return {
      success: true,
      message: "User unbanned successfully",
    };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    throw new Error(message);
  }
}

/**
 * Get dashboard statistics (optimized - single query)
 */
export async function getDashboardStats() {
  try {
    // Fetch all users once and calculate stats client-side
    const result = await auth.api.listUsers({
      query: {
        limit: 1000, // Adjust as needed
        offset: 0,
      },
      headers: await headers(),
    });

    if (!result || !result.users) {
      throw new Error("Failed to fetch users");
    }

    const users = result.users.map((user) => ({
      id: user.id,
      emailVerified: user.emailVerified ?? false,
      role: user.role || "user",
      banned: user.banned === null ? false : (user.banned ?? false),
    }));

    const stats = {
      totalUsers: result.total || 0,
      verifiedUsers: users.filter((u) => u.emailVerified).length,
      unverifiedUsers: users.filter((u) => !u.emailVerified).length,
      adminUsers: users.filter((u) => u.role === "admin").length,
      bannedUsers: users.filter((u) => u.banned).length,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    return {
      success: false,
      error: message,
    };
  }
}