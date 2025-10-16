/**
 * API Response Caching Middleware
 * In-memory cache for frequently accessed data
 */

import { Context, Next } from 'hono';
import { logger } from '../config/logger';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class Cache {
  private store: Map<string, CacheEntry> = new Map();
  private maxSize: number = 1000; // Maximum cache entries

  set(key: string, data: any, ttl: number = 300000) { // Default 5 minutes
    // Implement LRU eviction if cache is full
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      this.store.delete(firstKey);
    }

    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    logger.debug('Cache SET', { key, ttl });
  }

  get(key: string): any | null {
    const entry = this.store.get(key);

    if (!entry) {
      logger.debug('Cache MISS', { key });
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      logger.debug('Cache EXPIRED', { key });
      return null;
    }

    logger.debug('Cache HIT', { key });
    return entry.data;
  }

  delete(key: string) {
    this.store.delete(key);
    logger.debug('Cache DELETE', { key });
  }

  clear() {
    this.store.clear();
    logger.info('Cache CLEARED');
  }

  // Delete all keys matching a pattern
  deletePattern(pattern: string) {
    const regex = new RegExp(pattern);
    let count = 0;

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }

    logger.info('Cache PATTERN DELETE', { pattern, count });
  }

  getStats() {
    return {
      size: this.store.size,
      maxSize: this.maxSize,
    };
  }
}

export const cache = new Cache();

/**
 * Cache middleware for GET requests
 * Usage: app.get('/api/endpoint', cacheMiddleware(300000), handler)
 */
export function cacheMiddleware(ttl: number = 300000) {
  return async (c: Context, next: Next) => {
    // Only cache GET requests
    if (c.req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `${c.req.url}`;

    // Try to get from cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      c.header('X-Cache', 'HIT');
      return c.json(cachedData);
    }

    // Continue to handler
    await next();

    // Cache the response if successful
    const response = await c.res.clone();
    if (response.status === 200) {
      const data = await response.json();
      cache.set(cacheKey, data, ttl);
      c.header('X-Cache', 'MISS');
    }
  };
}

/**
 * Invalidate cache for specific patterns
 * Call this after data mutations
 */
export function invalidateCache(pattern: string) {
  cache.deletePattern(pattern);
}

/**
 * Cache helper for manual caching
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  // Try cache first
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function
  const result = await fn();

  // Cache result
  cache.set(key, result, ttl);

  return result;
}

