# 🤖 Universal AI Engine Architecture

## Overview
A plugin-based AI engine that can play ANY board game without training, using traditional game tree search algorithms.

---

## 🎯 **Core Concept**

### **The Problem**
- Each game (Chess, Mahjong, Go) has different rules
- Traditional approach: Write separate AI for each game
- This is inefficient and hard to maintain

### **The Solution**
- Define a universal interface that ALL games must implement
- Write ONE AI engine that works with this interface
- AI doesn't know about specific games, only the interface
- Add new games by implementing the interface

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                   Universal AI Engine                    │
│  (Minimax, Alpha-Beta, Monte Carlo Tree Search)         │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Uses
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   GameEngine Interface                   │
│  - getPossibleMoves()                                    │
│  - isValidMove()                                         │
│  - applyMove()                                           │
│  - evaluatePosition()                                    │
│  - isGameOver()                                          │
└─────────────────────────────────────────────────────────┘
                           │
                           │ Implemented by
                           ▼
┌──────────────┬──────────────┬──────────────┬────────────┐
│ ChessEngine  │ MahjongEngine│   GoEngine   │  Any Game  │
│  (Plugin)    │   (Plugin)   │   (Plugin)   │  (Plugin)  │
└──────────────┴──────────────┴──────────────┴────────────┘
```

---

## 📝 **Core Interface**

```typescript
// src/lib/engines/core/types.ts

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  metadata?: any; // Game-specific data (e.g., promotion piece)
}

export interface Player {
  id: string;
  color: 'white' | 'black' | string;
}

export interface GameState {
  board: any; // Game-specific board representation
  currentPlayer: Player;
  moveHistory: Move[];
  gameOver: boolean;
  winner: Player | null;
  metadata?: any; // Game-specific state
}

export interface GameEngine {
  // Game initialization
  initializeGame(): GameState;
  
  // Move generation
  getPossibleMoves(state: GameState, position: Position): Move[];
  getAllPossibleMoves(state: GameState, player: Player): Move[];
  
  // Move validation
  isValidMove(state: GameState, move: Move): boolean;
  
  // Move execution
  applyMove(state: GameState, move: Move): GameState;
  
  // Game rules
  isGameOver(state: GameState): boolean;
  getWinner(state: GameState): Player | null;
  
  // Position evaluation (for AI)
  evaluatePosition(state: GameState, player: Player): number;
  
  // Game metadata
  getGameName(): string;
  getPlayerCount(): number;
}
```

---

## 🧠 **Universal AI Implementation**

```typescript
// src/lib/engines/core/UniversalAI.ts

export class UniversalAI {
  constructor(
    private engine: GameEngine,
    private difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ) {}
  
  /**
   * Find the best move for the current player
   */
  findBestMove(state: GameState): Move | null {
    const depth = this.getSearchDepth();
    const moves = this.engine.getAllPossibleMoves(state, state.currentPlayer);
    
    if (moves.length === 0) return null;
    
    // Easy: Random move
    if (this.difficulty === 'easy') {
      return moves[Math.floor(Math.random() * moves.length)];
    }
    
    // Medium/Hard: Use minimax
    let bestMove: Move | null = null;
    let bestScore = -Infinity;
    
    for (const move of moves) {
      const newState = this.engine.applyMove(state, move);
      const score = this.minimax(newState, depth - 1, -Infinity, Infinity, false);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }
  
  /**
   * Minimax algorithm with alpha-beta pruning
   * Works for ANY game that implements GameEngine
   */
  private minimax(
    state: GameState,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    // Base case: depth 0 or game over
    if (depth === 0 || this.engine.isGameOver(state)) {
      return this.engine.evaluatePosition(state, state.currentPlayer);
    }
    
    const moves = this.engine.getAllPossibleMoves(state, state.currentPlayer);
    
    if (isMaximizing) {
      let maxScore = -Infinity;
      
      for (const move of moves) {
        const newState = this.engine.applyMove(state, move);
        const score = this.minimax(newState, depth - 1, alpha, beta, false);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        
        // Alpha-beta pruning
        if (beta <= alpha) break;
      }
      
      return maxScore;
    } else {
      let minScore = Infinity;
      
      for (const move of moves) {
        const newState = this.engine.applyMove(state, move);
        const score = this.minimax(newState, depth - 1, alpha, beta, true);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        
        // Alpha-beta pruning
        if (beta <= alpha) break;
      }
      
      return minScore;
    }
  }
  
  /**
   * Get search depth based on difficulty
   */
  private getSearchDepth(): number {
    switch (this.difficulty) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      default: return 2;
    }
  }
}
```

---

## ♟️ **Chess Plugin Example**

```typescript
// src/lib/engines/plugins/ChessEngine.ts

