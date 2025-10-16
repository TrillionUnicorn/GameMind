<!--
  Game Replay Viewer
  View and replay a specific game move-by-move
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import ChessBoard from '$lib/components/chess/ChessBoard.svelte';
  import { api } from '$lib/api/client';
  import { createInitialBoard } from '$lib/engines/chess/board';
  import { makeMove } from '$lib/engines/chess/moves';
  import type { Board, Move } from '$lib/engines/chess/types';

  let gameId = $page.params.id;
  let game: any = null;
  let loading = true;
  let error = '';

  // Replay state
  let currentMoveIndex = $state(0);
  let board = $state<Board>(createInitialBoard());
  let isPlaying = $state(false);
  let playbackSpeed = $state(1000); // ms per move

  let playbackInterval: any = null;

  onMount(async () => {
    await loadGame();
  });

  async function loadGame() {
    loading = true;
    error = '';

    try {
      const { game: gameData } = await api.getGame(gameId);
      game = gameData;
      
      // Initialize board
      board = createInitialBoard();
      currentMoveIndex = 0;
    } catch (err: any) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function applyMovesToIndex(index: number) {
    board = createInitialBoard();
    
    if (!game?.moves || index < 0) return;

    for (let i = 0; i <= index && i < game.moves.length; i++) {
      const move = game.moves[i];
      board = makeMove(board, move);
    }
  }

  function goToMove(index: number) {
    if (!game?.moves) return;
    
    const maxIndex = game.moves.length - 1;
    currentMoveIndex = Math.max(0, Math.min(index, maxIndex));
    applyMovesToIndex(currentMoveIndex);
  }

  function nextMove() {
    if (!game?.moves || currentMoveIndex >= game.moves.length - 1) {
      stopPlayback();
      return;
    }
    goToMove(currentMoveIndex + 1);
  }

  function previousMove() {
    goToMove(currentMoveIndex - 1);
  }

  function firstMove() {
    goToMove(0);
  }

  function lastMove() {
    if (!game?.moves) return;
    goToMove(game.moves.length - 1);
  }

  function togglePlayback() {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }

  function startPlayback() {
    if (!game?.moves) return;
    
    isPlaying = true;
    playbackInterval = setInterval(() => {
      nextMove();
    }, playbackSpeed);
  }

  function stopPlayback() {
    isPlaying = false;
    if (playbackInterval) {
      clearInterval(playbackInterval);
      playbackInterval = null;
    }
  }

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
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Cleanup on unmount
  onMount(() => {
    return () => {
      stopPlayback();
    };
  });
</script>

<svelte:head>
  <title>Game Replay - GameMind</title>
</svelte:head>

<ProtectedRoute>
  <div class="min-h-screen bg-gray-900">
    <!-- Header -->
    <div class="bg-white/5 border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-white">Game Replay</h1>
            <p class="text-white/60 mt-1">Review your game move-by-move</p>
          </div>
          <a
            href="/history"
            class="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium border border-white/20"
          >
            ← Back to History
          </a>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {#if loading}
        <!-- Loading State -->
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            <p class="text-white mt-4">Loading game...</p>
          </div>
        </div>
      {:else if error}
        <!-- Error State -->
        <div class="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg">
          <p class="font-medium">Failed to load game</p>
          <p class="text-sm mt-1">{error}</p>
        </div>
      {:else if game}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Chess Board -->
          <div class="lg:col-span-2">
            <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg">
              <ChessBoard {board} playerColor="white" onMove={() => {}} disabled={true} />

              <!-- Playback Controls -->
              <div class="mt-6 space-y-4">
                <!-- Progress Bar -->
                <div class="space-y-2">
                  <div class="flex justify-between text-sm text-white/60">
                    <span>Move {currentMoveIndex + 1} of {game.moves.length}</span>
                    <span>{Math.round((currentMoveIndex / (game.moves.length - 1)) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={game.moves.length - 1}
                    bind:value={currentMoveIndex}
                    oninput={(e) => goToMove(parseInt(e.currentTarget.value))}
                    class="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <!-- Control Buttons -->
                <div class="flex items-center justify-center gap-3">
                  <button
                    onclick={firstMove}
                    class="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg border border-white/20"
                    title="First Move"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onclick={previousMove}
                    class="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg border border-white/20"
                    title="Previous Move"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onclick={togglePlayback}
                    class="bg-red-500 hover:bg-red-600 text-white p-4 rounded-lg"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {#if isPlaying}
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    {:else}
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    {/if}
                  </button>

                  <button
                    onclick={nextMove}
                    class="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg border border-white/20"
                    title="Next Move"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    onclick={lastMove}
                    class="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg border border-white/20"
                    title="Last Move"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <!-- Playback Speed -->
                <div class="flex items-center justify-center gap-4">
                  <span class="text-white/60 text-sm">Speed:</span>
                  <button
                    onclick={() => playbackSpeed = 2000}
                    class="px-3 py-1 rounded {playbackSpeed === 2000 ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60'}"
                  >
                    0.5x
                  </button>
                  <button
                    onclick={() => playbackSpeed = 1000}
                    class="px-3 py-1 rounded {playbackSpeed === 1000 ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60'}"
                  >
                    1x
                  </button>
                  <button
                    onclick={() => playbackSpeed = 500}
                    class="px-3 py-1 rounded {playbackSpeed === 500 ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60'}"
                  >
                    2x
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Game Info -->
          <div class="space-y-6">
            <!-- Result -->
            <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg">
              <h3 class="text-lg font-bold text-white mb-4">Game Result</h3>
              <div class="flex items-center justify-center">
                <span class="px-6 py-3 rounded-lg text-xl font-bold {getResultColor(game.result)} text-white uppercase">
                  {game.result}
                </span>
              </div>
            </div>

            <!-- Game Details -->
            <div class="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-lg">
              <h3 class="text-lg font-bold text-white mb-4">Game Details</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-white/60">Game Type:</span>
                  <span class="text-white capitalize">{game.gameType}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-white/60">Mode:</span>
                  <span class="text-white capitalize">{game.mode}</span>
                </div>
                {#if game.difficulty}
                  <div class="flex justify-between">
                    <span class="text-white/60">Difficulty:</span>
                    <span class="text-white capitalize">{game.difficulty}</span>
                  </div>
                {/if}
                <div class="flex justify-between">
                  <span class="text-white/60">Duration:</span>
                  <span class="text-white">{formatDuration(game.duration)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-white/60">Total Moves:</span>
                  <span class="text-white">{game.moves.length}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-white/60">Rating:</span>
                  <span class="text-white">{game.rating}</span>
                </div>
                {#if game.ratingChange}
                  <div class="flex justify-between">
                    <span class="text-white/60">Rating Change:</span>
                    <span class="text-white {game.ratingChange > 0 ? 'text-green-500' : 'text-red-500'}">
                      {game.ratingChange > 0 ? '+' : ''}{game.ratingChange}
                    </span>
                  </div>
                {/if}
                <div class="flex justify-between">
                  <span class="text-white/60">Played:</span>
                  <span class="text-white text-xs">{formatDate(game.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</ProtectedRoute>

<style>
  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ef4444;
    cursor: pointer;
  }

  input[type="range"]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ef4444;
    cursor: pointer;
    border: none;
  }
</style>

