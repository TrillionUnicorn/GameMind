<script lang="ts">
	import { onMount } from 'svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import ChessBoard from '$lib/components/chess/ChessBoard.svelte';
	import { createInitialBoard } from '$lib/engines/chess/board';
	import { makeMove, isKingInCheck } from '$lib/engines/chess/moves';
	import { ChessAI } from '$lib/engines/chess/ai';
	import type { Board, Move, PieceColor } from '$lib/engines/chess/types';
	import { api } from '$lib/api/client';
	import { isAuthenticated } from '$lib/stores/auth';

	let board = $state<Board>(createInitialBoard());
	let currentPlayer = $state<PieceColor>('white');
	let playerColor = $state<PieceColor>('white');
	let aiDifficulty = $state<'easy' | 'medium' | 'hard'>('medium');
	let gameStatus = $state<'playing' | 'check' | 'checkmate' | 'stalemate'>('playing');
	let moveHistory = $state<Move[]>([]);
	let isThinking = $state(false);

	// Game tracking for backend
	let gameStartTime = $state<number>(Date.now());
	let gameSaved = $state(false);
	let saveError = $state('');
	let winner = $state<'white' | 'black' | 'draw' | null>(null);

	let ai: ChessAI;

	onMount(() => {
		ai = new ChessAI(aiDifficulty);
		gameStartTime = Date.now();
	});

	function handlePlayerMove(move: Move) {
		// Make the move
		board = makeMove(board, move);
		moveHistory.push(move);
		currentPlayer = currentPlayer === 'white' ? 'black' : 'white';

		// Check game status
		updateGameStatus();

		// If game is still playing and it's AI's turn, make AI move
		if (gameStatus === 'playing' && currentPlayer !== playerColor) {
			setTimeout(makeAIMove, 500);
		}
	}

	async function makeAIMove() {
		isThinking = true;

		// Simulate thinking time
		await new Promise((resolve) => setTimeout(resolve, 500));

		const aiMove = ai.getBestMove(board, currentPlayer);

		if (aiMove) {
			board = makeMove(board, aiMove);
			moveHistory.push(aiMove);
			currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
			updateGameStatus();
		}

		isThinking = false;
	}

	function updateGameStatus() {
		if (isKingInCheck(board, currentPlayer)) {
			gameStatus = 'check';
			// TODO: Check for checkmate
			// For now, we'll detect checkmate after a certain number of moves or manual declaration
		} else {
			gameStatus = 'playing';
		}
	}

	function declareCheckmate(winningColor: 'white' | 'black') {
		gameStatus = 'checkmate';
		winner = winningColor;
		saveGameToBackend();
	}

	function declareDraw() {
		gameStatus = 'stalemate';
		winner = 'draw';
		saveGameToBackend();
	}

	async function saveGameToBackend() {
		if (!$isAuthenticated || gameSaved) return;

		const duration = Math.floor((Date.now() - gameStartTime) / 1000);

		// Determine result from player's perspective
		let result: 'win' | 'loss' | 'draw';
		if (winner === 'draw') {
			result = 'draw';
		} else if (winner === playerColor) {
			result = 'win';
		} else {
			result = 'loss';
		}

		try {
			await api.saveGame({
				gameType: 'chess',
				mode: 'ai',
				difficulty: aiDifficulty,
				result,
				moves: moveHistory,
				finalPosition: board,
				duration,
				isRated: true,
				isPublic: true,
			});

			gameSaved = true;
			saveError = '';
			console.log('Game saved successfully');
		} catch (error: any) {
			saveError = error.message;
			console.error('Failed to save game:', error);
		}
	}

	function resetGame() {
		board = createInitialBoard();
		currentPlayer = 'white';
		gameStatus = 'playing';
		moveHistory = [];
		isThinking = false;
		gameStartTime = Date.now();
		gameSaved = false;
		saveError = '';
		winner = null;
	}

	function changeDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
		aiDifficulty = difficulty;
		ai = new ChessAI(difficulty);
		resetGame();
	}

	function switchSides() {
		playerColor = playerColor === 'white' ? 'black' : 'white';
		resetGame();
		if (playerColor === 'black') {
			setTimeout(makeAIMove, 500);
		}
	}

	$effect(() => {
		if (currentPlayer !== playerColor && gameStatus === 'playing' && !isThinking) {
			makeAIMove();
		}
	});
</script>

<svelte:head>
	<title>Play Chess - GameMind</title>
	<meta name="description" content="Play chess against adaptive AI opponents on GameMind" />
</svelte:head>

<Navigation />

