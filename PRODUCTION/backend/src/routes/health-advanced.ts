/**
 * Advanced Health Check Routes
 * Detailed system health monitoring
 */

import { Hono } from 'hono';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { performanceMonitor } from '../middleware/performance';
import { cache } from '../middleware/cache';
import { env } from '../config/env';

const health = new Hono();

/**
 * Basic health check
 * GET /health
 */
health.get('/', async (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Detailed health check
 * GET /health/detailed
 */
health.get('/detailed', async (c) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkMemory(),
    checkDisk(),
  ]);

  const [dbCheck, memCheck, diskCheck] = checks;

  const isHealthy = checks.every(check => check.status === 'fulfilled' && check.value.healthy);

  return c.json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: env.APP_VERSION || '1.0.0',
    environment: env.NODE_ENV,
    checks: {
      database: dbCheck.status === 'fulfilled' ? dbCheck.value : { healthy: false, error: 'Check failed' },
      memory: memCheck.status === 'fulfilled' ? memCheck.value : { healthy: false, error: 'Check failed' },
      disk: diskCheck.status === 'fulfilled' ? diskCheck.value : { healthy: false, error: 'Check failed' },
    },
  }, isHealthy ? 200 : 503);
});

/**
 * Readiness check (for Kubernetes)
 * GET /health/ready
 */
health.get('/ready', async (c) => {
  try {
    // Check if database is ready
    await db.execute(sql`SELECT 1`);
    
    return c.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Database not ready',
    }, 503);
  }
});

/**
 * Liveness check (for Kubernetes)
 * GET /health/live
 */
health.get('/live', async (c) => {
  return c.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * Performance metrics
 * GET /health/metrics
 */
health.get('/metrics', async (c) => {
  const metrics = performanceMonitor.getMetrics();
  const slowestEndpoints = performanceMonitor.getSlowestEndpoints(10);
  const cacheStats = cache.getStats();

  return c.json({
    performance: {
      totalRequests: metrics.totalRequests,
      averageDuration: Math.round(metrics.averageDuration),
      slowRequests: metrics.slowRequests,
      errorRequests: metrics.errorRequests,
      slowestEndpoints,
    },
    cache: cacheStats,
    memory: getMemoryUsage(),
    uptime: process.uptime(),
  });
});

/**
 * System info
 * GET /health/info
 */
health.get('/info', async (c) => {
  return c.json({
    version: env.APP_VERSION || '1.0.0',
    environment: env.NODE_ENV,
    runtime: 'Bun',
    runtimeVersion: Bun.version,
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Helper functions

async function checkDatabase() {
  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1`);
    const duration = Date.now() - start;

    // Get connection pool stats
    const poolStats = await db.execute(sql`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    return {
      healthy: true,
      responseTime: duration,
      connections: poolStats.rows[0],
    };
  } catch (error: any) {
    return {
      healthy: false,
      error: error.message,
    };
  }
}

function checkMemory() {
  const usage = process.memoryUsage();
  const totalMemory = usage.heapTotal;
  const usedMemory = usage.heapUsed;
  const memoryUsagePercent = (usedMemory / totalMemory) * 100;

  return {
    healthy: memoryUsagePercent < 90, // Alert if > 90%
    heapUsed: formatBytes(usedMemory),
    heapTotal: formatBytes(totalMemory),
    usagePercent: Math.round(memoryUsagePercent),
    rss: formatBytes(usage.rss),
    external: formatBytes(usage.external),
  };
}

function checkDisk() {
  // Note: Disk check would require additional libraries
  // For now, return a placeholder
  return {
    healthy: true,
    message: 'Disk check not implemented',
  };
}

function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    heapUsed: formatBytes(usage.heapUsed),
    heapTotal: formatBytes(usage.heapTotal),
    rss: formatBytes(usage.rss),
    external: formatBytes(usage.external),
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export default health;

