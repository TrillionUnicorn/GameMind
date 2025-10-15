import type { Board, Piece, PieceColor, PieceType } from './types';

export function createInitialBoard(): Board {
	const board: Board = Array(8)
		.fill(null)
		.map(() => Array(8).fill(null));

	// Setup pawns
	for (let col = 0; col < 8; col++) {
		board[1][col] = { type: 'pawn', color: 'black' };
		board[6][col] = { type: 'pawn', color: 'white' };
	}

	// Setup other pieces
	const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

	for (let col = 0; col < 8; col++) {
		board[0][col] = { type: backRow[col], color: 'black' };
		board[7][col] = { type: backRow[col], color: 'white' };
	}

	return board;
}

export function copyBoard(board: Board): Board {
	return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
}

export function getPieceSymbol(piece: Piece): string {
	const symbols: Record<PieceColor, Record<PieceType, string>> = {
		white: {
			king: '♔',
			queen: '♕',
			rook: '♖',
			bishop: '♗',
			knight: '♘',
			pawn: '♙'
		},
		black: {
			king: '♚',
			queen: '♛',
			rook: '♜',
			bishop: '♝',
			knight: '♞',
			pawn: '♟'
		}
	};

	return symbols[piece.color][piece.type];
}

export function positionToNotation(row: number, col: number): string {
	const files = 'abcdefgh';
	const ranks = '87654321';
	return files[col] + ranks[row];
}

export function notationToPosition(notation: string): { row: number; col: number } {
	const files = 'abcdefgh';
	const ranks = '87654321';
	const col = files.indexOf(notation[0]);
	const row = ranks.indexOf(notation[1]);
	return { row, col };
}

