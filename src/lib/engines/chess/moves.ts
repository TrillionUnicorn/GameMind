import type { Board, Piece, Position, Move } from './types';
import { copyBoard } from './board';

export function isValidPosition(pos: Position): boolean {
	return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
}

export function getPossibleMoves(board: Board, from: Position, piece: Piece): Position[] {
	const moves: Position[] = [];

	switch (piece.type) {
		case 'pawn':
			moves.push(...getPawnMoves(board, from, piece));
			break;
		case 'knight':
			moves.push(...getKnightMoves(board, from, piece));
			break;
		case 'bishop':
			moves.push(...getBishopMoves(board, from, piece));
			break;
		case 'rook':
			moves.push(...getRookMoves(board, from, piece));
			break;
		case 'queen':
			moves.push(...getQueenMoves(board, from, piece));
			break;
		case 'king':
			moves.push(...getKingMoves(board, from, piece));
			break;
	}

	return moves.filter(isValidPosition);
}

function getPawnMoves(board: Board, from: Position, piece: Piece): Position[] {
	const moves: Position[] = [];
	const direction = piece.color === 'white' ? -1 : 1;
	const startRow = piece.color === 'white' ? 6 : 1;

	// Forward move
	const forward = { row: from.row + direction, col: from.col };
	if (isValidPosition(forward) && !board[forward.row][forward.col]) {
		moves.push(forward);

		// Double forward from start
		if (from.row === startRow) {
			const doubleForward = { row: from.row + 2 * direction, col: from.col };
			if (!board[doubleForward.row][doubleForward.col]) {
				moves.push(doubleForward);
			}
		}
	}

	// Captures
	const captures = [
		{ row: from.row + direction, col: from.col - 1 },
		{ row: from.row + direction, col: from.col + 1 }
	];

	for (const capture of captures) {
		if (isValidPosition(capture)) {
			const target = board[capture.row][capture.col];
			if (target && target.color !== piece.color) {
				moves.push(capture);
			}
		}
	}

	return moves;
}

function getKnightMoves(board: Board, from: Position, piece: Piece): Position[] {
	const moves: Position[] = [];
	const offsets = [
		[-2, -1], [-2, 1], [-1, -2], [-1, 2],
		[1, -2], [1, 2], [2, -1], [2, 1]
	];

	for (const [dRow, dCol] of offsets) {
		const to = { row: from.row + dRow, col: from.col + dCol };
		if (isValidPosition(to)) {
			const target = board[to.row][to.col];
			if (!target || target.color !== piece.color) {
				moves.push(to);
			}
		}
	}

	return moves;
}

function getBishopMoves(board: Board, from: Position, piece: Piece): Position[] {
	return getSlidingMoves(board, from, piece, [
		[-1, -1], [-1, 1], [1, -1], [1, 1]
	]);
}

function getRookMoves(board: Board, from: Position, piece: Piece): Position[] {
	return getSlidingMoves(board, from, piece, [
		[-1, 0], [1, 0], [0, -1], [0, 1]
	]);
}

function getQueenMoves(board: Board, from: Position, piece: Piece): Position[] {
	return getSlidingMoves(board, from, piece, [
		[-1, -1], [-1, 0], [-1, 1],
		[0, -1], [0, 1],
		[1, -1], [1, 0], [1, 1]
	]);
}

function getKingMoves(board: Board, from: Position, piece: Piece): Position[] {
	const moves: Position[] = [];
	const offsets = [
		[-1, -1], [-1, 0], [-1, 1],
		[0, -1], [0, 1],
		[1, -1], [1, 0], [1, 1]
	];

	for (const [dRow, dCol] of offsets) {
		const to = { row: from.row + dRow, col: from.col + dCol };
		if (isValidPosition(to)) {
			const target = board[to.row][to.col];
			if (!target || target.color !== piece.color) {
				moves.push(to);
			}
		}
	}

	return moves;
}

function getSlidingMoves(
	board: Board,
	from: Position,
	piece: Piece,
	directions: number[][]
): Position[] {
	const moves: Position[] = [];

	for (const [dRow, dCol] of directions) {
		let row = from.row + dRow;
		let col = from.col + dCol;

		while (isValidPosition({ row, col })) {
			const target = board[row][col];

			if (!target) {
				moves.push({ row, col });
			} else {
				if (target.color !== piece.color) {
					moves.push({ row, col });
				}
				break;
			}

			row += dRow;
			col += dCol;
		}
	}

	return moves;
}

export function makeMove(board: Board, move: Move): Board {
	const newBoard = copyBoard(board);
	newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
	newBoard[move.from.row][move.from.col] = null;
	return newBoard;
}

export function isKingInCheck(board: Board, kingColor: 'white' | 'black'): boolean {
	// Find king position
	let kingPos: Position | null = null;
	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			const piece = board[row][col];
			if (piece && piece.type === 'king' && piece.color === kingColor) {
				kingPos = { row, col };
				break;
			}
		}
		if (kingPos) break;
	}

	if (!kingPos) return false;

	// Check if any opponent piece can attack the king
	const opponentColor = kingColor === 'white' ? 'black' : 'white';
	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {
			const piece = board[row][col];
			if (piece && piece.color === opponentColor) {
				const moves = getPossibleMoves(board, { row, col }, piece);
				if (moves.some((m) => m.row === kingPos!.row && m.col === kingPos!.col)) {
					return true;
				}
			}
		}
	}

	return false;
}

