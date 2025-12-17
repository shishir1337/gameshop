import Redis from "ioredis";

/**
 * Shared Redis client for the application
 * Used for optional session storage caching (Better Auth secondary storage)
 */

let redis: Redis | null = null;
let isConnected = false;

/**
 * Get or create Redis client
 */
export function getRedisClient(): Redis | null {
  if (redis) {
    return redis;
  }

  if (!process.env.REDIS_URL) {
    return null;
  }

  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
          return true; // Reconnect on READONLY error
        }
        return false;
      },
      connectTimeout: 10000,
      lazyConnect: false,
    });

    redis.on("error", (err) => {
      console.error("Redis connection error:", err);
      isConnected = false;
    });

    redis.on("connect", () => {
      console.log("Redis connected successfully");
      isConnected = true;
    });

    redis.on("ready", () => {
      console.log("Redis ready");
      isConnected = true;
    });

    redis.on("close", () => {
      console.log("Redis connection closed");
      isConnected = false;
    });

    isConnected = true;
    return redis;
  } catch (error) {
    console.warn("Failed to initialize Redis:", error);
    isConnected = false;
    return null;
  }
}

/**
 * Check if Redis is connected
 */
export function isRedisConnected(): boolean {
  return isConnected && redis !== null;
}

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    isConnected = false;
  }
}

/**
 * Get Redis client for session storage
 * Returns a client with session-specific configuration
 */
export function getSessionRedisClient(): Redis | null {
  return getRedisClient();
}

