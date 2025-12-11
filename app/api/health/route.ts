import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient, isRedisConnected } from "@/lib/redis";

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      redis: "unknown",
    },
  };

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = "connected";
  } catch (error) {
    health.services.database = "disconnected";
    health.status = "unhealthy";
  }

  // Check Redis connectivity using shared client
  if (process.env.REDIS_URL) {
    try {
      const redis = getRedisClient();
      if (redis && isRedisConnected()) {
        await redis.ping();
        health.services.redis = "connected";
      } else {
        health.services.redis = "disconnected";
      }
    } catch (error) {
      health.services.redis = "disconnected";
      // Redis failure doesn't make the app unhealthy, just degraded
    }
  } else {
    health.services.redis = "not_configured";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}

