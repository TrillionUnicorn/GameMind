/**
 * Monitoring & Error Tracking Configuration
 * Sentry integration for production error tracking
 */

import * as Sentry from '@sentry/bun';
import { env } from './env';

export function initializeMonitoring() {
  if (env.NODE_ENV === 'production' && env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of transactions in production
      
      // Set sampling rate for profiling
      profilesSampleRate: 1.0,
      
      // Release tracking
      release: env.APP_VERSION || '1.0.0',
      
      // Additional context
      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['cookie'];
          }
        }
        
        return event;
      },
      
      // Integrations
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.OnUncaughtException(),
        new Sentry.Integrations.OnUnhandledRejection(),
      ],
    });

    console.log('✅ Sentry monitoring initialized');
  } else {
    console.log('ℹ️  Sentry monitoring disabled (development mode)');
  }
}

// Helper function to capture errors
export function captureError(error: Error, context?: Record<string, any>) {
  if (env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error:', error, context);
  }
}

// Helper function to capture messages
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level.toUpperCase()}]`, message);
  }
}

// Helper function to add breadcrumb
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

// Helper function to set user context
export function setUserContext(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

// Helper function to clear user context
export function clearUserContext() {
  Sentry.setUser(null);
}

// Performance monitoring
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  });
}

