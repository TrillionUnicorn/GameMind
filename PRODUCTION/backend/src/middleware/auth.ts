/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

import type { Context, Next } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../config/env';
import { UnauthorizedError, ForbiddenError } from './error-handler';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const env = getEnv();

// Create Supabase client
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export interface AuthUser {
  id: number;
  uuid: string;
  email: string;
  name: string;
  role: string;
  tier: string;
  supabaseId: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

/**
 * Require authentication
 * Verifies JWT token and loads user data
 */
export function requireAuth() {
  return async (c: Context, next: Next) => {
    // Get authorization header
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    // Extract token
    const token = authHeader.substring(7);

    try {
      // Verify token with Supabase
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

      if (error || !supabaseUser) {
        throw new UnauthorizedError('Invalid or expired token');
      }

      // Load user from database
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.supabaseId, supabaseUser.id))
        .limit(1);

      if (!dbUser) {
        throw new UnauthorizedError('User not found');
      }

      // Check if user is banned
      if (dbUser.isBanned) {
        throw new ForbiddenError('Account has been banned');
      }

      // Set user in context
      c.set('user', {
        id: dbUser.id,
        uuid: dbUser.uuid,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        tier: dbUser.tier,
        supabaseId: dbUser.supabaseId,
      });

      // Update last login time
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, dbUser.id));

      await next();
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new UnauthorizedError('Authentication failed');
    }
  };
}

/**
 * Require specific role
 */
export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    await next();
  };
}

/**
 * Require specific tier
 */
export function requireTier(...tiers: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!tiers.includes(user.tier)) {
      throw new ForbiddenError('Upgrade required to access this feature');
    }

    await next();
  };
}

/**
 * Optional authentication
 * Loads user if token is present, but doesn't require it
 */
export function optionalAuth() {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const { data: { user: supabaseUser } } = await supabase.auth.getUser(token);

        if (supabaseUser) {
          const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.supabaseId, supabaseUser.id))
            .limit(1);

          if (dbUser && !dbUser.isBanned) {
            c.set('user', {
              id: dbUser.id,
              uuid: dbUser.uuid,
              email: dbUser.email,
              name: dbUser.name,
              role: dbUser.role,
              tier: dbUser.tier,
              supabaseId: dbUser.supabaseId,
            });
          }
        }
      } catch (error) {
        // Ignore errors for optional auth
      }
    }

    await next();
  };
}