export class ChessEngine implements GameEngine {
  getGameName(): string {
    return 'Chess';
  }
  
  getPlayerCount(): number {
    return 2;
  }
  
  initializeGame(): GameState {
    return {
      board: this.createInitialBoard(),
      currentPlayer: { id: 'white', color: 'white' },
      moveHistory: [],
      gameOver: false,
      winner: null
    };
  }
  
  getPossibleMoves(state: GameState, position: Position): Move[] {
    const piece = state.board[position.row][position.col];
    if (!piece || piece.color !== state.currentPlayer.color) {
      return [];
    }
    
    // Generate moves based on piece type
    switch (piece.type) {
      case 'pawn': return this.getPawnMoves(state, position);
      case 'knight': return this.getKnightMoves(state, position);
      case 'bishop': return this.getBishopMoves(state, position);
      case 'rook': return this.getRookMoves(state, position);
      case 'queen': return this.getQueenMoves(state, position);
      case 'king': return this.getKingMoves(state, position);
      default: return [];
    }
  }
  
  getAllPossibleMoves(state: GameState, player: Player): Move[] {
    const moves: Move[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row][col];
        if (piece && piece.color === player.color) {
          const pieceMoves = this.getPossibleMoves(state, { row, col });
          moves.push(...pieceMoves);
        }
      }
    }
    
    return moves;
  }
  
  isValidMove(state: GameState, move: Move): boolean {
    const possibleMoves = this.getPossibleMoves(state, move.from);
    return possibleMoves.some(m => 
      m.to.row === move.to.row && m.to.col === move.to.col
    );
  }
  
  applyMove(state: GameState, move: Move): GameState {
    // Create new state (immutable)
    const newBoard = JSON.parse(JSON.stringify(state.board));
    const piece = newBoard[move.from.row][move.from.col];
    
    // Move piece
    newBoard[move.to.row][move.to.col] = piece;
    newBoard[move.from.row][move.from.col] = null;
    
    // Switch player
    const newPlayer = state.currentPlayer.color === 'white'
      ? { id: 'black', color: 'black' }
      : { id: 'white', color: 'white' };
    
    return {
      board: newBoard,
      currentPlayer: newPlayer,
      moveHistory: [...state.moveHistory, move],
      gameOver: this.isGameOver({ ...state, board: newBoard }),
      winner: this.getWinner({ ...state, board: newBoard })
    };
  }
  
  isGameOver(state: GameState): boolean {
    // Check for checkmate, stalemate, etc.
    return false; // Simplified
  }
  
  getWinner(state: GameState): Player | null {
    return null; // Simplified
  }
  
  evaluatePosition(state: GameState, player: Player): number {
    let score = 0;
    
    // Material count
    const pieceValues = {
      pawn: 1,
      knight: 3,
      bishop: 3,
      rook: 5,
      queen: 9,
      king: 0
    };
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row][col];
        if (piece) {
          const value = pieceValues[piece.type];
          if (piece.color === player.color) {
            score += value;
          } else {
            score -= value;
          }
        }
      }
    }
    
    return score;
  }
  
  // Helper methods...
  private createInitialBoard() { /* ... */ }
  private getPawnMoves(state: GameState, pos: Position): Move[] { /* ... */ }
  private getKnightMoves(state: GameState, pos: Position): Move[] { /* ... */ }
  // ... etc
}
```

---

## 🀄 **Mahjong Plugin Example**

```typescript
// src/lib/engines/plugins/MahjongEngine.ts

