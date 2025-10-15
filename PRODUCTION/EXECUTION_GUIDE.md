# 🚀 PRODUCTION EXECUTION GUIDE

**Goal:** Get the complete production system running  
**Timeline:** Follow step-by-step, no shortcuts  
**Status:** Backend complete, frontend integration next

---

## 📋 PREREQUISITES

Before starting, ensure you have:

- [x] Bun 1.0+ installed
- [x] Node.js 22+ installed
- [x] PostgreSQL 16+ installed
- [x] Git installed
- [x] Supabase account created
- [x] Stripe account created
- [x] Code editor (VS Code recommended)

---

## 🎯 PHASE 1: BACKEND SETUP (30 minutes)

### Step 1: Navigate to Backend Directory

```bash
cd PRODUCTION/backend
```

### Step 2: Install Dependencies

```bash
bun install
```

**Expected output:**
```
✓ Installed dependencies
```

### Step 3: Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

**Database:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/gamemind
```

**Supabase** (get from supabase.com):
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**JWT:**
```env
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
```

**Stripe** (get from stripe.com):
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_PRO=price_xxxxx
STRIPE_PRICE_MASTER=price_xxxxx
```

### Step 4: Create Database

```bash
# Using psql
createdb gamemind

# Or using PostgreSQL GUI (pgAdmin, TablePlus, etc.)
```

### Step 5: Generate Database Schema

```bash
bun run db:generate
```

**Expected output:**
```
✓ Generated migrations
```

### Step 6: Run Migrations

```bash
bun run db:migrate
```

**Expected output:**
```
✅ Migrations completed successfully
```

### Step 7: Start Backend Server

```bash
bun run dev
```

**Expected output:**
```
🚀 GameMind API Server starting...
📍 Environment: development
🌐 Port: 3000
✅ Server running at http://localhost:3000
```

### Step 8: Test Backend

Open browser and visit:
- http://localhost:3000 (should show API info)
- http://localhost:3000/health (should show "healthy")

**✅ Backend is now running!**

---

## 🎯 PHASE 2: FRONTEND INTEGRATION (2-3 hours)

### Step 1: Create API Client

Create `src/lib/api/client.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  private saveToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
      this.token = token;
    }
  }

  private clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      this.token = null;
    }
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  // Auth methods
  async register(email: string, password: string, name: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.session?.accessToken) {
      this.saveToken(data.session.accessToken);
    }
    
    return data;
  }

  async logout() {
    await this.request('/api/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  // Game methods
  async saveGame(gameData: any) {
    return this.request('/api/games', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  async getGames(page = 1, limit = 20) {
    return this.request(`/api/games?page=${page}&limit=${limit}`);
  }

  async getStats() {
    return this.request('/api/games/stats/summary');
  }

  // Payment methods
  async createCheckoutSession(tier: 'pro' | 'master') {
    return this.request('/api/payments/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
  }

  async getSubscription() {
    return this.request('/api/payments/subscription');
  }
}

export const api = new APIClient(API_URL);
```

### Step 2: Update Login Page

