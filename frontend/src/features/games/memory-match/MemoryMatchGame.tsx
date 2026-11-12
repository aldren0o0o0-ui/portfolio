import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Atom,
  FileCode,
  Terminal,
  Database,
  Network,
  Box,
  GitBranch,
  Cpu,
  ShieldCheck,
  Server,
  RotateCcw,
  Trophy,
  Timer,
  CheckCircle2,
} from "lucide-react";
import type { MemoryCard, MemoryDifficulty } from "./memoryMatchTypes";
import {
  DIFFICULTY_CONFIGS,
  generateDeck,
  checkIsMatch,
} from "./memoryMatchLogic";
import styles from "./MemoryMatchGame.module.css";

interface MemoryMatchGameProps {
  onBackToHub?: () => void;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = () => {
  const [difficulty, setDifficulty] = useState<MemoryDifficulty>("easy");
  const [cards, setCards] = useState<MemoryCard[]>(() => generateDeck("easy"));
  const [revealedCardIds, setRevealedCardIds] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const mismatchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalPairs = DIFFICULTY_CONFIGS[difficulty].pairsCount;
  const isCompleted = matchedPairIds.length === totalPairs && totalPairs > 0;

  // Cleanup helper for mismatch delay
  const clearMismatchTimeout = useCallback(() => {
    if (mismatchTimeoutRef.current) {
      clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }
  }, []);

  // Reset or change difficulty
  const startNewGame = useCallback(
    (newDiff: MemoryDifficulty = difficulty) => {
      clearMismatchTimeout();
      setDifficulty(newDiff);
      setCards(generateDeck(newDiff));
      setRevealedCardIds([]);
      setMatchedPairIds([]);
      setMoves(0);
      setIsLocked(false);
      setHasStarted(false);
      setElapsedSeconds(0);
    },
    [difficulty, clearMismatchTimeout],
  );

  // Timer effect
  useEffect(() => {
    if (hasStarted && !isCompleted) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [hasStarted, isCompleted]);

  // Global unmount cleanup
  useEffect(() => {
    return () => {
      clearMismatchTimeout();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [clearMismatchTimeout]);

  // Card click handler
  const handleCardClick = (card: MemoryCard) => {
    // Disallow clicking if locked, already matched, already revealed, or game is finished
    if (
      isLocked ||
      isCompleted ||
      matchedPairIds.includes(card.pairId) ||
      revealedCardIds.includes(card.id)
    ) {
      return;
    }

    // Start timer on first move
    if (!hasStarted) {
      setHasStarted(true);
    }

    // First card of a turn
    if (revealedCardIds.length === 0) {
      setRevealedCardIds([card.id]);
      return;
    }

    // Second card of a turn
    if (revealedCardIds.length === 1) {
      const firstCardId = revealedCardIds[0];
      const newRevealed = [firstCardId, card.id];
      setRevealedCardIds(newRevealed);
      setMoves((prev) => prev + 1);

      const isMatch = checkIsMatch(firstCardId, card.id, cards);

      if (isMatch) {
        // Matched pair
        setMatchedPairIds((prev) => [...prev, card.pairId]);
        setRevealedCardIds([]);
      } else {
        // Mismatch: lock interaction and flip back after brief interval
        setIsLocked(true);
        clearMismatchTimeout();
        mismatchTimeoutRef.current = setTimeout(() => {
          setRevealedCardIds([]);
          setIsLocked(false);
          mismatchTimeoutRef.current = null;
        }, 850);
      }
    }
  };

  // Helper to render icon
  const renderCardIcon = (iconKey: string) => {
    switch (iconKey) {
      case "Atom":
        return <Atom size={24} aria-hidden="true" />;
      case "FileCode":
        return <FileCode size={24} aria-hidden="true" />;
      case "Terminal":
        return <Terminal size={24} aria-hidden="true" />;
      case "Database":
        return <Database size={24} aria-hidden="true" />;
      case "Network":
        return <Network size={24} aria-hidden="true" />;
      case "Box":
        return <Box size={24} aria-hidden="true" />;
      case "GitBranch":
        return <GitBranch size={24} aria-hidden="true" />;
      case "Cpu":
        return <Cpu size={24} aria-hidden="true" />;
      case "ShieldCheck":
        return <ShieldCheck size={24} aria-hidden="true" />;
      case "Server":
        return <Server size={24} aria-hidden="true" />;
      default:
        return <Atom size={24} aria-hidden="true" />;
    }
  };

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const gridClass =
    difficulty === "easy"
      ? styles.gridEasy
      : difficulty === "medium"
        ? styles.gridMedium
        : styles.gridHard;

  return (
    <div className={styles.container} data-testid="memory-match-game">
      {/* Game controls and status bar */}
      <div className={styles.statusBar} role="region" aria-label="Game Status">
        <div className={styles.metricsGroup}>
          <div className={styles.metricItem}>
            <span>Pairs:</span>
            <span
              className={styles.metricValue}
              data-testid="memory-pairs-count"
            >
              {matchedPairIds.length} / {totalPairs}
            </span>
          </div>

          <div className={styles.metricItem}>
            <span>Moves:</span>
            <span
              className={styles.metricValue}
              data-testid="memory-moves-count"
            >
              {moves}
            </span>
          </div>

          <div className={styles.metricItem}>
            <Timer size={15} aria-hidden="true" />
            <span className={styles.metricValue} data-testid="memory-timer">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        <div className={styles.controlsGroup}>
          {/* Difficulty selector */}
          <div
            className={styles.difficultyGroup}
            role="group"
            aria-label="Select Game Difficulty"
          >
            {(["easy", "medium", "hard"] as MemoryDifficulty[]).map((diff) => (
              <button
                key={diff}
                type="button"
                className={`${styles.difficultyBtn} ${difficulty === diff ? styles.active : ""}`}
                onClick={() => startNewGame(diff)}
                aria-pressed={difficulty === diff}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>

          {/* Reset button */}
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() => startNewGame(difficulty)}
            aria-label="Restart Game"
          >
            <RotateCcw size={14} aria-hidden="true" />
            <span>Restart</span>
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div
          className={styles.winBanner}
          role="alert"
          aria-live="polite"
          data-testid="memory-win-banner"
        >
          <div className={styles.winIcon}>
            <Trophy size={40} aria-hidden="true" />
          </div>
          <h2 className={styles.winTitle}>Puzzle Solved!</h2>
          <p className={styles.winStats}>
            Completed in <strong>{moves} moves</strong> and{" "}
            <strong>{formatTime(elapsedSeconds)}</strong> on{" "}
            <strong>{difficulty}</strong> difficulty.
          </p>
          <div className={styles.winActions}>
            <button
              type="button"
              className={styles.playAgainBtn}
              onClick={() => startNewGame(difficulty)}
            >
              <RotateCcw size={15} aria-hidden="true" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}

      {/* Card Grid */}
      <div
        className={`${styles.grid} ${gridClass}`}
        role="grid"
        aria-label={`Memory card grid, ${cards.length} cards`}
      >
        {cards.map((card, index) => {
          const isMatched = matchedPairIds.includes(card.pairId);
          const isRevealed = revealedCardIds.includes(card.id);
          const isFaceUp = isMatched || isRevealed;

          const cardState = isMatched
            ? "Matched"
            : isRevealed
              ? "Revealed"
              : "Face down";
          const accessibleName = `Card ${index + 1}: ${isFaceUp ? card.label : "Face down"}. ${cardState}`;

          let cardClassName = `${styles.card} ${styles.cardFaceDown}`;
          if (isMatched) {
            cardClassName = `${styles.card} ${styles.cardMatched}`;
          } else if (isRevealed) {
            cardClassName = `${styles.card} ${styles.cardRevealed}`;
          }

          return (
            <button
              key={card.id}
              type="button"
              className={cardClassName}
              onClick={() => handleCardClick(card)}
              disabled={isMatched || isRevealed || isLocked}
              aria-label={accessibleName}
              data-testid={`memory-card-${card.id}`}
            >
              {isFaceUp ? (
                <>
                  <div className={styles.cardIcon}>
                    {renderCardIcon(card.iconKey)}
                  </div>
                  <span className={styles.cardLabel}>{card.label}</span>
                  {isMatched && (
                    <span
                      className={styles.matchedBadge}
                      title="Matched"
                      aria-hidden="true"
                    >
                      <CheckCircle2 size={13} />
                    </span>
                  )}
                </>
              ) : (
                <div className={styles.cardFaceDownInner} aria-hidden="true">
                  {index + 1}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
