/**
 * Rate Limiter Middleware
 * Prevents abuse by limiting requests per IP
 */

import type { Context, Next } from 'hono';
import { TooManyRequestsError } from './error-handler';

interface RateLimiterOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// In-memory store (use Redis in production for distributed systems)
const store = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (c: Context, next: Next) => {
    // Get client IP
    const ip = c.req.header('x-forwarded-for') || 
               c.req.header('x-real-ip') || 
               'unknown';

    const now = Date.now();
    const key = `ratelimit:${ip}:${c.req.path}`;

    // Get or create rate limit data
    let data = store.get(key);

    if (!data || now > data.resetTime) {
      // Create new window
      data = {
        count: 0,
        resetTime: now + windowMs,
      };
      store.set(key, data);
    }

    // Increment counter
    data.count++;

    // Set rate limit headers
    c.header('X-RateLimit-Limit', max.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, max - data.count).toString());
    c.header('X-RateLimit-Reset', new Date(data.resetTime).toISOString());

    // Check if limit exceeded
    if (data.count > max) {
      throw new TooManyRequestsError(message);
    }

    // Continue to next middleware
    await next();

    // Update count based on response status
    const status = c.res.status;
    if (skipSuccessfulRequests && status < 400) {
      data.count--;
    }
    if (skipFailedRequests && status >= 400) {
      data.count--;
    }
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of store.entries()) {
    if (now > data.resetTime) {
      store.delete(key);
    }
  }
}, 60000); // Clean up every minute

