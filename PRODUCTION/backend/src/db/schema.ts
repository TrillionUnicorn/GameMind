/**
 * Database Schema
 * PostgreSQL schema using Drizzle ORM
 */

import { pgTable, serial, text, timestamp, integer, boolean, jsonb, decimal, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  username: text('username').unique(),
  avatarUrl: text('avatar_url'),
  supabaseId: text('supabase_id').notNull().unique(),
  role: text('role').notNull().default('user'), // 'user', 'admin', 'moderator'
  tier: text('tier').notNull().default('free'), // 'free', 'pro', 'master'
  isEmailVerified: boolean('is_email_verified').default(false),
  isBanned: boolean('is_banned').default(false),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User profiles (extended user data)
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  bio: text('bio'),
  country: text('country'),
  timezone: text('timezone'),
  language: text('language').default('en'),
  theme: text('theme').default('dark'), // 'light', 'dark', 'auto'
  emailNotifications: boolean('email_notifications').default(true),
  pushNotifications: boolean('push_notifications').default(true),
  publicProfile: boolean('public_profile').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Games table
export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  gameType: text('game_type').notNull(), // 'chess', 'mahjong', 'go'
  mode: text('mode').notNull(), // 'ai', 'multiplayer', 'puzzle', 'tournament'
  difficulty: text('difficulty'), // 'easy', 'medium', 'hard' (for AI games)
  result: text('result').notNull(), // 'win', 'loss', 'draw', 'abandoned'
  moves: jsonb('moves').notNull(), // Array of moves
  finalPosition: jsonb('final_position'), // Final board state
  duration: integer('duration'), // Duration in seconds
  rating: integer('rating'), // ELO rating at time of game
  ratingChange: integer('rating_change'), // Rating change after game
  opponentId: integer('opponent_id').references(() => users.id), // For multiplayer
  tournamentId: integer('tournament_id'), // For tournament games
  isRated: boolean('is_rated').default(true),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// User statistics
export const userStats = pgTable('user_stats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  
  // Chess stats
  chessGamesPlayed: integer('chess_games_played').default(0),
  chessWins: integer('chess_wins').default(0),
  chessLosses: integer('chess_losses').default(0),
  chessDraws: integer('chess_draws').default(0),
  chessRating: integer('chess_rating').default(1200),
  chessBestRating: integer('chess_best_rating').default(1200),
  
  // Mahjong stats
  mahjongGamesPlayed: integer('mahjong_games_played').default(0),
  mahjongWins: integer('mahjong_wins').default(0),
  mahjongRating: integer('mahjong_rating').default(1200),
  
  // Go stats
  goGamesPlayed: integer('go_games_played').default(0),
  goWins: integer('go_wins').default(0),
  goRating: integer('go_rating').default(1200),
  
  // Overall stats
  totalGamesPlayed: integer('total_games_played').default(0),
  totalWins: integer('total_wins').default(0),
  winStreak: integer('win_streak').default(0),
  bestWinStreak: integer('best_win_streak').default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  tier: text('tier').notNull(), // 'pro', 'master'
  status: text('status').notNull(), // 'active', 'canceled', 'past_due', 'unpaid'
  stripeCustomerId: text('stripe_customer_id').notNull(),
  stripeSubscriptionId: text('stripe_subscription_id').notNull(),
  stripePriceId: text('stripe_price_id').notNull(),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: timestamp('canceled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payments table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  subscriptionId: integer('subscription_id').references(() => subscriptions.id),
  stripePaymentIntentId: text('stripe_payment_intent_id').notNull().unique(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('usd'),
  status: text('status').notNull(), // 'succeeded', 'failed', 'pending', 'refunded'
  description: text('description'),
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Achievements table
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon'),
  category: text('category').notNull(), // 'games', 'wins', 'streaks', 'special'
  requirement: jsonb('requirement').notNull(), // Criteria for unlocking
  points: integer('points').default(0),
  isSecret: boolean('is_secret').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User achievements (junction table)
export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  achievementId: integer('achievement_id').references(() => achievements.id).notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});

// Friends table
export const friends = pgTable('friends', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  friendId: integer('friend_id').references(() => users.id).notNull(),
  status: text('status').notNull(), // 'pending', 'accepted', 'blocked'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
});

// Tournaments table
export const tournaments = pgTable('tournaments', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').defaultRandom().notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  gameType: text('game_type').notNull(), // 'chess', 'mahjong', 'go'
  format: text('format').notNull(), // 'single_elimination', 'double_elimination', 'round_robin'
  maxPlayers: integer('max_players').notNull(),
  currentPlayers: integer('current_players').default(0),
  status: text('status').notNull(), // 'upcoming', 'registration', 'in_progress', 'completed', 'canceled'
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  prizePool: decimal('prize_pool', { precision: 10, scale: 2 }),
  entryFee: decimal('entry_fee', { precision: 10, scale: 2 }).default('0'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tournament participants
export const tournamentParticipants = pgTable('tournament_participants', {
  id: serial('id').primaryKey(),
  tournamentId: integer('tournament_id').references(() => tournaments.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  seed: integer('seed'),
  placement: integer('placement'),
  isEliminated: boolean('is_eliminated').default(false),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // 'friend_request', 'game_invite', 'achievement', 'tournament', 'system'
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: jsonb('data'), // Additional data
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  stats: one(userStats, {
    fields: [users.id],
    references: [userStats.userId],
  }),
  games: many(games),
  subscription: one(subscriptions),
  achievements: many(userAchievements),
  friends: many(friends),
  notifications: many(notifications),
}));

export const gamesRelations = relations(games, ({ one }) => ({
  user: one(users, {
    fields: [games.userId],
    references: [users.id],
  }),
  opponent: one(users, {
    fields: [games.opponentId],
    references: [users.id],
  }),
}));

