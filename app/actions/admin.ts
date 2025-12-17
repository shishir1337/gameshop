"use server";

 import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sanitizeError } from "@/lib/utils/errors";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: boolean;
  role: string;
  banned: boolean;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  emailVerified?: boolean;
}

export interface ListUsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

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

    const formattedUsers: AdminUser[] = result.users.map((user: {
      id: string;
      name?: string | null;
      email: string;
      image?: string | null;
      emailVerified?: boolean;
      role?: string;
      banned?: boolean;
      banReason?: string | null;
      banExpires?: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      image: user.image ?? null,
      emailVerified: user.emailVerified ?? false,
      role: user.role || "user",
      banned: user.banned || false,
      banReason: user.banReason ?? null,
      banExpires: user.banExpires ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

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
): Promise<{ success: boolean; message: string }> {
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
): Promise<{ success: boolean; message: string }> {
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
    return {
      id: user.id,
      name: user.name ?? null,
      email: user.email,
      image: user.image ?? null,
      emailVerified: user.emailVerified ?? false,
      role: user.role || "user",
      banned: user.banned || false,
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
): Promise<{ success: boolean; message: string }> {
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
): Promise<{ success: boolean; message: string }> {
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
): Promise<{ success: boolean; message: string }> {
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