Update `src/routes/login/+page.svelte`:

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { api } from '$lib/api/client';
  
  let email = '';
  let password = '';
  let error = '';
  let loading = false;
  
  async function handleLogin() {
    loading = true;
    error = '';
    
    try {
      await api.login(email, password);
      goto('/dashboard');
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-900">
  <div class="bg-white/10 p-8 rounded-lg backdrop-blur-lg border border-white/20 w-full max-w-md">
    <h1 class="text-3xl font-bold text-white mb-6">Login</h1>
    
    {#if error}
      <div class="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4">
        {error}
      </div>
    {/if}
    
    <form on:submit|preventDefault={handleLogin}>
      <div class="mb-4">
        <label class="block text-white mb-2">Email</label>
        <input
          type="email"
          bind:value={email}
          required
          class="w-full px-4 py-2 bg-white/5 border border-white/20 rounded text-white"
        />
      </div>
      
      <div class="mb-6">
        <label class="block text-white mb-2">Password</label>
        <input
          type="password"
          bind:value={password}
          required
          class="w-full px-4 py-2 bg-white/5 border border-white/20 rounded text-white"
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        class="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
    
    <p class="text-white/60 mt-4 text-center">
      Don't have an account? <a href="/register" class="text-red-500">Register</a>
    </p>
  </div>
</div>
```

### Step 3: Update Chess Game to Save Results

Update `src/routes/play/+page.svelte` to save game after completion:

```typescript
// Add this function
async function saveGameResult() {
  if (!gameOver) return;
  
  try {
    await api.saveGame({
      gameType: 'chess',
      mode: 'ai',
      difficulty: difficulty,
      result: winner === 'white' ? 'win' : winner === 'black' ? 'loss' : 'draw',
      moves: moveHistory,
      duration: Math.floor((Date.now() - gameStartTime) / 1000),
      isRated: true,
      isPublic: true,
    });
    
    console.log('Game saved successfully');
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

// Call this when game ends
$: if (gameOver) {
  saveGameResult();
}
```

### Step 4: Create Dashboard Page

Create `src/routes/dashboard/+page.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api/client';
  import { goto } from '$app/navigation';
  
  let user: any = null;
  let stats: any = null;
  let games: any[] = [];
  let loading = true;
  
  onMount(async () => {
    try {
      const [userData, statsData, gamesData] = await Promise.all([
        api.getMe(),
        api.getStats(),
        api.getGames(1, 10),
      ]);
      
      user = userData.user;
      stats = statsData.stats;
      games = gamesData.games;
    } catch (error) {
      goto('/login');
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen bg-gray-900 p-8">
  {#if loading}
    <p class="text-white">Loading...</p>
  {:else if user}
    <h1 class="text-4xl font-bold text-white mb-8">
      Welcome, {user.name}!
    </h1>
    
    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white/10 p-6 rounded-lg">
        <h3 class="text-white/60 text-sm">Total Games</h3>
        <p class="text-3xl font-bold text-white">{stats.totalGamesPlayed}</p>
      </div>
      
      <div class="bg-white/10 p-6 rounded-lg">
        <h3 class="text-white/60 text-sm">Win Rate</h3>
        <p class="text-3xl font-bold text-white">{stats.winRate}%</p>
      </div>
      
      <div class="bg-white/10 p-6 rounded-lg">
        <h3 class="text-white/60 text-sm">Chess Rating</h3>
        <p class="text-3xl font-bold text-white">{stats.chess.rating}</p>
      </div>
    </div>
    
    <!-- Recent Games -->
    <h2 class="text-2xl font-bold text-white mb-4">Recent Games</h2>
    <div class="grid gap-4">
      {#each games as game}
        <div class="bg-white/10 p-4 rounded-lg flex justify-between items-center">
          <div>
            <p class="text-white font-bold capitalize">{game.gameType}</p>
            <p class="text-white/60 text-sm">{game.difficulty} difficulty</p>
          </div>
          <span class="px-3 py-1 rounded text-sm font-bold
            {game.result === 'win' ? 'bg-green-500' : 
             game.result === 'loss' ? 'bg-red-500' : 'bg-gray-500'}">
            {game.result.toUpperCase()}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</div>
```

### Step 5: Add Environment Variable

Create `.env` in frontend root:

```env
VITE_API_URL=http://localhost:3000
```

### Step 6: Test Integration

1. Start backend: `cd PRODUCTION/backend && bun run dev`
2. Start frontend: `cd ../.. && npm run dev`
3. Visit http://localhost:5173
4. Register a new account
5. Login
6. Play a chess game
7. Check dashboard for saved game

**✅ Frontend-backend integration complete!**

---

## 🎯 NEXT STEPS

1. **Add Tests** - Write comprehensive tests
2. **Deploy Backend** - Deploy to Railway/Fly.io
3. **Deploy Frontend** - Deploy to Vercel
4. **Add Real-time** - Implement WebSocket multiplayer
5. **Add Features** - Tournaments, achievements, etc.

---

**Status:** Ready to execute in working environment!

