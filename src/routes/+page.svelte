<script lang="ts">
	let selectedGame = $state('chess');
	let gameStatus = $state('ready');
	let aiLevel = $state('medium');

	const games = [
		{ id: 'chess', name: 'Chess', icon: '♟️', description: 'Classic strategy game' },
		{ id: 'mahjong', name: 'Mahjong', icon: '🀄', description: 'Traditional tile game' },
		{ id: 'checkers', name: 'Checkers', icon: '⚫', description: 'Simple strategy game' }
	];

	const aiLevels = [
		{ id: 'easy', name: 'Easy', description: 'Beginner friendly' },
		{ id: 'medium', name: 'Medium', description: 'Balanced challenge' },
		{ id: 'hard', name: 'Hard', description: 'Expert level' }
	];

	function startGame() {
		gameStatus = 'playing';
		// Simulate game start
		setTimeout(() => {
			alert(`Starting ${games.find(g => g.id === selectedGame)?.name} game at ${aiLevel} difficulty!`);
		}, 500);
	}
</script>

<svelte:head>
	<title>GameMind - Multi-Game AI Engine</title>
	<meta name="description" content="Play against advanced AI in chess, mahjong, and more games." />
</svelte:head>

<div class="game-hub">
	<header class="hero">
		<h1>🎮 GameMind</h1>
		<p>Multi-Game AI Engine</p>
	</header>

	<div class="game-selector">
		<h2>Choose Your Game</h2>
		<div class="games-grid">
			{#each games as game}
				<button
					class="game-card {selectedGame === game.id ? 'selected' : ''}"
					onclick={() => selectedGame = game.id}
				>
					<div class="game-icon">{game.icon}</div>
					<div class="game-name">{game.name}</div>
					<div class="game-description">{game.description}</div>
				</button>
			{/each}
		</div>
	</div>

	<div class="ai-settings">
		<h3>AI Difficulty</h3>
		<div class="difficulty-selector">
			{#each aiLevels as level}
				<button
					class="difficulty-btn {aiLevel === level.id ? 'selected' : ''}"
					onclick={() => aiLevel = level.id}
				>
					{level.name}
				</button>
			{/each}
		</div>
	</div>

	<div class="game-controls">
		<button class="start-btn" onclick={startGame} disabled={gameStatus === 'playing'}>
			{gameStatus === 'playing' ? 'Game in Progress...' : 'Start Game'}
		</button>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
		color: white;
		min-height: 100vh;
	}

	.game-hub {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.hero {
		text-align: center;
		margin-bottom: 3rem;
	}

	.hero h1 {
		font-size: 3rem;
		margin-bottom: 0.5rem;
		font-weight: 700;
	}

	.hero p {
		font-size: 1.25rem;
		opacity: 0.9;
	}

	.game-selector h2,
	.ai-settings h3 {
		text-align: center;
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
	}

	.games-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.game-card {
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 1rem;
		padding: 1.5rem;
		cursor: pointer;
		transition: all 0.3s;
		text-align: center;
		color: white;
	}

	.game-card:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
	}

	.game-card.selected {
		border-color: #60a5fa;
		background: rgba(96, 165, 250, 0.2);
	}

	.game-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.game-name {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.game-description {
		font-size: 0.875rem;
		opacity: 0.8;
	}

	.difficulty-selector {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.difficulty-btn {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.difficulty-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.difficulty-btn.selected {
		background: #60a5fa;
		border-color: #60a5fa;
	}

	.game-controls {
		text-align: center;
	}

	.start-btn {
		background: #10b981;
		color: white;
		border: none;
		padding: 1rem 2rem;
		font-size: 1.125rem;
		font-weight: 600;
		border-radius: 0.75rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.start-btn:hover:not(:disabled) {
		background: #059669;
		transform: translateY(-1px);
	}

	.start-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.game-hub {
			padding: 1rem;
		}

		.hero h1 {
			font-size: 2rem;
		}

		.games-grid {
			grid-template-columns: 1fr;
		}

		.difficulty-selector {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
