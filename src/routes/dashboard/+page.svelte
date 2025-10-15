<!--
  Dashboard Page
  User dashboard with statistics, recent games, and quick actions
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import { user } from '$lib/stores/auth';
  import { api, type GameStats } from '$lib/api/client';

  let stats: GameStats | null = null;
  let recentGames: any[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      const [statsData, gamesData] = await Promise.all([
        api.getStats(),
        api.getGames(1, 10),
      ]);

      stats = statsData.stats;
      recentGames = gamesData.games;
    } catch (err: any) {
      error = err.message;
      console.error('Failed to load dashboard data:', err);
    } finally {
      loading = false;
    }
  });

  function getResultColor(result: string) {
    switch (result) {
      case 'win': return 'bg-green-500';
      case 'loss': return 'bg-red-500';
      case 'draw': return 'bg-gray-500';
      default: return 'bg-gray-600';
    }
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
</script>

<svelte:head>
  <title>Dashboard - GameMind</title>
</svelte:head>

<ProtectedRoute>
  <div class="min-h-screen bg-gray-900">
    <!-- Header -->
    <div class="bg-white/5 border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-white">
              Welcome back, {$user?.name || 'Player'}!
            </h1>
            <p class="text-white/60 mt-1">
              {#if $user?.tier === 'free'}
                Free Tier
              {:else if $user?.tier === 'pro'}
                <span class="text-yellow-500">⭐ Pro Member</span>
              {:else if $user?.tier === 'master'}
                <span class="text-purple-500">👑 Master Member</span>
              {/if}
            </p>
          </div>
          <div class="flex gap-3">
            <a
              href="/play"
              class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
            >
              Play Now
            </a>
            <a
              href="/account"
              class="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-all border border-white/20"
            >
              Settings
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {#if loading}
        <!-- Loading State -->
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p class="text-white mt-4">Loading your stats...</p>
          </div>
        </div>
      {:else if error}
        <!-- Error State -->
        <div class="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
          <p class="font-medium">Failed to load dashboard</p>
          <p class="text-sm mt-1">{error}</p>
        </div>
      {:else if stats}
        <!-- Statistics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Games -->
          <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white/60 text-sm font-medium">Total Games</p>
                <p class="text-3xl font-bold text-white mt-2">{stats.totalGamesPlayed}</p>
              </div>
              <div class="bg-blue-500/20 p-3 rounded-lg">
                <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Win Rate -->
          <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white/60 text-sm font-medium">Win Rate</p>
                <p class="text-3xl font-bold text-white mt-2">{stats.winRate}%</p>
              </div>
              <div class="bg-green-500/20 p-3 rounded-lg">
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Chess Rating -->
          <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white/60 text-sm font-medium">Chess Rating</p>
                <p class="text-3xl font-bold text-white mt-2">{stats.chess.rating}</p>
                <p class="text-xs text-white/40 mt-1">Best: {stats.chess.bestRating}</p>
              </div>
              <div class="bg-yellow-500/20 p-3 rounded-lg">
                <svg class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Win Streak -->
          <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-white/60 text-sm font-medium">Win Streak</p>
                <p class="text-3xl font-bold text-white mt-2">{stats.winStreak}</p>
                <p class="text-xs text-white/40 mt-1">Best: {stats.bestWinStreak}</p>
              </div>
              <div class="bg-purple-500/20 p-3 rounded-lg">
                <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Chess Detailed Stats -->
        <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg mb-8">
          <h2 class="text-xl font-bold text-white mb-4">Chess Statistics</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-white/60 text-sm">Games Played</p>
              <p class="text-2xl font-bold text-white">{stats.chess.gamesPlayed}</p>
            </div>
            <div>
              <p class="text-white/60 text-sm">Wins</p>
              <p class="text-2xl font-bold text-green-500">{stats.chess.wins}</p>
            </div>
            <div>
              <p class="text-white/60 text-sm">Losses</p>
              <p class="text-2xl font-bold text-red-500">{stats.chess.losses}</p>
            </div>
            <div>
              <p class="text-white/60 text-sm">Draws</p>
              <p class="text-2xl font-bold text-gray-500">{stats.chess.draws}</p>
            </div>
          </div>
        </div>

        <!-- Recent Games -->
        <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-white">Recent Games</h2>
            <a href="/history" class="text-red-500 hover:text-red-400 text-sm font-medium">
              View All →
            </a>
          </div>

          {#if recentGames.length === 0}
            <div class="text-center py-8">
              <p class="text-white/60">No games played yet</p>
              <a href="/play" class="text-red-500 hover:text-red-400 mt-2 inline-block">
                Play your first game →
              </a>
            </div>
          {:else}
            <div class="space-y-3">
              {#each recentGames as game}
                <div class="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center gap-4">
                      <span class="px-3 py-1 rounded text-sm font-bold {getResultColor(game.result)}">
                        {game.result.toUpperCase()}
                      </span>
                      <div>
                        <p class="text-white font-medium capitalize">{game.gameType}</p>
                        <p class="text-white/60 text-sm">
                          {game.difficulty ? `${game.difficulty} difficulty` : game.mode}
                        </p>
                      </div>
                    </div>
                    <div class="text-right">
                      {#if game.ratingChange}
                        <p class="text-sm font-medium {game.ratingChange > 0 ? 'text-green-500' : 'text-red-500'}">
                          {game.ratingChange > 0 ? '+' : ''}{game.ratingChange}
                        </p>
                      {/if}
                      <p class="text-white/40 text-xs">{formatDate(game.createdAt)}</p>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</ProtectedRoute>

