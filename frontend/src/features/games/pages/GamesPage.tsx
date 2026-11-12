import React, { useState } from "react";
import { Gamepad2, Brain, HelpCircle, Play, ArrowLeft } from "lucide-react";
import { MemoryMatchGame } from "../memory-match/MemoryMatchGame";
import { DeveloperQuizGame } from "../developer-quiz/DeveloperQuizGame";
import styles from "./GamesPage.module.css";

type ActiveGameMode = "hub" | "memory-match" | "developer-quiz";

export const GamesPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ActiveGameMode>("hub");

  return (
    <div className={styles.container} data-testid="games-page">
      {/* Page Header */}
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Games & Developer Playground</h1>
          <span className={styles.badge}>
            <Gamepad2 size={13} aria-hidden="true" />
            <span>Interactive Mini-Apps</span>
          </span>
        </div>
        <p className={styles.subtitle}>
          Engage with interactive engineering demonstrations built purely with
          React, TypeScript, and accessible DOM primitives. Test your pattern
          recall with tech symbols or test your computer science knowledge.
        </p>
      </header>

      {/* Active Game Back Bar */}
      {activeMode !== "hub" && (
        <div className={styles.gameActiveBar}>
          <button
            type="button"
            className={styles.backHubBtn}
            onClick={() => setActiveMode("hub")}
            aria-label="Back to Games Hub"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>All Games</span>
          </button>
          <span className={styles.activeGameTitle}>
            {activeMode === "memory-match"
              ? "Memory Match Challenge"
              : "Developer Technical Quiz"}
          </span>
        </div>
      )}

      {/* 1. Hub View */}
      {activeMode === "hub" && (
        <div
          className={styles.hubGrid}
          role="region"
          aria-label="Available Games"
        >
          {/* Game 1: Memory Match */}
          <div className={styles.gameCard}>
            <div className={styles.cardHeader}>
              <div className={styles.gameIconBox}>
                <Brain size={26} aria-hidden="true" />
              </div>
              <div className={styles.cardMeta}>
                <h2 className={styles.gameName}>Memory Match</h2>
                <span className={styles.gameTagline}>Pattern Recognition</span>
              </div>
            </div>

            <div className={styles.cardBody}>
              <p className={styles.gameDesc}>
                Flip and pair software engineering symbols (React, TypeScript,
                Docker, PostgreSQL, and more). Features clean shuffle
                algorithms, move tracking, and accessible keyboard-controlled
                card grids.
              </p>

              <ul className={styles.featureList} aria-label="Game Features">
                <li className={styles.featureItem}>
                  <span className={styles.featureDot} />
                  <span>3 Difficulty Tiers (8, 12, or 16 cards)</span>
                </li>
                <li className={styles.featureItem}>
                  <span className={styles.featureDot} />
                  <span>Move counter and live completion timer</span>
                </li>
                <li className={styles.featureItem}>
                  <span className={styles.featureDot} />
                  <span>Race-condition-free card mismatch resolution</span>
                </li>
              </ul>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.gameStatusPill}>
                <span className={styles.statusIndicatorDot} />
                <span>Playable</span>
              </div>
              <button
                type="button"
                className={styles.launchBtn}
                onClick={() => setActiveMode("memory-match")}
                aria-label="Launch Memory Match"
              >
                <Play size={14} aria-hidden="true" />
                <span>Launch Game</span>
              </button>
            </div>
          </div>

          {/* Game 2: Developer Quiz */}
          <div className={styles.gameCard}>
            <div className={styles.cardHeader}>
              <div className={styles.gameIconBox}>
                <HelpCircle size={26} aria-hidden="true" />
              </div>
              <div className={styles.cardMeta}>
                <h2 className={styles.gameName}>Developer Quiz</h2>
                <span className={styles.gameTagline}>Knowledge Assessment</span>
              </div>
            </div>

            <div className={styles.cardBody}>
              <p className={styles.gameDesc}>
                Answer verified, multiple-choice technical questions covering
                runtime architectures, event loops, database isolation, REST
                idempotency, and software testing principles with instant
                feedback.
              </p>

              <ul className={styles.featureList} aria-label="Game Features">
                <li className={styles.featureItem}>
                  <span className={styles.featureDot} />
                  <span>7 Domain categories or Comprehensive Mix</span>
                </li>
                <li className={styles.featureItem}>
                  <span className={styles.featureDot} />
                  <span>Immediate concise explanations for every answer</span>
                </li>
                <li className={styles.featureItem}>
                  <span className={styles.featureDot} />
                  <span>Session review and accurate percentage scoring</span>
                </li>
              </ul>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.gameStatusPill}>
                <span className={styles.statusIndicatorDot} />
                <span>Playable</span>
              </div>
              <button
                type="button"
                className={styles.launchBtn}
                onClick={() => setActiveMode("developer-quiz")}
                aria-label="Launch Developer Quiz"
              >
                <Play size={14} aria-hidden="true" />
                <span>Launch Game</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Active Game Views */}
      {activeMode === "memory-match" && (
        <MemoryMatchGame onBackToHub={() => setActiveMode("hub")} />
      )}

      {activeMode === "developer-quiz" && (
        <DeveloperQuizGame onBackToHub={() => setActiveMode("hub")} />
      )}
    </div>
  );
};
