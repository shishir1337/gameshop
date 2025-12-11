import Redis from "ioredis";

/**
 * Rate limiting configuration
 * Uses self-hosted Redis for rate limiting
 */

// Initialize Redis client
let redis: Redis | null = null;
let useRedis = false;

if (process.env.REDIS_URL) {
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
    });

    redis.on("error", (err) => {
      console.error("Redis connection error:", err);
      useRedis = false;
    });

    redis.on("connect", () => {
      console.log("Redis connected successfully");
      useRedis = true;
    });

    useRedis = true;
  } catch (error) {
    console.warn("Failed to initialize Redis, using in-memory rate limiting:", error);
    useRedis = false;
  }
}

// In-memory rate limiter fallback (for development)
class InMemoryRateLimit {
  private store = new Map<string, { count: number; resetTime: number }>();

  async limit(identifier: string, limit: number, window: number): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const key = identifier;
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.store.set(key, {
        count: 1,
        resetTime: now + window * 1000,
      });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + window * 1000,
      };
    }

    if (record.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: record.resetTime,
      };
    }

    record.count++;
    return {
      success: true,
      limit,
      remaining: limit - record.count,
      reset: record.resetTime,
    };
  }
}

const inMemoryRateLimit = new InMemoryRateLimit();

/**
 * Sliding window rate limiter using Redis
 */
class RedisRateLimiter {
  constructor(
    private redis: Redis,
    private maxLimit: number,
    private window: number
  ) {}

  async limit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const key = `rate_limit:${identifier}:${this.window}`;
    const now = Date.now();
    const windowStart = now - this.window * 1000;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline();

      // Remove old entries outside the window
      pipeline.zremrangebyscore(key, 0, windowStart);

      // Count current entries in the window
      pipeline.zcard(key);

      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);

      // Set expiration
      pipeline.expire(key, this.window);

      const results = await pipeline.exec();

      if (!results) {
        throw new Error("Redis pipeline execution failed");
      }

      // Get the count before adding the current request
      const count = (results[1]?.[1] as number) || 0;
      const newCount = count + 1;

      const reset = now + this.window * 1000;

      if (newCount > this.maxLimit) {
        return {
          success: false,
          limit: this.maxLimit,
          remaining: Math.max(0, this.maxLimit - newCount),
          reset,
        };
      }

      return {
        success: true,
        limit: this.maxLimit,
        remaining: Math.max(0, this.maxLimit - newCount),
        reset,
      };
    } catch (error) {
      // If Redis fails, fall back to in-memory
      console.error("Redis rate limit error, falling back to in-memory:", error);
      return inMemoryRateLimit.limit(identifier, this.maxLimit, this.window);
    }
  }
}

/**
 * Create a rate limiter with specific limits
 */
export function createRateLimiter(limit: number, window: number) {
  if (useRedis && redis) {
    return new RedisRateLimiter(redis, limit, window);
  }

  // Fallback to in-memory for development
  return {
    limit: async (identifier: string) => {
      return inMemoryRateLimit.limit(identifier, limit, window);
    },
  };
}

/**
 * Rate limiters for different endpoints
 */
export const rateLimiters = {
  // Authentication endpoints
  login: createRateLimiter(5, 900), // 5 attempts per 15 minutes
  register: createRateLimiter(3, 3600), // 3 attempts per hour
  passwordReset: createRateLimiter(3, 3600), // 3 attempts per hour
  emailVerification: createRateLimiter(5, 3600), // 5 attempts per hour
  resendVerification: createRateLimiter(5, 3600), // 5 attempts per hour

  // General API endpoints
  api: createRateLimiter(100, 60), // 100 requests per minute
  admin: createRateLimiter(200, 60), // 200 requests per minute for admin
} as const;

/**
 * Get client identifier for rate limiting
 */
export function getRateLimitIdentifier(req: Request): string {
  // Try to get IP from various headers
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";

  return ip;
}

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedisConnection() {
  if (redis) {
    await redis.quit();
    redis = null;
    useRedis = false;
  }
}
