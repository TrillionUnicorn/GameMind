<!--
  Game History Page
  View all past games with filtering and pagination
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import { api } from '$lib/api/client';

  let games: any[] = [];
  let loading = true;
  let error = '';
  let currentPage = 1;
  let hasMore = true;
  let selectedGameType = 'all';

  onMount(async () => {
    await loadGames();
  });

  async function loadGames() {
    loading = true;
    error = '';

    try {
      const gameType = selectedGameType === 'all' ? undefined : selectedGameType;
      const { games: gamesData, pagination } = await api.getGames(currentPage, 20, gameType);
      
      games = gamesData;
      hasMore = pagination.hasMore;
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function changePage(page: number) {
    currentPage = page;
    await loadGames();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function filterByGameType(gameType: string) {
    selectedGameType = gameType;
    currentPage = 1;
    await loadGames();
  }

  function getResultColor(result: string) {
    switch (result) {
      case 'win': return 'bg-green-500';
      case 'loss': return 'bg-red-500';
      case 'draw': return 'bg-gray-500';
      default: return 'bg-gray-600';
    }
  }

  function getResultIcon(result: string) {
    switch (result) {
      case 'win': return '✓';
      case 'loss': return '✗';
      case 'draw': return '=';
      default: return '?';
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
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  function getGameTypeIcon(gameType: string) {
    switch (gameType) {
      case 'chess': return '♟️';
      case 'mahjong': return '🀄';
      case 'go': return '⚫';
      default: return '🎮';
    }
  }
</script>

<svelte:head>
  <title>Game History - GameMind</title>
</svelte:head>

<ProtectedRoute>
  <div class="min-h-screen bg-gray-900">
    <!-- Header -->
    <div class="bg-white/5 border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-white">Game History</h1>
            <p class="text-white/60 mt-1">View all your past games</p>
          </div>
          <a
            href="/dashboard"
            class="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium border border-white/20"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters -->
      <div class="mb-6 flex gap-3 flex-wrap">
        <button
          onclick={() => filterByGameType('all')}
          class="px-4 py-2 rounded-lg font-medium transition-all {selectedGameType === 'all' ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}"
        >
          All Games
        </button>
        <button
          onclick={() => filterByGameType('chess')}
          class="px-4 py-2 rounded-lg font-medium transition-all {selectedGameType === 'chess' ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}"
        >
          ♟️ Chess
        </button>
        <button
          onclick={() => filterByGameType('mahjong')}
          class="px-4 py-2 rounded-lg font-medium transition-all {selectedGameType === 'mahjong' ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}"
        >
          🀄 Mahjong
        </button>
        <button
          onclick={() => filterByGameType('go')}
          class="px-4 py-2 rounded-lg font-medium transition-all {selectedGameType === 'go' ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}"
        >
          ⚫ Go
        </button>
      </div>

      {#if loading}
        <!-- Loading State -->
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p class="text-white mt-4">Loading games...</p>
          </div>
        </div>
      {:else if error}
        <!-- Error State -->
        <div class="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
          <p class="font-medium">Failed to load games</p>
          <p class="text-sm mt-1">{error}</p>
        </div>
      {:else if games.length === 0}
        <!-- Empty State -->
        <div class="bg-white/10 p-12 rounded-lg border border-white/20 text-center">
          <div class="text-6xl mb-4">🎮</div>
          <h3 class="text-2xl font-bold text-white mb-2">No games yet</h3>
          <p class="text-white/60 mb-6">Start playing to build your game history</p>
          <a
            href="/play"
            class="inline-block bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Play Now
          </a>
        </div>
      {:else}
        <!-- Games List -->
        <div class="space-y-3">
          {#each games as game}
            <div class="bg-white/10 p-6 rounded-lg border border-white/20 hover:bg-white/15 transition-all">
              <div class="flex items-center justify-between">
                <!-- Game Info -->
                <div class="flex items-center gap-6">
                  <!-- Result Badge -->
                  <div class="flex flex-col items-center">
                    <div class="w-16 h-16 rounded-full {getResultColor(game.result)} flex items-center justify-center text-2xl font-bold text-white">
                      {getResultIcon(game.result)}
                    </div>
                    <span class="text-xs text-white/60 mt-1 uppercase">{game.result}</span>
                  </div>

                  <!-- Game Details -->
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-2xl">{getGameTypeIcon(game.gameType)}</span>
                      <h3 class="text-xl font-bold text-white capitalize">{game.gameType}</h3>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-white/60">
                      <span class="capitalize">{game.mode}</span>
                      {#if game.difficulty}
                        <span class="capitalize">{game.difficulty} difficulty</span>
                      {/if}
                      <span>{formatDuration(game.duration)}</span>
                    </div>
                  </div>
                </div>

                <!-- Stats & Date -->
                <div class="text-right">
                  {#if game.ratingChange}
                    <div class="text-lg font-bold {game.ratingChange > 0 ? 'text-green-500' : 'text-red-500'} mb-1">
                      {game.ratingChange > 0 ? '+' : ''}{game.ratingChange}
                    </div>
                  {/if}
                  <div class="text-sm text-white/60">
                    Rating: {game.rating}
                  </div>
                  <div class="text-xs text-white/40 mt-2">
                    {formatDate(game.createdAt)}
                  </div>
                </div>
              </div>

              <!-- View Game Button -->
              <div class="mt-4 pt-4 border-t border-white/10">
                <a
                  href="/history/{game.id}"
                  class="text-red-500 hover:text-red-400 text-sm font-medium"
                >
                  View Game Details →
                </a>
              </div>
            </div>
          {/each}
        </div>

        <!-- Pagination -->
        <div class="mt-8 flex justify-center gap-3">
          <button
            onclick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
            class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
          >
            ← Previous
          </button>
          
          <span class="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20">
            Page {currentPage}
          </span>

          <button
            onclick={() => changePage(currentPage + 1)}
            disabled={!hasMore}
            class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
          >
            Next →
          </button>
        </div>
      {/if}
    </div>
  </div>
</ProtectedRoute>

