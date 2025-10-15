import type { Board, Move, Piece, Position, PieceColor } from './types';
import { getPossibleMoves, makeMove, isKingInCheck } from './moves';

const PIECE_VALUES: Record<string, number> = {
	pawn: 100,
	knight: 320,
	bishop: 330,
	rook: 500,
	queen: 900,
	king: 20000
};

export class ChessAI {
	private difficulty: number;

	constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
		this.difficulty = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
	}

	getBestMove(board: Board, color: PieceColor): Move | null {
		const allMoves = this.getAllPossibleMoves(board, color);

		if (allMoves.length === 0) return null;

		if (this.difficulty === 1) {
			// Easy: Random move
			return allMoves[Math.floor(Math.random() * allMoves.length)];
		} else if (this.difficulty === 2) {
			// Medium: Evaluate immediate captures and threats
			return this.getBestMoveByEvaluation(board, allMoves, color, 1);
		} else {
			// Hard: Look ahead 2 moves
			return this.getBestMoveByEvaluation(board, allMoves, color, 2);
		}
	}

	private getAllPossibleMoves(board: Board, color: PieceColor): Move[] {
		const moves: Move[] = [];

		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				const piece = board[row][col];
				if (piece && piece.color === color) {
					const from = { row, col };
					const possibleMoves = getPossibleMoves(board, from, piece);

					for (const to of possibleMoves) {
						const captured = board[to.row][to.col];
						moves.push({
							from,
							to,
							piece,
							captured: captured || undefined
						});
					}
				}
			}
		}

		return moves;
	}

	private getBestMoveByEvaluation(
		board: Board,
		moves: Move[],
		color: PieceColor,
		depth: number
	): Move {
		let bestMove = moves[0];
		let bestScore = -Infinity;

		for (const move of moves) {
			const newBoard = makeMove(board, move);
			const score = this.evaluatePosition(newBoard, color, depth - 1);

			if (score > bestScore) {
				bestScore = score;
				bestMove = move;
			}
		}

		return bestMove;
	}

	private evaluatePosition(board: Board, color: PieceColor, depth: number): number {
		let score = 0;

		// Material evaluation
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				const piece = board[row][col];
				if (piece) {
					const value = PIECE_VALUES[piece.type];
					score += piece.color === color ? value : -value;
				}
			}
		}

		// Check if king is in check (penalty)
		if (isKingInCheck(board, color)) {
			score -= 50;
		}

		const opponentColor = color === 'white' ? 'black' : 'white';
		if (isKingInCheck(board, opponentColor)) {
			score += 50;
		}

		// If depth > 0, look ahead
		if (depth > 0) {
			const opponentMoves = this.getAllPossibleMoves(board, opponentColor);
			if (opponentMoves.length > 0) {
				let worstOpponentScore = Infinity;
				for (const move of opponentMoves.slice(0, 5)) {
					// Limit to 5 moves for performance
					const newBoard = makeMove(board, move);
					const opponentScore = this.evaluatePosition(newBoard, color, depth - 1);
					worstOpponentScore = Math.min(worstOpponentScore, opponentScore);
				}
				score = worstOpponentScore;
			}
		}

		return score;
	}
}

