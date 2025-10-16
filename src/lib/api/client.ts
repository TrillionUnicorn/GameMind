/**
 * API Client
 * Production-ready API client with authentication, error handling, and type safety
 */

import { goto } from '$app/navigation';
import { browser } from '$app/environment';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  role: string;
  tier: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface GameData {
  gameType: 'chess' | 'mahjong' | 'go';
  mode: 'ai' | 'multiplayer' | 'puzzle' | 'tournament';
  difficulty?: 'easy' | 'medium' | 'hard';
  result: 'win' | 'loss' | 'draw' | 'abandoned';
  moves: any[];
  finalPosition?: any;
  duration?: number;
  isRated?: boolean;
  isPublic?: boolean;
}

export interface GameStats {
  totalGamesPlayed: number;
  totalWins: number;
  winRate: string;
  winStreak: number;
  bestWinStreak: number;
  chess: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    rating: number;
    bestRating: number;
    winRate: string;
  };
  mahjong: {
    gamesPlayed: number;
    wins: number;
    rating: number;
  };
  go: {
    gamesPlayed: number;
    wins: number;
    rating: number;
  };
}

export interface Subscription {
  tier: 'pro' | 'master';
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
}

class APIClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokens();
  }

  private loadTokens() {
    if (browser) {
      this.token = localStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token');
    }
  }

  private saveTokens(session: Session) {
    if (browser) {
      localStorage.setItem('access_token', session.accessToken);
      localStorage.setItem('refresh_token', session.refreshToken);
      this.token = session.accessToken;
      this.refreshToken = session.refreshToken;
    }
  }

  private clearTokens() {
    if (browser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      this.token = null;
      this.refreshToken = null;
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle 401 - try to refresh token
      if (response.status === 401 && this.refreshToken && endpoint !== '/api/auth/refresh') {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${this.token}`;
          const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers,
          });
          return this.handleResponse<T>(retryResponse);
        } else {
          // Refresh failed, redirect to login
          this.clearTokens();
          if (browser) {
            goto('/login');
          }
          throw new Error('Session expired. Please login again.');
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }

    return data;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const data = await this.request<{ session: Session }>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      this.saveTokens(data.session);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Auth methods
  async register(email: string, password: string, name: string, username?: string) {
    const data = await this.request<{ message: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, username }),
    });
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ message: string; user: User; session: Session }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    this.saveTokens(data.session);
    return data;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.clearTokens();
      if (browser) {
        goto('/login');
      }
    }
  }

  async getMe() {
    return this.request<{ user: User }>('/api/auth/me');
  }

  async resetPassword(email: string) {
    return this.request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async updatePassword(password: string) {
    return this.request<{ message: string }>('/api/auth/update-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  // User methods
  async getUserProfile() {
    return this.request<{ user: User; profile: any; stats: GameStats }>('/api/users/me');
  }

  async updateProfile(data: Partial<User>) {
    return this.request<{ message: string }>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updatePreferences(preferences: any) {
    return this.request<{ message: string }>('/api/users/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }

  async deleteAccount() {
    return this.request<{ message: string }>('/api/users/me', {
      method: 'DELETE',
    });
  }

  async getPublicProfile(userId: string) {
    return this.request<{ user: User; profile: any; stats: GameStats }>(`/api/users/${userId}`);
  }

  async searchUsers(query: string, limit = 10) {
    return this.request<{ users: User[] }>(`/api/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getLeaderboard(gameType = 'chess', limit = 100) {
    return this.request<{ leaderboard: any[] }>(`/api/users/leaderboard?game=${gameType}&limit=${limit}`);
  }

  // Game methods
  async saveGame(gameData: GameData) {
    return this.request<{ message: string; game: any }>('/api/games', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  async getGames(page = 1, limit = 20, gameType?: string) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (gameType) params.append('gameType', gameType);
    return this.request<{ games: any[]; pagination: any }>(`/api/games?${params}`);
  }

  async getGame(gameId: string) {
    return this.request<{ game: any }>(`/api/games/${gameId}`);
  }

  async deleteGame(gameId: string) {
    return this.request<{ message: string }>(`/api/games/${gameId}`, {
      method: 'DELETE',
    });
  }

  async getStats() {
    return this.request<{ stats: GameStats }>('/api/games/stats/summary');
  }

  // Payment methods
  async createCheckoutSession(tier: 'pro' | 'master', successUrl?: string, cancelUrl?: string) {
    return this.request<{ sessionId: string; url: string }>('/api/payments/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ tier, successUrl, cancelUrl }),
    });
  }

  async createPortalSession() {
    return this.request<{ url: string }>('/api/payments/create-portal-session', {
      method: 'POST',
    });
  }

  async getSubscription() {
    return this.request<{ subscription: Subscription | null }>('/api/payments/subscription');
  }

  // Helper methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const api = new APIClient(API_URL);