export class MahjongEngine implements GameEngine {
  getGameName(): string {
    return 'Mahjong';
  }
  
  getPlayerCount(): number {
    return 4;
  }
  
  // Implement all GameEngine methods for Mahjong rules
  // AI doesn't need to know Mahjong rules - just uses the interface!
}
```

---

## 🎮 **Usage Example**

```typescript
// In your Svelte component

import { UniversalAI } from '$lib/engines/core/UniversalAI';
import { ChessEngine } from '$lib/engines/plugins/ChessEngine';
import { MahjongEngine } from '$lib/engines/plugins/MahjongEngine';

// Play Chess
const chessEngine = new ChessEngine();
const chessAI = new UniversalAI(chessEngine, 'hard');
const chessState = chessEngine.initializeGame();
const bestChessMove = chessAI.findBestMove(chessState);

// Play Mahjong (same AI, different game!)
const mahjongEngine = new MahjongEngine();
const mahjongAI = new UniversalAI(mahjongEngine, 'medium');
const mahjongState = mahjongEngine.initializeGame();
const bestMahjongMove = mahjongAI.findBestMove(mahjongState);
```

---

## 🚀 **Benefits**

### **1. No Training Required**
- AI uses game tree search (minimax)
- Doesn't need training data
- Works immediately for new games

### **2. Easy to Add Games**
- Implement `GameEngine` interface
- AI works automatically
- No AI code changes needed

### **3. Consistent Difficulty**
- Same difficulty levels across all games
- Easy, Medium, Hard work the same way
- Predictable behavior

### **4. Testable**
- Each game engine can be tested independently
- AI can be tested with mock game engines
- Clear separation of concerns

### **5. Extensible**
- Can add Monte Carlo Tree Search
- Can add neural network evaluation
- Can add opening books
- Can add endgame tablebases

---

## 🔮 **Future Enhancements**

### **1. Monte Carlo Tree Search (MCTS)**
```typescript
class MCTSUniversalAI {
  findBestMove(state: GameState): Move {
    // Use MCTS instead of minimax
    // Better for games with high branching factor (Go)
  }
}
```

### **2. Neural Network Evaluation**
```typescript
class NeuralUniversalAI {
  async train(gameEngine: GameEngine, games: GameHistory[]) {
    // Train neural network on game history
  }
  
  async findBestMove(state: GameState): Promise<Move> {
    // Use neural network for position evaluation
  }
}
```

### **3. Opening Books**
```typescript
class OpeningBook {
  getMove(state: GameState): Move | null {
    // Return book move if position is in opening book
  }
}
```

---

## 📊 **Performance Considerations**

### **Optimization Techniques**
1. **Alpha-Beta Pruning**: Already implemented
2. **Move Ordering**: Evaluate captures first
3. **Transposition Tables**: Cache evaluated positions
4. **Iterative Deepening**: Search deeper gradually
5. **Quiescence Search**: Extend search for tactical positions

---

## 🎯 **Implementation Checklist**

- [ ] Create `GameEngine` interface
- [ ] Implement `UniversalAI` class
- [ ] Refactor `ChessEngine` to use interface
- [ ] Test Chess with Universal AI
- [ ] Implement `MahjongEngine`
- [ ] Implement `GoEngine`
- [ ] Add MCTS for Go
- [ ] Add opening books
- [ ] Add endgame tablebases
- [ ] Optimize performance

---

**🤖 Universal AI Engine: One AI to rule them all!**

