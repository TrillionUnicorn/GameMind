/**
 * Authentication Routes
 * Handles user registration, login, password reset, etc.
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../config/env';
import { db } from '../db';
import { users, userProfiles, userStats } from '../db/schema';
import { eq } from 'drizzle-orm';
import { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } from '../middleware/error-handler';
import { requireAuth } from '../middleware/auth';

const env = getEnv();
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

const auth = new Hono();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
auth.post('/register', async (c) => {
  const body = await c.req.json();
  const data = registerSchema.parse(body);

  // Check if email already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Check if username already exists
  if (data.username) {
    const [existingUsername] = await db
      .select()
      .from(users)
      .where(eq(users.username, data.username))
      .limit(1);

    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        username: data.username,
      },
    },
  });

  if (authError) {
    throw new BadRequestError(authError.message);
  }

  if (!authData.user) {
    throw new BadRequestError('Failed to create user');
  }

  // Create user in database
  const [newUser] = await db
    .insert(users)
    .values({
      email: data.email,
      name: data.name,
      username: data.username,
      supabaseId: authData.user.id,
      isEmailVerified: false,
    })
    .returning();

  // Create user profile
  await db.insert(userProfiles).values({
    userId: newUser.id,
  });

  // Create user stats
  await db.insert(userStats).values({
    userId: newUser.id,
  });

  return c.json({
    message: 'Registration successful. Please check your email to verify your account.',
    user: {
      id: newUser.uuid,
      email: newUser.email,
      name: newUser.name,
      username: newUser.username,
    },
  }, 201);
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
auth.post('/login', async (c) => {
  const body = await c.req.json();
  const data = loginSchema.parse(body);

  // Sign in with Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (authError) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!authData.user || !authData.session) {
    throw new UnauthorizedError('Login failed');
  }

  // Get user from database
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.supabaseId, authData.user.id))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check if user is banned
  if (user.isBanned) {
    throw new UnauthorizedError('Account has been banned');
  }

  // Update last login
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  return c.json({
    message: 'Login successful',
    user: {
      id: user.uuid,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      tier: user.tier,
    },
    session: {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresAt: authData.session.expires_at,
    },
  });
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
auth.post('/logout', requireAuth(), async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.substring(7);

  if (token) {
    await supabase.auth.signOut();
  }

  return c.json({
    message: 'Logout successful',
  });
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
auth.post('/refresh', async (c) => {
  const body = await c.req.json();
  const { refreshToken } = body;

  if (!refreshToken) {
    throw new BadRequestError('Refresh token is required');
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  return c.json({
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    },
  });
});

/**
 * POST /api/auth/reset-password
 * Request password reset email
 */
auth.post('/reset-password', async (c) => {
  const body = await c.req.json();
  const data = resetPasswordSchema.parse(body);

  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${env.FRONTEND_URL}/reset-password`,
  });

  if (error) {
    // Don't reveal if email exists
    console.error('Password reset error:', error);
  }

  return c.json({
    message: 'If an account exists with this email, you will receive a password reset link.',
  });
});

/**
 * POST /api/auth/update-password
 * Update password (requires valid reset token)
 */
auth.post('/update-password', requireAuth(), async (c) => {
  const body = await c.req.json();
  const data = updatePasswordSchema.parse(body);

  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (error) {
    throw new BadRequestError(error.message);
  }

  return c.json({
    message: 'Password updated successfully',
  });
});

/**
 * GET /api/auth/me
 * Get current user info
 */
auth.get('/me', requireAuth(), async (c) => {
  const currentUser = c.get('user');

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, currentUser.id))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return c.json({
    user: {
      id: user.uuid,
      email: user.email,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      role: user.role,
      tier: user.tier,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    },
  });
});

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
auth.post('/verify-email', async (c) => {
  const body = await c.req.json();
  const { token } = body;

  if (!token) {
    throw new BadRequestError('Verification token is required');
  }

  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'email',
  });

  if (error || !data.user) {
    throw new BadRequestError('Invalid or expired verification token');
  }

  // Update user in database
  await db
    .update(users)
    .set({ isEmailVerified: true })
    .where(eq(users.supabaseId, data.user.id));

  return c.json({
    message: 'Email verified successfully',
  });
});

export default auth;

