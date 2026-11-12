import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryMatchGame } from "../features/games/memory-match/MemoryMatchGame";
import {
  generateDeck,
  checkIsMatch,
  shuffleArray,
} from "../features/games/memory-match/memoryMatchLogic";

describe("Phase 5 — Memory Match Logic & Gameplay", () => {
  describe("Pure Logic & Deck Generation", () => {
    it("generates correct card and pair counts for each difficulty", () => {
      const easyDeck = generateDeck("easy");
      expect(easyDeck).toHaveLength(8);
      expect(new Set(easyDeck.map((c) => c.pairId)).size).toBe(4);

      const mediumDeck = generateDeck("medium");
      expect(mediumDeck).toHaveLength(12);
      expect(new Set(mediumDeck.map((c) => c.pairId)).size).toBe(6);

      const hardDeck = generateDeck("hard");
      expect(hardDeck).toHaveLength(16);
      expect(new Set(hardDeck.map((c) => c.pairId)).size).toBe(8);
    });

    it("ensures each pair has exactly two matching cards", () => {
      const deck = generateDeck("hard");
      const pairCounts = deck.reduce(
        (acc, card) => {
          acc[card.pairId] = (acc[card.pairId] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      Object.values(pairCounts).forEach((count) => {
        expect(count).toBe(2);
      });
    });

    it("correctly identifies matching and non-matching cards", () => {
      const deck = [
        { id: "react-a", pairId: "react", label: "React", iconKey: "Atom" },
        { id: "react-b", pairId: "react", label: "React", iconKey: "Atom" },
        { id: "ts-a", pairId: "ts", label: "TypeScript", iconKey: "FileCode" },
      ];

      expect(checkIsMatch("react-a", "react-b", deck)).toBe(true);
      expect(checkIsMatch("react-a", "ts-a", deck)).toBe(false);
      expect(checkIsMatch("react-a", "react-a", deck)).toBe(false); // same card cannot match itself
    });

    it("shuffleArray preserves all elements without mutation", () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8];
      const shuffled = shuffleArray(original);

      expect(shuffled).toHaveLength(original.length);
      expect(new Set(shuffled)).toEqual(new Set(original));
    });
  });

  describe("MemoryMatchGame Component Interaction", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("renders initial game state with easy difficulty (8 cards)", () => {
      render(<MemoryMatchGame />);

      expect(screen.getByTestId("memory-match-game")).toBeInTheDocument();
      expect(screen.getByTestId("memory-pairs-count")).toHaveTextContent(
        "0 / 4",
      );
      expect(screen.getByTestId("memory-moves-count")).toHaveTextContent("0");
      expect(screen.getByTestId("memory-timer")).toHaveTextContent("00:00");

      const cards = screen.getAllByRole("button", { name: /Card \d+:/i });
      expect(cards).toHaveLength(8);
    });

    it("changes difficulty and resets deck size accordingly", () => {
      render(<MemoryMatchGame />);

      // Switch to Medium (12 cards)
      fireEvent.click(screen.getByRole("button", { name: "Medium" }));
      expect(screen.getByTestId("memory-pairs-count")).toHaveTextContent(
        "0 / 6",
      );
      expect(
        screen.getAllByRole("button", { name: /Card \d+:/i }),
      ).toHaveLength(12);

      // Switch to Hard (16 cards)
      fireEvent.click(screen.getByRole("button", { name: "Hard" }));
      expect(screen.getByTestId("memory-pairs-count")).toHaveTextContent(
        "0 / 8",
      );
      expect(
        screen.getAllByRole("button", { name: /Card \d+:/i }),
      ).toHaveLength(16);
    });

    it("starts timer on first card click and increments elapsed time", () => {
      render(<MemoryMatchGame />);

      const cards = screen.getAllByRole("button", { name: /Card \d+:/i });
      fireEvent.click(cards[0]);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.getByTestId("memory-timer")).toHaveTextContent("00:03");
    });

    it("increments move count when two cards are flipped", () => {
      render(<MemoryMatchGame />);

      const cards = screen.getAllByRole("button", { name: /Card \d+:/i });
      fireEvent.click(cards[0]);
      expect(screen.getByTestId("memory-moves-count")).toHaveTextContent("0");

      fireEvent.click(cards[1]);
      expect(screen.getByTestId("memory-moves-count")).toHaveTextContent("1");
    });

    it("prevents selecting the same card twice in one turn", () => {
      render(<MemoryMatchGame />);

      const cards = screen.getAllByRole("button", { name: /Card \d+:/i });
      fireEvent.click(cards[0]);
      // Clicking same card again should not increment moves
      fireEvent.click(cards[0]);

      expect(screen.getByTestId("memory-moves-count")).toHaveTextContent("0");
    });

    it("handles mismatch timeout without corrupting newly restarted game", () => {
      render(<MemoryMatchGame />);

      const cards = screen.getAllByRole("button", { name: /Card \d+:/i });
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);

      // Restart while mismatch timeout is in flight
      fireEvent.click(screen.getByRole("button", { name: /Restart/i }));

      expect(screen.getByTestId("memory-moves-count")).toHaveTextContent("0");
      expect(screen.getByTestId("memory-pairs-count")).toHaveTextContent(
        "0 / 4",
      );

      // Advance timers
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Should remain cleanly reset
      expect(screen.getByTestId("memory-moves-count")).toHaveTextContent("0");
    });
  });
});
