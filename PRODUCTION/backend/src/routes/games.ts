/**
 * Games Routes
 * Game history, statistics, and management
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db';
import { games, userStats } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { NotFoundError, ForbiddenError } from '../middleware/error-handler';

const gameRoutes = new Hono();

// Validation schemas
const createGameSchema = z.object({
  gameType: z.enum(['chess', 'mahjong', 'go']),
  mode: z.enum(['ai', 'multiplayer', 'puzzle', 'tournament']),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  moves: z.array(z.any()),
  finalPosition: z.any().optional(),
  duration: z.number().int().positive().optional(),
  result: z.enum(['win', 'loss', 'draw', 'abandoned']),
  opponentId: z.string().uuid().optional(),
  tournamentId: z.number().int().optional(),
  isRated: z.boolean().default(true),
  isPublic: z.boolean().default(true),
});

/**
 * POST /api/games
 * Create a new game record
 */
gameRoutes.post('/', requireAuth(), async (c) => {
  const currentUser = c.get('user');
  const body = await c.req.json();
  const data = createGameSchema.parse(body);

  // Calculate rating change (simplified ELO)
  let ratingChange = 0;
  if (data.isRated && data.mode === 'ai') {
    const baseChange = 20;
    if (data.result === 'win') {
      ratingChange = data.difficulty === 'hard' ? baseChange * 2 : 
                     data.difficulty === 'medium' ? baseChange : 
                     baseChange / 2;
    } else if (data.result === 'loss') {
      ratingChange = data.difficulty === 'easy' ? -baseChange * 2 : 
                     data.difficulty === 'medium' ? -baseChange : 
                     -baseChange / 2;
    }
  }

  // Get current rating
  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, currentUser.id))
    .limit(1);

  const currentRating = stats ? 
    (data.gameType === 'chess' ? stats.chessRating :
     data.gameType === 'mahjong' ? stats.mahjongRating :
     stats.goRating) : 1200;

  // Create game record
  const [game] = await db
    .insert(games)
    .values({
      userId: currentUser.id,
      gameType: data.gameType,
      mode: data.mode,
      difficulty: data.difficulty,
      result: data.result,
      moves: data.moves,
      finalPosition: data.finalPosition,
      duration: data.duration,
      rating: currentRating,
      ratingChange,
      isRated: data.isRated,
      isPublic: data.isPublic,
      completedAt: new Date(),
    })
    .returning();

  // Update user statistics
  await updateUserStats(currentUser.id, data.gameType, data.result, ratingChange);

  return c.json({
    message: 'Game saved successfully',
    game: {
      id: game.uuid,
      gameType: game.gameType,
      result: game.result,
      ratingChange,
      createdAt: game.createdAt,
    },
  }, 201);
});

/**
 * GET /api/games
 * Get current user's game history
 */
gameRoutes.get('/', requireAuth(), async (c) => {
  const currentUser = c.get('user');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const gameType = c.req.query('gameType');
  const offset = (page - 1) * limit;

  let query = db
    .select()
    .from(games)
    .where(eq(games.userId, currentUser.id));

  if (gameType) {
    query = query.where(and(
      eq(games.userId, currentUser.id),
      eq(games.gameType, gameType)
    ));
  }

  const userGames = await query
    .orderBy(desc(games.createdAt))
    .limit(limit)
    .offset(offset);

  return c.json({
    games: userGames.map(game => ({
      id: game.uuid,
      gameType: game.gameType,
      mode: game.mode,
      difficulty: game.difficulty,
      result: game.result,
      duration: game.duration,
      rating: game.rating,
      ratingChange: game.ratingChange,
      createdAt: game.createdAt,
      completedAt: game.completedAt,
    })),
    pagination: {
      page,
      limit,
      hasMore: userGames.length === limit,
    },
  });
});

/**
 * GET /api/games/:id
 * Get specific game details
 */
gameRoutes.get('/:id', optionalAuth(), async (c) => {
  const gameId = c.req.param('id');
  const currentUser = c.get('user');

  const [game] = await db
    .select()
    .from(games)
    .where(eq(games.uuid, gameId))
    .limit(1);

  if (!game) {
    throw new NotFoundError('Game not found');
  }

  // Check if user has permission to view
  if (!game.isPublic && (!currentUser || game.userId !== currentUser.id)) {
    throw new ForbiddenError('This game is private');
  }

  return c.json({
    game: {
      id: game.uuid,
      gameType: game.gameType,
      mode: game.mode,
      difficulty: game.difficulty,
      result: game.result,
      moves: game.moves,
      finalPosition: game.finalPosition,
      duration: game.duration,
      rating: game.rating,
      ratingChange: game.ratingChange,
      isRated: game.isRated,
      createdAt: game.createdAt,
      completedAt: game.completedAt,
    },
  });
});

