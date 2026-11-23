import React, { useEffect, useMemo, useState } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import type { ArcadeGameMeta } from "./arcadeRegistry";
import styles from "./ArcadeGameFrame.module.css";

interface ArcadeGameFrameProps {
  game: ArcadeGameMeta;
  onExit: () => void;
}

export const ArcadeGameFrame: React.FC<ArcadeGameFrameProps> = ({
  game,
  onExit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const srcDoc = useMemo(() => game.buildHtml(), [game]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "EXIT_GAME") {
        onExit();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onExit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  return (
    <div
      className={`${styles.frameShell} ${
        isExpanded ? styles.frameShellExpanded : ""
      }`}
      data-testid="arcade-game-frame"
    >
      <div className={styles.frameToolbar}>
        <div className={styles.frameMeta}>
          <span className={styles.frameTitle}>{game.title}</span>
          <span className={styles.framePill}>{game.genrePill}</span>
        </div>

        <div className={styles.frameActions}>
          <span className={styles.controlsHint}>{game.controls}</span>
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? "Exit expanded view" : "Expand game view"}
            title={isExpanded ? "Restore size" : "Expand viewport"}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span>{isExpanded ? "Restore" : "Expand"}</span>
          </button>
          <button
            type="button"
            className={`${styles.toolbarBtn} ${styles.exitBtn}`}
            onClick={onExit}
            aria-label={`Exit ${game.title}`}
          >
            <X size={14} />
            <span>Exit</span>
          </button>
        </div>
      </div>

      <div className={styles.iframeWrap}>
        <iframe
          key={game.id}
          title={`${game.title} — HTML5 Canvas Game`}
          srcDoc={srcDoc}
          className={styles.iframe}
          allow="autoplay"
        />
      </div>
    </div>
  );
};
