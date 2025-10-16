/**
 * Authentication Tests
 * Test authentication endpoints and flows
 */

import { describe, test, expect } from 'bun:test';
import { app } from '../src/index';

describe('Authentication', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user', async () => {
      const response = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.message).toContain('Registration successful');
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.name).toBe('Test User');
    });

    test('should reject duplicate email', async () => {
      // Register first user
      await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'duplicate@example.com',
          password: 'password123',
          name: 'First User',
        }),
      });

      // Try to register with same email
      const response = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'duplicate@example.com',
          password: 'password456',
          name: 'Second User',
        }),
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data.error).toContain('already registered');
    });

    test('should validate email format', async () => {
      const response = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
        }),
      });

      expect(response.status).toBe(400);
    });

    test('should validate password length', async () => {
      const response = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'short',
          name: 'Test User',
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      // Register user first
      await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'password123',
          name: 'Login User',
        }),
      });

      // Login
      const response = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toContain('Login successful');
      expect(data.session.accessToken).toBeDefined();
      expect(data.session.refreshToken).toBeDefined();
      expect(data.user.email).toBe('login@example.com');
    });

    test('should reject invalid password', async () => {
      // Register user first
      await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrongpass@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      });

      // Try to login with wrong password
      const response = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrongpass@example.com',
          password: 'wrongpassword',
        }),
      });

      expect(response.status).toBe(401);
    });

    test('should reject non-existent user', async () => {
      const response = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    test('should return user info with valid token', async () => {
      // Register and login
      await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'me@example.com',
          password: 'password123',
          name: 'Me User',
        }),
      });

      const loginResponse = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'me@example.com',
          password: 'password123',
        }),
      });

      const { session } = await loginResponse.json();

      // Get user info
      const response = await app.request('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.user.email).toBe('me@example.com');
      expect(data.user.name).toBe('Me User');
    });

    test('should reject request without token', async () => {
      const response = await app.request('/api/auth/me');
      expect(response.status).toBe(401);
    });

    test('should reject request with invalid token', async () => {
      const response = await app.request('/api/auth/me', {
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      // Register and login
      await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'logout@example.com',
          password: 'password123',
          name: 'Logout User',
        }),
      });

      const loginResponse = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'logout@example.com',
          password: 'password123',
        }),
      });

      const { session } = await loginResponse.json();

      // Logout
      const response = await app.request('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toContain('Logout successful');
    });
  });
});

