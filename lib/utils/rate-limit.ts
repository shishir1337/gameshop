"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Rate limiting utility using database storage
 * Note: In Next.js 16+, middleware has been replaced with proxy.ts for advanced routing
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const resetAt = new Date(now + windowMs);

  try {
    // Get or create rate limit record
    const rateLimit = await prisma.rateLimit.upsert({
      where: { id: key },
      create: {
        id: key,
        key,
        count: 1,
        lastRequest: BigInt(now),
      },
      update: {
        count: {
          increment: 1,
        },
        lastRequest: BigInt(now),
      },
    });

    // Check if window has expired
    const lastRequestTime = Number(rateLimit.lastRequest || 0);
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest > windowMs) {
      // Window expired, reset count
      await prisma.rateLimit.update({
        where: { id: key },
        data: {
          count: 1,
          lastRequest: BigInt(now),
        },
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt,
      };
    }

    const currentCount = rateLimit.count || 0;
    const allowed = currentCount <= maxRequests;
    const remaining = Math.max(0, maxRequests - currentCount);

    return {
      allowed,
      remaining,
      resetAt,
    };
  } catch (error) {
    // On error, allow the request (fail open)
    console.error("Rate limit check error:", error);
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt,
    };
  }
}

/**
 * Get rate limit key from request (IP address or user ID)
 */
export async function getRateLimitKey(prefix: string, userId?: string): Promise<string> {
  if (userId) {
    return `${prefix}:user:${userId}`;
  }

  // Fallback to IP address
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0] || realIp || "unknown";

  return `${prefix}:ip:${ip}`;
}

