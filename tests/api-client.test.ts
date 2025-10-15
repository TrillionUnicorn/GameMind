/**
 * API Client Tests
 * Test the frontend API client
 */

import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { api } from '../src/lib/api/client';

// Mock fetch
global.fetch = mock(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({ success: true }),
}));

describe('API Client', () => {
  beforeEach(() => {
    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Authentication', () => {
    test('should register a new user', async () => {
      const mockResponse = {
        message: 'Registration successful',
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      global.fetch = mock(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }));

      const result = await api.register('test@example.com', 'password123', 'Test User');
      
      expect(result.message).toBe('Registration successful');
      expect(result.user.email).toBe('test@example.com');
    });

    test('should login and store tokens', async () => {
      const mockResponse = {
        message: 'Login successful',
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
        session: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresAt: Date.now() + 3600000,
        },
      };

      global.fetch = mock(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }));

      const result = await api.login('test@example.com', 'password123');
      
      expect(result.user.email).toBe('test@example.com');
      expect(result.session.accessToken).toBe('access-token');
      expect(api.isAuthenticated()).toBe(true);
    });

    test('should handle login errors', async () => {
      global.fetch = mock(() => Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          message: 'Invalid credentials',
        }),
      }));

      try {
        await api.login('test@example.com', 'wrongpassword');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('Invalid credentials');
      }
    });
  });

  describe('User Management', () => {
    test('should get user profile', async () => {
      const mockResponse = {
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
        profile: {
          bio: 'Test bio',
        },
        stats: {
          totalGamesPlayed: 10,
          totalWins: 5,
        },
      };

      global.fetch = mock(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }));

      const result = await api.getUserProfile();
      
      expect(result.user.email).toBe('test@example.com');
      expect(result.stats.totalGamesPlayed).toBe(10);
    });

    test('should update profile', async () => {
      const mockResponse = {
        message: 'Profile updated successfully',
      };

      global.fetch = mock(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }));

      const result = await api.updateProfile({
        name: 'Updated Name',
      });
      
      expect(result.message).toContain('updated successfully');
    });
  });

  describe('Game Management', () => {
    test('should save a game', async () => {
      const mockResponse = {
        message: 'Game saved successfully',
        game: {
          id: 'game-123',
          gameType: 'chess',
          result: 'win',
        },
      };

      global.fetch = mock(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }));

      const result = await api.saveGame({
        gameType: 'chess',
        mode: 'ai',
        difficulty: 'medium',
        result: 'win',
        moves: [],
        isRated: true,
        isPublic: true,
      });
      
      expect(result.message).toContain('saved successfully');
      expect(result.game.gameType).toBe('chess');
    });

    test('should get game history', async () => {
      const mockResponse = {
        games: [
          { id: '1', gameType: 'chess', result: 'win' },
          { id: '2', gameType: 'chess', result: 'loss' },
        ],
        pagination: {
          page: 1,
          limit: 20,
          hasMore: false,
        },
      };

      global.fetch = mock(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }));

      const result = await api.getGames(1, 20);
      
      expect(result.games.length).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    test('should get game statistics', async () => {
      const mockResponse = {
        stats: {
          totalGamesPlayed: 100,
          totalWins: 60,
          winRate: '60.0',
          chess: {
            gamesPlayed: 50,
            wins: 30,
            rating: 1500,
          },
        },
      };

      global.fetch = mock(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }));

      const result = await api.getStats();
      
      expect(result.stats.totalGamesPlayed).toBe(100);
      expect(result.stats.chess.rating).toBe(1500);
    });
  });

  describe('Payment Management', () => {
    test('should create checkout session', async () => {
      const mockResponse = {
        sessionId: 'session-123',
        url: 'https://checkout.stripe.com/session-123',
      };

      global.fetch = mock(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }));

      const result = await api.createCheckoutSession('pro');
      
      expect(result.sessionId).toBe('session-123');
      expect(result.url).toContain('stripe.com');
    });

    test('should get subscription', async () => {
      const mockResponse = {
        subscription: {
          tier: 'pro',
          status: 'active',
          currentPeriodEnd: '2024-12-31',
        },
      };

      global.fetch = mock(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }));

      const result = await api.getSubscription();
      
      expect(result.subscription?.tier).toBe('pro');
      expect(result.subscription?.status).toBe('active');
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      global.fetch = mock(() => Promise.reject(new Error('Network error')));

      try {
        await api.getMe();
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('Network error');
      }
    });

    test('should handle 404 errors', async () => {
      global.fetch = mock(() => Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({
          message: 'Not found',
        }),
      }));

      try {
        await api.getGame('nonexistent-id');
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toContain('Not found');
      }
    });
  });
});

