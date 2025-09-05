// ✅ SECURITY: Rate limiting utility to prevent abuse
import { createClient } from '@/lib/supabase/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (userId: string, ip: string) => string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
};

// In-memory store for rate limiting (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(
  userId: string | null,
  ip: string,
  config: Partial<RateLimitConfig> = {}
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const finalConfig = { ...defaultConfig, ...config };
  
  // Generate rate limit key
  const key = userId ? `user:${userId}` : `ip:${ip}`;
  const now = Date.now();
  
  // Get current rate limit data
  let rateLimitData = rateLimitStore.get(key);
  
  // Reset if window has expired
  if (!rateLimitData || now > rateLimitData.resetTime) {
    rateLimitData = {
      count: 0,
      resetTime: now + finalConfig.windowMs,
    };
    rateLimitStore.set(key, rateLimitData);
  }
  
  // Check if limit exceeded
  if (rateLimitData.count >= finalConfig.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: rateLimitData.resetTime,
    };
  }
  
  // Increment counter
  rateLimitData.count++;
  rateLimitStore.set(key, rateLimitData);
  
  return {
    allowed: true,
    remaining: finalConfig.maxRequests - rateLimitData.count,
    resetTime: rateLimitData.resetTime,
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Rate limit configurations for different actions
export const RATE_LIMITS = {
  VOTE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 votes per minute
  },
  CREATE_POLL: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 polls per hour
  },
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  },
} as const;
