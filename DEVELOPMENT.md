# 🎮 GameMind Development Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **npm** 9+ or **pnpm** 8+
- **Git** for version control
- **VS Code** (recommended) with Svelte extension

### Installation & Setup
```bash
# Clone the repository
git clone https://github.com/TrillionUnicorn/GameMind.git
cd GameMind

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:5175
```

---

## 🏗️ Project Architecture

### Tech Stack
- **Frontend**: SvelteKit 2 + Svelte 5 (Runes)
- **Styling**: Tailwind CSS + shadcn-svelte
- **TypeScript**: Full type safety
- **Game Engines**: Custom AI engines for each game
- **AI Models**: TensorFlow.js + Custom neural networks
- **Real-time**: WebSocket connections for multiplayer

### Folder Structure
```
GameMind/
├── src/
│   ├── lib/
│   │   ├── components/          # Reusable UI components
│   │   ├── stores/             # Svelte stores (game state)
│   │   ├── engines/            # Game AI engines
│   │   │   ├── chess/          # Chess engine & AI
│   │   │   ├── mahjong/        # Mahjong engine & AI
│   │   │   ├── go/             # Go/Weiqi engine & AI
│   │   │   └── common/         # Shared game logic
│   │   ├── ai/                 # AI models and training
│   │   ├── multiplayer/        # WebSocket & real-time logic
│   │   └── types/              # TypeScript type definitions
│   ├── routes/                 # SvelteKit routes
│   ├── app.html               # HTML template
│   └── app.css                # Global styles
├── static/                    # Static assets
├── tests/                     # Test files
├── models/                    # AI model files
└── docs/                      # Documentation
```

---

## 🎯 Game Engine Implementation

### Chess Engine
```typescript
// Example chess engine implementation
interface ChessPosition {
  board: string[][]; // 8x8 board representation
  turn: 'white' | 'black';
  castling: CastlingRights;
  enPassant: string | null;
  halfmove: number;
  fullmove: number;
}

class ChessEngine {
  private ai: ChessAI;
  
  constructor(difficulty: number) {
    this.ai = new ChessAI(difficulty);
  }
  
  async getBestMove(position: ChessPosition): Promise<Move> {
    // Implementation in /src/lib/engines/chess/engine.ts
    return this.ai.search(position, this.getSearchDepth());
  }
  
  private getSearchDepth(): number {
    // Adaptive depth based on position complexity
    return Math.min(8, this.calculateOptimalDepth());
  }
}
```

### Mahjong Engine
```typescript
// Mahjong game logic and AI
interface MahjongHand {
  tiles: Tile[];
  melds: Meld[];
  discards: Tile[];
}

class MahjongEngine {
  private ai: MahjongAI;
  
  async getOptimalDiscard(hand: MahjongHand): Promise<Tile> {
    // Advanced tile efficiency calculation
    return this.ai.calculateBestDiscard(hand);
  }
  
  async detectWinningHand(hand: MahjongHand): Promise<WinCondition[]> {
    // Check for all possible winning combinations
    return this.ai.analyzeWinConditions(hand);
  }
}
```

### AI Difficulty System
```typescript
// Adaptive AI difficulty
class AdaptiveAI {
  private playerSkillLevel: number;
  private gameHistory: GameResult[];
  
  adjustDifficulty(): void {
    const recentPerformance = this.analyzeRecentGames();
    
    if (recentPerformance.winRate > 0.7) {
      this.increaseDifficulty();
    } else if (recentPerformance.winRate < 0.3) {
      this.decreaseDifficulty();
    }
  }
  
  private calculateOptimalDifficulty(): number {
    // Machine learning model to predict optimal difficulty
    return this.mlModel.predict(this.getPlayerFeatures());
  }
}
```

---

## 🎨 UI/UX Development

### Design System (GameMind Theme)
```css
:root {
  --primary: 239 68 68;        /* Red 500 - Gaming & Competition */
  --secondary: 245 101 101;    /* Red 400 - Actions */
  --accent: 220 38 38;         /* Red 600 - Highlights */
  --success: 34 197 94;        /* Emerald 500 - Wins */
  --warning: 251 191 36;       /* Amber 500 - Draws */
}
```

