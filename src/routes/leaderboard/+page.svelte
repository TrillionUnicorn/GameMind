<!--
  Leaderboard Page
  Global rankings for all game types
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api/client';
  import { user } from '$lib/stores/auth';

  let leaderboard: any[] = [];
  let loading = true;
  let error = '';
  let selectedGame = 'chess';
  let userRank: number | null = null;

  onMount(async () => {
    await loadLeaderboard();
  });

  async function loadLeaderboard() {
    loading = true;
    error = '';

    try {
      const { leaderboard: data } = await api.getLeaderboard(selectedGame, 100);
      leaderboard = data;

      // Find user's rank
      if ($user) {
        const userIndex = leaderboard.findIndex(entry => entry.user.id === $user.id);
        userRank = userIndex >= 0 ? userIndex + 1 : null;
      }
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function changeGame(game: string) {
    selectedGame = game;
    await loadLeaderboard();
  }

  function getRankBadge(rank: number) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  function getRankColor(rank: number) {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-white/60';
  }

  function getRating(entry: any) {
    switch (selectedGame) {
      case 'chess': return entry.stats.chessRating;
      case 'mahjong': return entry.stats.mahjongRating;
      case 'go': return entry.stats.goRating;
      default: return 0;
    }
  }

  function getGamesPlayed(entry: any) {
    switch (selectedGame) {
      case 'chess': return entry.stats.chessGamesPlayed;
      case 'mahjong': return entry.stats.mahjongGamesPlayed;
      case 'go': return entry.stats.goGamesPlayed;
      default: return 0;
    }
  }

  function getWins(entry: any) {
    switch (selectedGame) {
      case 'chess': return entry.stats.chessWins;
      case 'mahjong': return entry.stats.mahjongWins;
      case 'go': return entry.stats.goWins;
      default: return 0;
    }
  }

  function getWinRate(entry: any) {
    const games = getGamesPlayed(entry);
    const wins = getWins(entry);
    return games > 0 ? ((wins / games) * 100).toFixed(1) : '0.0';
  }
</script>

<svelte:head>
  <title>Leaderboard - GameMind</title>
</svelte:head>

<div class="min-h-screen bg-gray-900">
  <!-- Header -->
  <div class="bg-white/5 border-b border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
        🏆 Leaderboard
      </h1>
      <p class="text-xl text-white/60">
        Top players worldwide
      </p>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Game Type Selector -->
    <div class="mb-8 flex justify-center gap-3 flex-wrap">
      <button
        onclick={() => changeGame('chess')}
        class="px-6 py-3 rounded-lg font-medium transition-all {selectedGame === 'chess' ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}"
      >
        ♟️ Chess
      </button>
      <button
        onclick={() => changeGame('mahjong')}
        class="px-6 py-3 rounded-lg font-medium transition-all {selectedGame === 'mahjong' ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}"
      >
        🀄 Mahjong
      </button>
      <button
        onclick={() => changeGame('go')}
        class="px-6 py-3 rounded-lg font-medium transition-all {selectedGame === 'go' ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}"
      >
        ⚫ Go
      </button>
    </div>

    {#if loading}
      <!-- Loading State -->
      <div class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <p class="text-white mt-4">Loading leaderboard...</p>
        </div>
      </div>
    {:else if error}
      <!-- Error State -->
      <div class="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
        <p class="font-medium">Failed to load leaderboard</p>
        <p class="text-sm mt-1">{error}</p>
      </div>
    {:else if leaderboard.length === 0}
      <!-- Empty State -->
      <div class="bg-white/10 p-12 rounded-lg border border-white/20 text-center">
        <div class="text-6xl mb-4">🎮</div>
        <h3 class="text-2xl font-bold text-white mb-2">No rankings yet</h3>
        <p class="text-white/60 mb-6">Be the first to play and claim the top spot!</p>
        <a
          href="/play"
          class="inline-block bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Start Playing
        </a>
      </div>
    {:else}
      <!-- User's Rank (if logged in and ranked) -->
      {#if userRank}
        <div class="mb-6 bg-blue-500/20 border border-blue-500 p-4 rounded-lg">
          <p class="text-blue-200 text-center">
            <span class="font-bold">Your Rank:</span> #{userRank} out of {leaderboard.length} players
          </p>
        </div>
      {/if}

      <!-- Leaderboard Table -->
      <div class="bg-white/10 rounded-lg border border-white/20 overflow-hidden">
        <!-- Table Header -->
        <div class="bg-white/5 px-6 py-4 border-b border-white/10">
          <div class="grid grid-cols-12 gap-4 text-white/60 text-sm font-medium">
            <div class="col-span-1">Rank</div>
            <div class="col-span-4">Player</div>
            <div class="col-span-2 text-center">Rating</div>
            <div class="col-span-2 text-center">Games</div>
            <div class="col-span-2 text-center">Wins</div>
            <div class="col-span-1 text-center">Win %</div>
          </div>
        </div>

        <!-- Table Body -->
        <div class="divide-y divide-white/10">
          {#each leaderboard as entry, index}
            {@const rank = index + 1}
            {@const isCurrentUser = $user && entry.user.id === $user.id}
            
            <div class="px-6 py-4 hover:bg-white/5 transition-colors {isCurrentUser ? 'bg-blue-500/10' : ''}">
              <div class="grid grid-cols-12 gap-4 items-center">
                <!-- Rank -->
                <div class="col-span-1">
                  <span class="text-2xl font-bold {getRankColor(rank)}">
                    {getRankBadge(rank)}
                  </span>
                </div>

                <!-- Player -->
                <div class="col-span-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center font-bold text-white">
                      {entry.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p class="text-white font-medium">
                        {entry.user.name}
                        {#if isCurrentUser}
                          <span class="text-xs text-blue-500 ml-2">(You)</span>
                        {/if}
                      </p>
                      {#if entry.user.username}
                        <p class="text-white/40 text-sm">@{entry.user.username}</p>
                      {/if}
                    </div>
                  </div>
                </div>

                <!-- Rating -->
                <div class="col-span-2 text-center">
                  <span class="text-xl font-bold text-white">{getRating(entry)}</span>
                </div>

                <!-- Games Played -->
                <div class="col-span-2 text-center">
                  <span class="text-white">{getGamesPlayed(entry)}</span>
                </div>

                <!-- Wins -->
                <div class="col-span-2 text-center">
                  <span class="text-green-500 font-medium">{getWins(entry)}</span>
                </div>

                <!-- Win Rate -->
                <div class="col-span-1 text-center">
                  <span class="text-white/80">{getWinRate(entry)}%</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Footer Note -->
      <div class="mt-6 text-center text-white/40 text-sm">
        <p>Rankings are updated in real-time based on player performance</p>
      </div>
    {/if}
  </div>
</div>

