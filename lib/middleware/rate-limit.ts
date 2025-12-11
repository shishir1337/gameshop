import { NextRequest, NextResponse } from "next/server";
import { rateLimiters, getRateLimitIdentifier } from "@/lib/rate-limit";

/**
 * Rate limiting middleware
 * Use this wrapper for API routes that need rate limiting
 * Note: This is a helper function. Rate limiting is now done directly in routes.
 */
export async function withRateLimit(
  req: NextRequest,
  limiterKey: keyof typeof rateLimiters,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const identifier = getRateLimitIdentifier(req);
  const limiter = rateLimiters[limiterKey];

  const result = await limiter.limit(identifier);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((result.reset - Date.now()) / 1000).toString(),
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toString(),
        },
      }
    );
  }

  return handler(req);
}

