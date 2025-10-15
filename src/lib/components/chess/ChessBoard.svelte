<script lang="ts">
	import type { Board, Piece, Position, Move } from '$lib/engines/chess/types';
	import { getPieceSymbol, positionToNotation } from '$lib/engines/chess/board';
	import { getPossibleMoves, makeMove, isKingInCheck } from '$lib/engines/chess/moves';

	interface Props {
		board: Board;
		playerColor: 'white' | 'black';
		isPlayerTurn: boolean;
		onMove: (move: Move) => void;
	}

	let { board, playerColor, isPlayerTurn, onMove }: Props = $props();

	let selectedSquare = $state<Position | null>(null);
	let possibleMoves = $state<Position[]>([]);

	function handleSquareClick(row: number, col: number) {
		if (!isPlayerTurn) return;

		const piece = board[row][col];

		// If clicking on own piece, select it
		if (piece && piece.color === playerColor) {
			selectedSquare = { row, col };
			possibleMoves = getPossibleMoves(board, { row, col }, piece);
			return;
		}

		// If a piece is selected and clicking on a valid move
		if (selectedSquare) {
			const isValidMove = possibleMoves.some((m) => m.row === row && m.col === col);

			if (isValidMove) {
				const move: Move = {
					from: selectedSquare,
					to: { row, col },
					piece: board[selectedSquare.row][selectedSquare.col]!,
					captured: board[row][col] || undefined
				};

				onMove(move);
				selectedSquare = null;
				possibleMoves = [];
			} else {
				selectedSquare = null;
				possibleMoves = [];
			}
		}
	}

	function isSquareSelected(row: number, col: number): boolean {
		return selectedSquare !== null && selectedSquare.row === row && selectedSquare.col === col;
	}

	function isSquarePossibleMove(row: number, col: number): boolean {
		return possibleMoves.some((m) => m.row === row && m.col === col);
	}

	function getSquareColor(row: number, col: number): string {
		const isLight = (row + col) % 2 === 0;
		return isLight ? 'bg-amber-100' : 'bg-amber-700';
	}
</script>

<div class="chess-board-container">
	<div class="chess-board grid grid-cols-8 gap-0 w-full max-w-2xl mx-auto aspect-square border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl">
		{#each Array(8) as _, row}
			{#each Array(8) as _, col}
				{@const piece = board[row][col]}
				{@const isSelected = isSquareSelected(row, col)}
				{@const isPossible = isSquarePossibleMove(row, col)}
				{@const squareColor = getSquareColor(row, col)}

				<button
					class="relative flex items-center justify-center text-4xl md:text-5xl lg:text-6xl transition-all duration-200 aspect-square cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 {squareColor} {isSelected
						? 'ring-4 ring-primary-500 ring-inset'
						: ''} {isPossible ? 'ring-2 ring-green-500 ring-inset' : ''} hover:brightness-110"
					onclick={() => handleSquareClick(row, col)}
					disabled={!isPlayerTurn}
				>
					{#if piece}
						<span
							class="select-none pointer-events-none {piece.color === 'white'
								? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'
								: 'text-slate-900 drop-shadow-[0_2px_2px_rgba(255,255,255,0.3)]'}"
						>
							{getPieceSymbol(piece)}
						</span>
					{/if}

					{#if isPossible}
						<div
							class="absolute inset-0 flex items-center justify-center pointer-events-none"
						>
							{#if piece}
								<div class="w-full h-full bg-red-500/30 rounded-full"></div>
							{:else}
								<div class="w-4 h-4 bg-green-500/60 rounded-full"></div>
							{/if}
						</div>
					{/if}

					<!-- Coordinate labels -->
					{#if col === 0}
						<span class="absolute left-1 top-1 text-xs font-bold opacity-50">
							{8 - row}
						</span>
					{/if}
					{#if row === 7}
						<span class="absolute right-1 bottom-1 text-xs font-bold opacity-50">
							{String.fromCharCode(97 + col)}
						</span>
					{/if}
				</button>
			{/each}
		{/each}
	</div>
</div>

