/**
 * Test Setup
 * Global test configuration and utilities
 */

import { beforeAll, afterAll, beforeEach } from 'bun:test';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

// Test database connection
let testDb: typeof db;

beforeAll(async () => {
  // Ensure we're using test database
  if (!process.env.DATABASE_URL?.includes('test')) {
    throw new Error('Must use test database for tests!');
  }

  testDb = db;
  
  // Run migrations
  console.log('Setting up test database...');
});

beforeEach(async () => {
  // Clean up database before each test
  await cleanDatabase();
});

afterAll(async () => {
  // Clean up after all tests
  await cleanDatabase();
  console.log('Test database cleaned up');
});

async function cleanDatabase() {
  // Delete all data from tables (in correct order due to foreign keys)
  await testDb.execute(sql`TRUNCATE TABLE user_achievements CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE achievements CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE tournament_participants CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE tournaments CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE friends CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE notifications CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE payments CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE subscriptions CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE games CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE user_stats CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE user_profiles CASCADE`);
  await testDb.execute(sql`TRUNCATE TABLE users CASCADE`);
}

export { testDb };

