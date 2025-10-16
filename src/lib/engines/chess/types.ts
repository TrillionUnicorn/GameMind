export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Piece {
	type: PieceType;
	color: PieceColor;
}

export interface Position {
	row: number;
	col: number;
}

export interface Move {
	from: Position;
	to: Position;
	piece: Piece;
	captured?: Piece;
	promotion?: PieceType;
	castling?: boolean;
	enPassant?: boolean;
}

export type Board = (Piece | null)[][];

export interface GameState {
	board: Board;
	currentPlayer: PieceColor;
	moveHistory: Move[];
	isCheck: boolean;
	isCheckmate: boolean;
	isStalemate: boolean;
	canCastleKingside: { white: boolean; black: boolean };
	canCastleQueenside: { white: boolean; black: boolean };
	enPassantTarget: Position | null;
}

