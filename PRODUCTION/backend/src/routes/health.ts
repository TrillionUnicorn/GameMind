/**
 * Health Check Routes
 * System health and status endpoints
 */

import { Hono } from 'hono';
import { testConnection } from '../db';
import { getEnv } from '../config/env';

const health = new Hono();

/**
 * GET /health
 * Basic health check
 */
health.get('/', async (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /health/detailed
 * Detailed health check with dependencies
 */
health.get('/detailed', async (c) => {
  const env = getEnv();
  const startTime = Date.now();

  // Check database connection
  const dbHealthy = await testConnection();

  const responseTime = Date.now() - startTime;

  const health = {
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: `${responseTime}ms`,
    environment: env.NODE_ENV,
    version: '1.0.0',
    dependencies: {
      database: {
        status: dbHealthy ? 'connected' : 'disconnected',
        type: 'PostgreSQL',
      },
      supabase: {
        status: env.SUPABASE_URL ? 'configured' : 'not configured',
      },
      stripe: {
        status: env.STRIPE_SECRET_KEY ? 'configured' : 'not configured',
      },
    },
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
    },
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  return c.json(health, statusCode);
});

/**
 * GET /health/ready
 * Readiness probe (for Kubernetes)
 */
health.get('/ready', async (c) => {
  const dbHealthy = await testConnection();

  if (!dbHealthy) {
    return c.json({
      status: 'not ready',
      reason: 'Database connection failed',
    }, 503);
  }

  return c.json({
    status: 'ready',
  });
});

/**
 * GET /health/live
 * Liveness probe (for Kubernetes)
 */
health.get('/live', (c) => {
  return c.json({
    status: 'alive',
  });
});

export default health;