/**
 * DELETE /api/games/:id
 * Delete a game
 */
gameRoutes.delete('/:id', requireAuth(), async (c) => {
  const gameId = c.req.param('id');
  const currentUser = c.get('user');

  const [game] = await db
    .select()
    .from(games)
    .where(eq(games.uuid, gameId))
    .limit(1);

  if (!game) {
    throw new NotFoundError('Game not found');
  }

  // Check ownership
  if (game.userId !== currentUser.id) {
    throw new ForbiddenError('You can only delete your own games');
  }

  await db
    .delete(games)
    .where(eq(games.id, game.id));

  return c.json({
    message: 'Game deleted successfully',
  });
});

/**
 * GET /api/games/stats/summary
 * Get user's game statistics summary
 */
gameRoutes.get('/stats/summary', requireAuth(), async (c) => {
  const currentUser = c.get('user');

  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, currentUser.id))
    .limit(1);

  if (!stats) {
    return c.json({
      stats: {
        totalGamesPlayed: 0,
        totalWins: 0,
        winRate: 0,
        chess: { gamesPlayed: 0, wins: 0, rating: 1200 },
        mahjong: { gamesPlayed: 0, wins: 0, rating: 1200 },
        go: { gamesPlayed: 0, wins: 0, rating: 1200 },
      },
    });
  }

  return c.json({
    stats: {
      totalGamesPlayed: stats.totalGamesPlayed,
      totalWins: stats.totalWins,
      winRate: stats.totalGamesPlayed > 0 ? 
        (stats.totalWins / stats.totalGamesPlayed * 100).toFixed(1) : 0,
      winStreak: stats.winStreak,
      bestWinStreak: stats.bestWinStreak,
      chess: {
        gamesPlayed: stats.chessGamesPlayed,
        wins: stats.chessWins,
        losses: stats.chessLosses,
        draws: stats.chessDraws,
        rating: stats.chessRating,
        bestRating: stats.chessBestRating,
        winRate: stats.chessGamesPlayed > 0 ?
          (stats.chessWins / stats.chessGamesPlayed * 100).toFixed(1) : 0,
      },
      mahjong: {
        gamesPlayed: stats.mahjongGamesPlayed,
        wins: stats.mahjongWins,
        rating: stats.mahjongRating,
      },
      go: {
        gamesPlayed: stats.goGamesPlayed,
        wins: stats.goWins,
        rating: stats.goRating,
      },
    },
  });
});

/**
 * Helper function to update user statistics
 */
async function updateUserStats(
  userId: number,
  gameType: string,
  result: string,
  ratingChange: number
) {
  const [stats] = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (!stats) return;

  const updates: any = {
    totalGamesPlayed: stats.totalGamesPlayed + 1,
    updatedAt: new Date(),
  };

  // Update game-specific stats
  if (gameType === 'chess') {
    updates.chessGamesPlayed = stats.chessGamesPlayed + 1;
    updates.chessRating = Math.max(0, stats.chessRating + ratingChange);
    updates.chessBestRating = Math.max(stats.chessBestRating, updates.chessRating);
    
    if (result === 'win') {
      updates.chessWins = stats.chessWins + 1;
      updates.totalWins = stats.totalWins + 1;
      updates.winStreak = stats.winStreak + 1;
      updates.bestWinStreak = Math.max(stats.bestWinStreak, updates.winStreak);
    } else if (result === 'loss') {
      updates.chessLosses = stats.chessLosses + 1;
      updates.winStreak = 0;
    } else if (result === 'draw') {
      updates.chessDraws = stats.chessDraws + 1;
      updates.winStreak = 0;
    }
  } else if (gameType === 'mahjong') {
    updates.mahjongGamesPlayed = stats.mahjongGamesPlayed + 1;
    updates.mahjongRating = Math.max(0, stats.mahjongRating + ratingChange);
    
    if (result === 'win') {
      updates.mahjongWins = stats.mahjongWins + 1;
      updates.totalWins = stats.totalWins + 1;
      updates.winStreak = stats.winStreak + 1;
      updates.bestWinStreak = Math.max(stats.bestWinStreak, updates.winStreak);
    } else {
      updates.winStreak = 0;
    }
  } else if (gameType === 'go') {
    updates.goGamesPlayed = stats.goGamesPlayed + 1;
    updates.goRating = Math.max(0, stats.goRating + ratingChange);
    
    if (result === 'win') {
      updates.goWins = stats.goWins + 1;
      updates.totalWins = stats.totalWins + 1;
      updates.winStreak = stats.winStreak + 1;
      updates.bestWinStreak = Math.max(stats.bestWinStreak, updates.winStreak);
    } else {
      updates.winStreak = 0;
    }
  }

  await db
    .update(userStats)
    .set(updates)
    .where(eq(userStats.userId, userId));
}

export default gameRoutes;