### Game Board Components
```svelte
<!-- Example: Chess Board Component -->
<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import type { ChessPosition, Move } from '$lib/types/chess';
  
  interface Props {
    position: ChessPosition;
    onMove: (move: Move) => void;
    playerColor: 'white' | 'black';
    isPlayerTurn: boolean;
  }
  
  let { position, onMove, playerColor, isPlayerTurn }: Props = $props();
  let selectedSquare = $state<string | null>(null);
  let possibleMoves = $state<Move[]>([]);
  
  function handleSquareClick(square: string) {
    if (!isPlayerTurn) return;
    
    if (selectedSquare === square) {
      selectedSquare = null;
      possibleMoves = [];
    } else if (selectedSquare && possibleMoves.some(m => m.to === square)) {
      const move = { from: selectedSquare, to: square };
      onMove(move);
      selectedSquare = null;
      possibleMoves = [];
    } else {
      selectedSquare = square;
      possibleMoves = calculatePossibleMoves(square, position);
    }
  }
</script>

<div class="chess-board">
  {#each Array(8) as _, rank}
    {#each Array(8) as _, file}
      {@const square = getSquareName(rank, file)}
      {@const piece = position.board[rank][file]}
      {@const isSelected = selectedSquare === square}
      {@const isPossibleMove = possibleMoves.some(m => m.to === square)}
      
      <button
        class="chess-square {getSquareColor(rank, file)} {isSelected ? 'selected' : ''} {isPossibleMove ? 'possible-move' : ''}"
        on:click={() => handleSquareClick(square)}
        disabled={!isPlayerTurn}
      >
        {#if piece}
          <div class="chess-piece {piece.color}">
            {getPieceSymbol(piece)}
          </div>
        {/if}
        
        {#if isPossibleMove}
          <div class="move-indicator"></div>
        {/if}
      </button>
    {/each}
  {/each}
</div>
```

---

## 🧪 Testing Strategy

### Game Logic Testing
```bash
# Test game engines
npm run test:chess
npm run test:mahjong
npm run test:go

# Test AI algorithms
npm run test:ai

# Performance testing
npm run test:performance
```

### AI Testing
```typescript
// Example AI testing
describe('Chess AI', () => {
  test('should find checkmate in 2 moves', async () => {
    const position = createCheckmateIn2Position();
    const move = await chessAI.getBestMove(position);
    
    expect(move).toEqual(expectedCheckmateMove);
  });
  
  test('should avoid blunders', async () => {
    const position = createBlunderTestPosition();
    const move = await chessAI.getBestMove(position);
    
    expect(move).not.toEqual(blunderMove);
  });
});
```

---

## 🚀 Deployment

### Environment Configuration
```bash
# .env.local (never commit this file)
VITE_CHESS_ENGINE_URL=https://api.gamemind.com/chess
VITE_MAHJONG_ENGINE_URL=https://api.gamemind.com/mahjong
VITE_AI_MODEL_URL=https://models.gamemind.com
VITE_WEBSOCKET_URL=wss://realtime.gamemind.com
VITE_ANALYTICS_KEY=your_analytics_key
```

### AI Model Deployment
```bash
# Deploy AI models
npm run deploy:models

# Update model versions
npm run update:chess-model
npm run update:mahjong-model
```

---

## 🤝 Contributing Guidelines

### Game Development Standards
- **Move Validation**: Always validate moves on both client and server
- **AI Fairness**: Ensure AI doesn't cheat or access hidden information
- **Performance**: Optimize for real-time gameplay
- **Accessibility**: Support keyboard navigation and screen readers
- **Internationalization**: Support multiple languages

### Code Standards
```typescript
// Example: Proper move validation
// ❌ DON'T DO THIS
function makeMove(move: Move) {
  // Direct move without validation
  applyMove(move);
}

// ✅ DO THIS
function makeMove(move: Move): MoveResult {
  // Validate move first
  const validation = validateMove(move, currentPosition);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }
  
  // Apply move and update game state
  const newPosition = applyMove(move, currentPosition);
  updateGameState(newPosition);
  
  return { success: true, newPosition };
}
```

---

## 📚 Resources & Documentation

### Game Development Resources
- **Chess Programming**: https://www.chessprogramming.org/
- **Mahjong Rules**: https://mahjong-guide.com/
- **Go/Weiqi**: https://senseis.xmp.net/
- **Game AI**: https://gameai.com/

### AI & Machine Learning
- **TensorFlow.js**: https://www.tensorflow.org/js
- **Chess AI**: https://github.com/official-stockfish/Stockfish
- **AlphaZero Paper**: https://arxiv.org/abs/1712.01815

### Community
- **Discord**: [GameMind Developers](https://discord.gg/gamemind-dev)
- **Chess Programming**: [Chess Programming Wiki](https://www.chessprogramming.org/)

---

## 🔒 Security & Fair Play

### Anti-Cheat Measures
- **Move Validation**: Server-side move validation
- **Time Controls**: Strict timing enforcement
- **Pattern Detection**: Detect engine assistance
- **Rate Limiting**: Prevent rapid-fire moves

### Data Protection
- **Game Privacy**: Optional anonymous gameplay
- **Skill Tracking**: Encrypted player statistics
- **Fair Matching**: Balanced opponent matching
- **Replay Protection**: Secure game history

---

## 📞 Support & Contact

### Development Support
- **Technical Issues**: [GitHub Issues](https://github.com/TrillionUnicorn/GameMind/issues)
- **Game Rules**: rules@gamemind.com
- **AI Questions**: ai@gamemind.com

### Team Contact
- **Hunter Ho** (Founder): hunter@gamemind.com
- **Game Development**: games@gamemind.com
- **General Inquiries**: hello@gamemind.com

---

*Building the future of intelligent gaming. Where human creativity meets artificial intelligence.* 🎮🤖
