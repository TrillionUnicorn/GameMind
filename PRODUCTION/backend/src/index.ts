/**
 * GameMind Production Backend
 * Main entry point for the API server
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { serve } from '@hono/node-server';

// Routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import gameRoutes from './routes/games';
import paymentRoutes from './routes/payments';
import healthRoutes from './routes/health';
import healthAdvancedRoutes from './routes/health-advanced';

// Middleware
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './middleware/rate-limiter';
import { requestLogger } from './middleware/request-logger';

// Environment validation
import { validateEnv } from './config/env';

// Monitoring
import { initializeMonitoring } from './config/monitoring';
import { logger as appLogger } from './config/logger';
import { performanceMiddleware } from './middleware/performance';

// Initialize app
const app = new Hono();

// Validate environment variables
validateEnv();

// Initialize monitoring
initializeMonitoring();
appLogger.info('GameMind Backend Starting', { version: '1.0.0' });

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use('*', performanceMiddleware);
app.use('*', requestLogger());

// CORS configuration
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
}));

// Rate limiting
app.use('*', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
}));

// Health check (no auth required)
app.route('/health', healthRoutes);
app.route('/health', healthAdvancedRoutes);

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/games', gameRoutes);
app.route('/api/payments', paymentRoutes);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'GameMind API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      games: '/api/games',
      payments: '/api/payments',
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
    path: c.req.path,
  }, 404);
});

// Global error handler
app.onError(errorHandler);

// Start server
const port = parseInt(process.env.PORT || '3000');

console.log(`🚀 GameMind API Server starting...`);
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Port: ${port}`);
console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`✅ Server running at http://localhost:${info.port}`);
});

export default app;

