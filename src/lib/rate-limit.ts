/**
 * Simple in-memory rate limiter
 * For production at scale, upgrade to Upstash Redis or similar
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.requests.entries()) {
        if (now > entry.resetTime) {
          this.requests.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @param limit - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with success status and remaining requests
   */
  check(
    identifier: string,
    limit: number,
    windowMs: number
  ): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      // New window or expired entry
      const resetTime = now + windowMs;
      this.requests.set(identifier, { count: 1, resetTime });
      return { success: true, remaining: limit - 1, resetTime };
    }

    if (entry.count >= limit) {
      // Rate limit exceeded
      return { success: false, remaining: 0, resetTime: entry.resetTime };
    }

    // Increment count
    entry.count++;
    this.requests.set(identifier, entry);
    return { success: true, remaining: limit - entry.count, resetTime: entry.resetTime };
  }

  /**
   * Reset rate limit for an identifier (useful for testing)
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Get current stats (for debugging)
   */
  getStats(): { totalKeys: number; entries: Array<{ key: string; count: number }> } {
    return {
      totalKeys: this.requests.size,
      entries: Array.from(this.requests.entries()).map(([key, entry]) => ({
        key,
        count: entry.count,
      })),
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Chat endpoint: 10 requests per minute per IP
  chat: {
    limit: 10,
    window: 60 * 1000, // 1 minute
  },
  // Feedback: 5 requests per hour per IP
  feedback: {
    limit: 5,
    window: 60 * 60 * 1000, // 1 hour
  },
  // Bricks edit: 20 requests per minute per IP
  bricksEdit: {
    limit: 20,
    window: 60 * 1000, // 1 minute
  },
  // Default for other endpoints: 30 requests per minute
  default: {
    limit: 30,
    window: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Helper to get client IP from request
 */
export function getClientIp(request: Request): string {
  // Check common headers for client IP (handles proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return "unknown";
}

/**
 * Apply rate limiting to a request
 * Returns null if allowed, or a Response object if rate limited
 */
export function applyRateLimit(
  request: Request,
  config: { limit: number; window: number }
): { success: boolean; remaining: number; resetTime: number } {
  const identifier = getClientIp(request);
  return rateLimiter.check(identifier, config.limit, config.window);
}

export default rateLimiter;
