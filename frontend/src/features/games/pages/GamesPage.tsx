import React, { useState } from "react";
import {
  Gamepad2,
  Brain,
  HelpCircle,
  Play,
  ArrowLeft,
  Swords,
  Grid2x2,
  Sparkles,
  Rocket,
  Calculator,
  Car,
  Hash,
} from "lucide-react";
import { MemoryMatchGame } from "../memory-match/MemoryMatchGame";
import { DeveloperQuizGame } from "../developer-quiz/DeveloperQuizGame";
import {
  ARCADE_GAMES,
  type ArcadeGameId,
} from "../arcade/arcadeRegistry";
import { ArcadeGameFrame } from "../arcade/ArcadeGameFrame";
import styles from "./GamesPage.module.css";

type ActiveGameMode = "hub" | "memory-match" | "developer-quiz" | ArcadeGameId;
type GamesFilter = "all" | "arcade" | "react";

const ARCADE_ICONS: Record<ArcadeGameId, React.ReactNode> = {
  "blade-rift": <Swords size={22} aria-hidden="true" />,
  "neon-block-surge": <Grid2x2 size={22} aria-hidden="true" />,
  "memory-rift": <Sparkles size={22} aria-hidden="true" />,
  "astro-breaker": <Rocket size={22} aria-hidden="true" />,
  "blitz-runner": <Calculator size={22} aria-hidden="true" />,
  "nitro-drift": <Car size={22} aria-hidden="true" />,
  "violet-sudoku": <Hash size={22} aria-hidden="true" />,
};

export const GamesPage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ActiveGameMode>("hub");
  const [filter, setFilter] = useState<GamesFilter>("all");

  const activeArcadeGame = ARCADE_GAMES.find((g) => g.id === activeMode);

  const getActiveTitle = () => {
    if (activeMode === "memory-match") return "Memory Match Challenge";
    if (activeMode === "developer-quiz") return "Developer Technical Quiz";
    if (activeArcadeGame) return activeArcadeGame.title;
    return "";
  };

  return (
    <div className={styles.container} data-testid="games-page">
      {/* Page Header */}
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Study Break Arcade &amp; Playground</h1>
          <span className={styles.badge}>
            <Gamepad2 size={13} aria-hidden="true" />
            <span>9 Playable Games</span>
          </span>
        </div>
        <p className={styles.subtitle}>
          7 self-contained 60fps HTML5 Canvas &amp; JavaScript arcade games
          (with Web Audio synth SFX and desktop/touch controls) alongside 2
          interactive React engineering mini-apps.
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
          <span className={styles.activeGameTitle}>{getActiveTitle()}</span>
        </div>
      )}

      {/* Hub View */}
      {activeMode === "hub" && (
        <>
          {/* Filter Tabs */}
          <div
            className={styles.filtersBar}
            role="tablist"
            aria-label="Filter games"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filter === "all"}
              className={`${styles.filterBtn} ${
                filter === "all" ? styles.filterBtnActive : ""
              }`}
              onClick={() => setFilter("all")}
            >
              All Games (9)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === "arcade"}
              className={`${styles.filterBtn} ${
                filter === "arcade" ? styles.filterBtnActive : ""
              }`}
              onClick={() => setFilter("arcade")}
            >
              HTML5 Canvas Arcade (7)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === "react"}
              className={`${styles.filterBtn} ${
                filter === "react" ? styles.filterBtnActive : ""
              }`}
              onClick={() => setFilter("react")}
            >
              React Mini-Apps (2)
            </button>
          </div>

          <div
            className={styles.hubGrid}
            role="region"
            aria-label="Available Games"
          >
            {/* 7 Self-Contained HTML5 Canvas Arcade Games */}
            {(filter === "all" || filter === "arcade") &&
              ARCADE_GAMES.map((game) => (
                <article key={game.id} className={styles.gameCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.gameIconBox}>
                      {ARCADE_ICONS[game.id]}
                    </div>
                    <div className={styles.cardMeta}>
                      <div className={styles.cardTitleLine}>
                        <h2 className={styles.gameName}>{game.title}</h2>
                        <span className={styles.genrePill}>
                          {game.genrePill}
                        </span>
                      </div>
                      <span className={styles.gameTagline}>{game.tagline}</span>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <p className={styles.gameDesc}>{game.description}</p>

                    <ul className={styles.featureList} aria-label="Game Features">
                      {game.highlights.map((item) => (
                        <li key={item} className={styles.featureItem}>
                          <span className={styles.featureDot} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className={styles.controlsBox}>
                      <span className={styles.controlsLabel}>CONTROLS:</span>{" "}
                      <span>{game.controls}</span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.gameStatusPill}>
                      <span className={styles.statusIndicatorDot} />
                      <span>HTML5 Canvas · JS</span>
                    </div>
                    <button
                      type="button"
                      className={styles.launchBtn}
                      onClick={() => setActiveMode(game.id)}
                      aria-label={`Launch ${game.title}`}
                    >
                      <Play size={14} aria-hidden="true" />
                      <span>Play Now</span>
                    </button>
                  </div>
                </article>
              ))}

            {/* React Mini-App 1: Memory Match */}
            {(filter === "all" || filter === "react") && (
              <div className={styles.gameCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.gameIconBox}>
                    <Brain size={24} aria-hidden="true" />
                  </div>
                  <div className={styles.cardMeta}>
                    <div className={styles.cardTitleLine}>
                      <h2 className={styles.gameName}>Memory Match</h2>
                      <span className={styles.genrePill}>react · dom</span>
                    </div>
                    <span className={styles.gameTagline}>
                      Pattern Recognition
                    </span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.gameDesc}>
                    Flip and pair software engineering symbols (React,
                    TypeScript, Docker, PostgreSQL, and more). Features clean
                    shuffle algorithms, move tracking, and accessible card
                    grids.
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
            )}

            {/* React Mini-App 2: Developer Quiz */}
            {(filter === "all" || filter === "react") && (
              <div className={styles.gameCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.gameIconBox}>
                    <HelpCircle size={24} aria-hidden="true" />
                  </div>
                  <div className={styles.cardMeta}>
                    <div className={styles.cardTitleLine}>
                      <h2 className={styles.gameName}>Developer Quiz</h2>
                      <span className={styles.genrePill}>react · cs</span>
                    </div>
                    <span className={styles.gameTagline}>
                      Knowledge Assessment
                    </span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.gameDesc}>
                    Answer verified, multiple-choice technical questions
                    covering runtime architectures, event loops, database
                    isolation, REST idempotency, and software testing
                    principles.
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
            )}
          </div>
        </>
      )}

      {/* Active Arcade Game (HTML5 Canvas iframe) */}
      {activeArcadeGame && (
        <ArcadeGameFrame
          game={activeArcadeGame}
          onExit={() => setActiveMode("hub")}
        />
      )}

      {/* Active React Mini-Apps */}
      {activeMode === "memory-match" && <MemoryMatchGame />}
      {activeMode === "developer-quiz" && <DeveloperQuizGame />}
    </div>
  );
};
