"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sanitizeError } from "@/lib/utils/errors";
import type { AdminUsersQueryParams, AdminUsersResponse, AdminStatsResponse } from "@/types/api";
import type { AdminUser, AdminOrder } from "@/types";

/**
 * Server Action: Get admin users list
 * This replaces the API route for better type safety and SSR support
 */
export async function getAdminUsers(
  params: AdminUsersQueryParams = {}
): Promise<AdminUsersResponse> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Not authenticated");
    }

    // Check if current user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized. Admin access required.");
    }

    const { search = "", page = 1, limit = 50 } = params;
    const safeLimit = Math.min(limit, 100); // Max 100 per page
    const skip = (page - 1) * safeLimit;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    // Fetch users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: safeLimit,
      }),
      prisma.user.count({ where }),
    ]);

    const adminUsers: AdminUser[] = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: (user as { role?: string }).role || "user",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return {
      users: adminUsers,
      pagination: {
        page,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
        hasMore: skip + safeLimit < total,
      },
    };
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    throw new Error(message);
  }
}

/**
 * Internal function to fetch admin stats (without caching)
 * This is used by the cached version below
 */
async function fetchAdminStatsInternal(): Promise<AdminStatsResponse> {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Not authenticated");
  }

  // Check if current user is admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized. Admin access required.");
  }

  // Fetch statistics
  // Note: Product and Order models don't exist yet in schema
  // These will be implemented when those features are added
  const [totalUsers, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    }),
  ]);

  // Placeholder values until Product and Order models are added
  const totalProducts = 0;
  const totalOrders = 0;

  // Calculate total revenue (if orders exist)
  // Note: Order model doesn't exist yet in schema
  // This will be implemented when Order feature is added
  const totalRevenue = 0;
  const recentOrders: AdminOrder[] = [];

  const adminUsers: AdminUser[] = recentUsers.map((user): AdminUser => ({
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: false, // Not fetched, default to false
    image: user.image,
    role: "user", // Not fetched, default to user
    createdAt: user.createdAt,
    updatedAt: user.createdAt, // Use createdAt as fallback
  }));

  return {
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentUsers: adminUsers,
      recentOrders,
    },
  };
}

/**
 * Server Action: Get admin dashboard statistics
 * Note: Cannot cache due to dynamic headers() usage for authentication
 */
export async function getAdminStats(): Promise<AdminStatsResponse> {
  try {
    // Cannot use unstable_cache here because we need headers() for auth
    // The session check must happen on every request
    return await fetchAdminStatsInternal();
  } catch (error: unknown) {
    const { message } = sanitizeError(error);
    throw new Error(message);
  }
}

