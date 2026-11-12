export type MemoryDifficulty = "easy" | "medium" | "hard";

export interface MemoryCard {
  id: string; // Unique instance ID (e.g., "react-0")
  pairId: string; // Identifier shared by matching pair (e.g., "react")
  label: string; // Human-readable name (e.g., "React")
  iconKey: string; // Identifier for rendering icon/visual
}

export interface MemoryMatchConfig {
  difficulty: MemoryDifficulty;
  pairsCount: number;
  columns: number;
}

export interface MemoryGameState {
  cards: MemoryCard[];
  revealedCardIds: string[];
  matchedPairIds: string[];
  moves: number;
  isLocked: boolean;
  isCompleted: boolean;
  difficulty: MemoryDifficulty;
  elapsedSeconds: number;
  hasStarted: boolean;
}
