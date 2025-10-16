/**
 * Performance Monitoring Middleware
 * Track request duration and performance metrics
 */

import { Context, Next } from 'hono';
import { logger } from '../config/logger';
import { startTransaction } from '../config/monitoring';

interface PerformanceMetrics {
  totalRequests: number;
  totalDuration: number;
  averageDuration: number;
  slowRequests: number;
  errorRequests: number;
  requestsByEndpoint: Map<string, {
    count: number;
    totalDuration: number;
    averageDuration: number;
  }>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    totalRequests: 0,
    totalDuration: 0,
    averageDuration: 0,
    slowRequests: 0,
    errorRequests: 0,
    requestsByEndpoint: new Map(),
  };

  private slowRequestThreshold = 1000; // 1 second

  recordRequest(path: string, duration: number, statusCode: number) {
    // Update global metrics
    this.metrics.totalRequests++;
    this.metrics.totalDuration += duration;
    this.metrics.averageDuration = this.metrics.totalDuration / this.metrics.totalRequests;

    if (duration > this.slowRequestThreshold) {
      this.metrics.slowRequests++;
    }

    if (statusCode >= 400) {
      this.metrics.errorRequests++;
    }

    // Update endpoint-specific metrics
    const endpointMetrics = this.metrics.requestsByEndpoint.get(path) || {
      count: 0,
      totalDuration: 0,
      averageDuration: 0,
    };

    endpointMetrics.count++;
    endpointMetrics.totalDuration += duration;
    endpointMetrics.averageDuration = endpointMetrics.totalDuration / endpointMetrics.count;

    this.metrics.requestsByEndpoint.set(path, endpointMetrics);
  }

  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      requestsByEndpoint: new Map(this.metrics.requestsByEndpoint),
    };
  }

  getSlowestEndpoints(limit: number = 10) {
    return Array.from(this.metrics.requestsByEndpoint.entries())
      .sort((a, b) => b[1].averageDuration - a[1].averageDuration)
      .slice(0, limit)
      .map(([path, metrics]) => ({
        path,
        ...metrics,
      }));
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      totalDuration: 0,
      averageDuration: 0,
      slowRequests: 0,
      errorRequests: 0,
      requestsByEndpoint: new Map(),
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance monitoring middleware
 */
export async function performanceMiddleware(c: Context, next: Next) {
  const startTime = Date.now();
  const path = c.req.path;
  const method = c.req.method;

  // Start Sentry transaction
  const transaction = startTransaction(`${method} ${path}`, 'http.server');

  try {
    await next();
  } finally {
    const duration = Date.now() - startTime;
    const statusCode = c.res.status;

    // Record metrics
    performanceMonitor.recordRequest(path, duration, statusCode);

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow Request', {
        method,
        path,
        duration: `${duration}ms`,
        statusCode,
      });
    }

    // Log HTTP request
    logger.http(method, path, statusCode, duration, c.get('userId'));

    // Add performance header
    c.header('X-Response-Time', `${duration}ms`);

    // Finish Sentry transaction
    transaction.setHttpStatus(statusCode);
    transaction.finish();
  }
}

/**
 * Endpoint to get performance metrics
 */
export function getPerformanceMetrics() {
  return performanceMonitor.getMetrics();
}

/**
 * Endpoint to get slowest endpoints
 */
export function getSlowestEndpoints(limit: number = 10) {
  return performanceMonitor.getSlowestEndpoints(limit);
}