<div class="min-h-screen py-12">
	<div class="container px-4">
		<div class="text-center mb-12">
			<h1 class="text-4xl md:text-5xl font-bold mb-4">
				<span class="gradient-text">Play Chess</span>
			</h1>
			<p class="text-xl text-slate-300">
				Challenge our adaptive AI and improve your chess skills
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
			<!-- Game Board -->
			<div class="lg:col-span-2">
				<Card glass={true} class="p-6">
					<!-- Save Status -->
					{#if gameSaved}
						<div class="mb-4 bg-green-500/20 border border-green-500 text-green-200 p-3 rounded-lg text-sm">
							✓ Game saved to your history
						</div>
					{:else if saveError}
						<div class="mb-4 bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg text-sm">
							Failed to save game: {saveError}
						</div>
					{/if}

					<!-- Game Status -->
					<div class="mb-6 text-center">
						<div class="flex items-center justify-between mb-4">
							<div class="text-lg font-semibold">
								{#if isThinking}
									<span class="text-primary-500">AI is thinking...</span>
								{:else if gameStatus === 'check'}
									<span class="text-yellow-500">Check!</span>
								{:else if gameStatus === 'checkmate'}
									<span class="text-red-500">
										Checkmate! {winner === playerColor ? 'You win!' : 'AI wins!'}
									</span>
								{:else if gameStatus === 'stalemate'}
									<span class="text-gray-500">Draw!</span>
								{:else}
									<span class="text-slate-300">
										{currentPlayer === playerColor ? 'Your turn' : "AI's turn"}
									</span>
								{/if}
							</div>
							<div class="text-sm text-slate-400">
								Move {Math.floor(moveHistory.length / 2) + 1}
							</div>
						</div>

						<div class="flex items-center justify-center gap-4 text-sm">
							<div class="flex items-center gap-2">
								<div class="w-3 h-3 rounded-full {playerColor === 'white' ? 'bg-white' : 'bg-slate-900'}"></div>
								<span>You ({playerColor})</span>
							</div>
							<span class="text-slate-600">vs</span>
							<div class="flex items-center gap-2">
								<div class="w-3 h-3 rounded-full {playerColor === 'white' ? 'bg-slate-900' : 'bg-white'}"></div>
								<span>AI ({playerColor === 'white' ? 'black' : 'white'})</span>
							</div>
						</div>
					</div>

					<!-- Chess Board -->
					<ChessBoard
						{board}
						{playerColor}
						isPlayerTurn={currentPlayer === playerColor && !isThinking}
						onMove={handlePlayerMove}
					/>

					<!-- Game Controls -->
					<div class="mt-6 flex flex-wrap gap-4 justify-center">
						<Button variant="primary" onclick={resetGame}>
							New Game
						</Button>
						<Button variant="outline" onclick={switchSides}>
							Switch Sides
						</Button>

						{#if gameStatus === 'playing' && moveHistory.length > 10}
							<Button variant="outline" onclick={() => declareCheckmate(playerColor === 'white' ? 'black' : 'white')}>
								Resign
							</Button>
							<Button variant="outline" onclick={declareDraw}>
								Offer Draw
							</Button>
						{/if}
					</div>

					<!-- Authentication Notice -->
					{#if !$isAuthenticated}
						<div class="mt-4 bg-blue-500/20 border border-blue-500 text-blue-200 p-3 rounded-lg text-sm text-center">
							<a href="/login" class="underline hover:text-blue-100">Login</a> to save your games and track statistics
						</div>
					{/if}
				</Card>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- AI Difficulty -->
				<Card glass={true} class="p-6">
					<h3 class="text-xl font-bold mb-4">AI Difficulty</h3>
					<div class="space-y-2">
						{#each ['easy', 'medium', 'hard'] as difficulty}
							<button
								class="w-full px-4 py-3 rounded-lg text-left transition-all {aiDifficulty ===
								difficulty
									? 'bg-primary-500 text-white'
									: 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'}"
								onclick={() => changeDifficulty(difficulty as 'easy' | 'medium' | 'hard')}
							>
								<div class="font-semibold capitalize">{difficulty}</div>
								<div class="text-sm opacity-80">
									{difficulty === 'easy'
										? 'Perfect for beginners'
										: difficulty === 'medium'
											? 'Balanced challenge'
											: 'Expert level AI'}
								</div>
							</button>
						{/each}
					</div>
				</Card>

				<!-- Move History -->
				<Card glass={true} class="p-6">
					<h3 class="text-xl font-bold mb-4">Move History</h3>
					<div class="max-h-96 overflow-y-auto space-y-2">
						{#if moveHistory.length === 0}
							<p class="text-slate-400 text-sm">No moves yet</p>
						{:else}
							{#each moveHistory as move, i}
								<div class="text-sm text-slate-300 flex items-center gap-2">
									<span class="text-slate-500 w-8">{Math.floor(i / 2) + 1}.</span>
									<span class="font-mono">
										{move.piece.type} {String.fromCharCode(97 + move.from.col)}{8 - move.from.row}
										→ {String.fromCharCode(97 + move.to.col)}{8 - move.to.row}
										{#if move.captured}
											<span class="text-red-400">x{move.captured.type}</span>
										{/if}
									</span>
								</div>
							{/each}
						{/if}
					</div>
				</Card>

				<!-- Game Info -->
				<Card glass={true} class="p-6">
					<h3 class="text-xl font-bold mb-4">How to Play</h3>
					<ul class="space-y-2 text-sm text-slate-300">
						<li class="flex items-start gap-2">
							<span class="text-primary-500">•</span>
							<span>Click on a piece to select it</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-primary-500">•</span>
							<span>Green dots show valid moves</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-primary-500">•</span>
							<span>Red highlights show captures</span>
						</li>
						<li class="flex items-start gap-2">
							<span class="text-primary-500">•</span>
							<span>AI adapts to your skill level</span>
						</li>
					</ul>
				</Card>
			</div>
		</div>
	</div>
</div>

<Footer />

