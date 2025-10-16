/**
 * Authentication Store
 * Manages user authentication state across the application
 */

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { api, type User } from '$lib/api/client';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  return {
    subscribe,

    // Initialize auth state
    async init() {
      if (!browser) return;

      if (!api.isAuthenticated()) {
        set({ user: null, loading: false, error: null });
        return;
      }

      try {
        const { user } = await api.getMe();
        set({ user, loading: false, error: null });
      } catch (error: any) {
        console.error('Failed to load user:', error);
        set({ user: null, loading: false, error: error.message });
      }
    },

    // Login
    async login(email: string, password: string) {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        const { user } = await api.login(email, password);
        set({ user, loading: false, error: null });
        return { success: true };
      } catch (error: any) {
        set({ user: null, loading: false, error: error.message });
        return { success: false, error: error.message };
      }
    },

    // Register
    async register(email: string, password: string, name: string, username?: string) {
      update(state => ({ ...state, loading: true, error: null }));

      try {
        await api.register(email, password, name, username);
        // Don't auto-login, require email verification
        set({ user: null, loading: false, error: null });
        return { success: true };
      } catch (error: any) {
        set({ user: null, loading: false, error: error.message });
        return { success: false, error: error.message };
      }
    },

    // Logout
    async logout() {
      update(state => ({ ...state, loading: true }));
      
      try {
        await api.logout();
      } finally {
        set({ user: null, loading: false, error: null });
      }
    },

    // Update user data
    setUser(user: User) {
      update(state => ({ ...state, user }));
    },

    // Clear error
    clearError() {
      update(state => ({ ...state, error: null }));
    },
  };
}

export const authStore = createAuthStore();

// Derived stores
export const user = derived(authStore, $auth => $auth.user);
export const isAuthenticated = derived(authStore, $auth => !!$auth.user);
export const isLoading = derived(authStore, $auth => $auth.loading);
export const authError = derived(authStore, $auth => $auth.error);
export const userTier = derived(authStore, $auth => $auth.user?.tier || 'free');
export const isAdmin = derived(authStore, $auth => $auth.user?.role === 'admin');

