/**
 * Request Logger Middleware
 * Logs all incoming requests with timing information
 */

import type { Context, Next } from 'hono';
import { nanoid } from 'nanoid';

export function requestLogger() {
  return async (c: Context, next: Next) => {
    const requestId = nanoid(10);
    const startTime = Date.now();

    // Add request ID to context
    c.set('requestId', requestId);
    c.header('X-Request-Id', requestId);

    // Log request
    console.log(`→ ${c.req.method} ${c.req.path}`, {
      requestId,
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
      userAgent: c.req.header('user-agent'),
    });

    // Continue to next middleware
    await next();

    // Calculate duration
    const duration = Date.now() - startTime;

    // Log response
    console.log(`← ${c.req.method} ${c.req.path} ${c.res.status}`, {
      requestId,
      duration: `${duration}ms`,
      status: c.res.status,
    });
  };
}

