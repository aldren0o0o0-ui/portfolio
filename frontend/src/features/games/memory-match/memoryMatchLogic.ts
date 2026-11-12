import type {
  MemoryCard,
  MemoryDifficulty,
  MemoryMatchConfig,
} from "./memoryMatchTypes";

export const DIFFICULTY_CONFIGS: Record<MemoryDifficulty, MemoryMatchConfig> = {
  easy: {
    difficulty: "easy",
    pairsCount: 4, // 8 cards total (4x2)
    columns: 4,
  },
  medium: {
    difficulty: "medium",
    pairsCount: 6, // 12 cards total (4x3)
    columns: 4,
  },
  hard: {
    difficulty: "hard",
    pairsCount: 8, // 16 cards total (4x4)
    columns: 4,
  },
};

export const AVAILABLE_SYMBOLS: Array<{
  pairId: string;
  label: string;
  iconKey: string;
}> = [
  { pairId: "react", label: "React", iconKey: "Atom" },
  { pairId: "ts", label: "TypeScript", iconKey: "FileCode" },
  { pairId: "python", label: "Python", iconKey: "Terminal" },
  { pairId: "database", label: "PostgreSQL", iconKey: "Database" },
  { pairId: "api", label: "REST API", iconKey: "Network" },
  { pairId: "docker", label: "Docker", iconKey: "Box" },
  { pairId: "git", label: "Git", iconKey: "GitBranch" },
  { pairId: "cpu", label: "Systems", iconKey: "Cpu" },
  { pairId: "shield", label: "Security", iconKey: "ShieldCheck" },
  { pairId: "server", label: "Cloud Server", iconKey: "Server" },
];

/**
 * Fisher-Yates shuffle algorithm that returns a new shuffled array without mutating the original.
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Generates and shuffles a clean card deck based on difficulty.
 */
export function generateDeck(difficulty: MemoryDifficulty): MemoryCard[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const selectedSymbols = AVAILABLE_SYMBOLS.slice(0, config.pairsCount);

  const cards: MemoryCard[] = [];
  selectedSymbols.forEach((sym) => {
    cards.push({
      id: `${sym.pairId}-a`,
      pairId: sym.pairId,
      label: sym.label,
      iconKey: sym.iconKey,
    });
    cards.push({
      id: `${sym.pairId}-b`,
      pairId: sym.pairId,
      label: sym.label,
      iconKey: sym.iconKey,
    });
  });

  return shuffleArray(cards);
}

/**
 * Checks whether two revealed card IDs constitute a matching pair.
 */
export function checkIsMatch(
  cardId1: string,
  cardId2: string,
  deck: MemoryCard[],
): boolean {
  const card1 = deck.find((c) => c.id === cardId1);
  const card2 = deck.find((c) => c.id === cardId2);
  if (!card1 || !card2 || card1.id === card2.id) {
    return false;
  }
  return card1.pairId === card2.pairId;
}
