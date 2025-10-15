/**
 * User Routes
 * User profile management and operations
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { users, userProfiles, userStats } from '../db/schema';
import { eq, and, or, like, desc } from 'drizzle-orm';
import { requireAuth, requireRole } from '../middleware/auth';
import { NotFoundError, ForbiddenError, ConflictError } from '../middleware/error-handler';

const userRoutes = new Hono();

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(500).optional(),
  country: z.string().max(2).optional(),
  timezone: z.string().optional(),
  language: z.string().max(5).optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
});

const updatePreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  publicProfile: z.boolean().optional(),
});

/**
 * GET /api/users/me
 * Get current user's full profile
 */
userRoutes.get('/me', requireAuth(), async (c) => {
  const currentUser = c.get('user');

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, currentUser.id))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .limit(1);

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
    profile: profile || {},
    stats: stats || {},
  });
});

/**
 * PATCH /api/users/me
 * Update current user's profile
 */
userRoutes.patch('/me', requireAuth(), async (c) => {
  const currentUser = c.get('user');
  const body = await c.req.json();
  const data = updateProfileSchema.parse(body);

  // Check if username is being changed and if it's available
  if (data.username) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.username, data.username),
        eq(users.id, currentUser.id) // Not the current user
      ))
      .limit(1);

    if (existingUser) {
      throw new ConflictError('Username already taken');
    }
  }

  // Update user table
  const userUpdates: any = {};
  if (data.name) userUpdates.name = data.name;
  if (data.username) userUpdates.username = data.username;
  userUpdates.updatedAt = new Date();

  if (Object.keys(userUpdates).length > 1) { // More than just updatedAt
    await db
      .update(users)
      .set(userUpdates)
      .where(eq(users.id, currentUser.id));
  }

  // Update profile table
  const profileUpdates: any = {};
  if (data.bio !== undefined) profileUpdates.bio = data.bio;
  if (data.country) profileUpdates.country = data.country;
  if (data.timezone) profileUpdates.timezone = data.timezone;
  if (data.language) profileUpdates.language = data.language;
  if (data.theme) profileUpdates.theme = data.theme;
  profileUpdates.updatedAt = new Date();

  if (Object.keys(profileUpdates).length > 1) {
    await db
      .update(userProfiles)
      .set(profileUpdates)
      .where(eq(userProfiles.userId, currentUser.id));
  }

  return c.json({
    message: 'Profile updated successfully',
  });
});

/**
 * PATCH /api/users/me/preferences
 * Update user preferences
 */
userRoutes.patch('/me/preferences', requireAuth(), async (c) => {
  const currentUser = c.get('user');
  const body = await c.req.json();
  const data = updatePreferencesSchema.parse(body);

  const updates: any = { ...data, updatedAt: new Date() };

  await db
    .update(userProfiles)
    .set(updates)
    .where(eq(userProfiles.userId, currentUser.id));

  return c.json({
    message: 'Preferences updated successfully',
  });
});

/**
 * DELETE /api/users/me
 * Delete current user's account
 */
userRoutes.delete('/me', requireAuth(), async (c) => {
  const currentUser = c.get('user');

  // Soft delete by marking as banned
  await db
    .update(users)
    .set({ 
      isBanned: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, currentUser.id));

  // TODO: Delete from Supabase Auth
  // TODO: Cancel subscriptions
  // TODO: Delete user data (GDPR compliance)

  return c.json({
    message: 'Account deleted successfully',
  });
});

/**
 * GET /api/users/:id
 * Get public user profile by ID
 */
userRoutes.get('/:id', async (c) => {
  const userId = c.req.param('id');

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.uuid, userId))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, user.id))
    .limit(1);

  // Check if profile is public
  if (profile && !profile.publicProfile) {
    throw new ForbiddenError('This profile is private');
  }

  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .limit(1);

  return c.json({
    user: {
      id: user.uuid,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    },
    profile: {
      bio: profile?.bio,
      country: profile?.country,
    },
    stats: stats || {},
  });
});

/**
 * GET /api/users/search
 * Search users by name or username
 */
userRoutes.get('/search', async (c) => {
  const query = c.req.query('q');
  const limit = parseInt(c.req.query('limit') || '10');

  if (!query || query.length < 2) {
    return c.json({ users: [] });
  }

  const searchResults = await db
    .select({
      id: users.uuid,
      name: users.name,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(
      and(
        eq(users.isBanned, false),
        or(
          like(users.name, `%${query}%`),
          like(users.username, `%${query}%`)
        )
      )
    )
    .limit(Math.min(limit, 50));

  return c.json({ users: searchResults });
});

/**
 * GET /api/users/leaderboard
 * Get top players leaderboard
 */
userRoutes.get('/leaderboard', async (c) => {
  const gameType = c.req.query('game') || 'chess';
  const limit = parseInt(c.req.query('limit') || '100');

  let orderBy;
  switch (gameType) {
    case 'chess':
      orderBy = desc(userStats.chessRating);
      break;
    case 'mahjong':
      orderBy = desc(userStats.mahjongRating);
      break;
    case 'go':
      orderBy = desc(userStats.goRating);
      break;
    default:
      orderBy = desc(userStats.chessRating);
  }

  const leaderboard = await db
    .select({
      user: {
        id: users.uuid,
        name: users.name,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
      stats: userStats,
    })
    .from(userStats)
    .innerJoin(users, eq(users.id, userStats.userId))
    .where(eq(users.isBanned, false))
    .orderBy(orderBy)
    .limit(Math.min(limit, 100));

  return c.json({ leaderboard });
});

/**
 * GET /api/users (Admin only)
 * Get all users with pagination
 */
userRoutes.get('/', requireAuth(), requireRole('admin'), async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = (page - 1) * limit;

  const allUsers = await db
    .select()
    .from(users)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(users.createdAt));

  return c.json({
    users: allUsers,
    pagination: {
      page,
      limit,
    },
  });
});

/**
 * PATCH /api/users/:id/ban (Admin only)
 * Ban/unban a user
 */
userRoutes.patch('/:id/ban', requireAuth(), requireRole('admin'), async (c) => {
  const userId = c.req.param('id');
  const body = await c.req.json();
  const { banned } = body;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.uuid, userId))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  await db
    .update(users)
    .set({ 
      isBanned: banned,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return c.json({
    message: banned ? 'User banned successfully' : 'User unbanned successfully',
  });
});

export default userRoutes;

