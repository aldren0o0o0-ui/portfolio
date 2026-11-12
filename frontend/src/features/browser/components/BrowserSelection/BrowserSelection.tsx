import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Moon, Sun, Monitor } from "lucide-react";
import { useBrowserStore } from "../../store/browserStore";
import { useThemeStore } from "../../../theme/themeStore";
import { BROWSER_CONFIGS } from "../../themes/browserConfigs";
import { BrowserIcon } from "../BrowserIcon/BrowserIcon";
import type { BrowserType } from "../../types";
import styles from "./BrowserSelection.module.css";

export const BrowserSelection: React.FC = () => {
  const { selectedBrowser, selectBrowser } = useBrowserStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();

  const [currentChoice, setCurrentChoice] = useState<BrowserType>(
    selectedBrowser || "chrome",
  );

  const browserList = Object.values(BROWSER_CONFIGS);

  const handleLaunch = () => {
    selectBrowser(currentChoice);
  };

  return (
    <motion.main
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      aria-label="Browser Environment Selection"
    >
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.brandDot} aria-hidden="true" />
          <span className={styles.brandTitle}>Aldren Dico — Portfolio</span>
        </div>

        <button
          type="button"
          className={styles.themeButton}
          onClick={toggleTheme}
          aria-label={`Current theme: ${resolvedTheme}. Click to toggle.`}
        >
          {resolvedTheme === "dark" ? (
            <>
              <Sun size={15} aria-hidden="true" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={15} aria-hidden="true" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </header>

      <section className={styles.mainContent}>
        <div className={styles.heroTag}>
          <Monitor size={13} aria-hidden="true" />
          <span>Simulated Browser Interface</span>
        </div>

        <h1 className={styles.heroTitle}>Choose Your Browsing Experience</h1>
        <p className={styles.heroSubtitle}>
          Explore my software engineering portfolio through a familiar browser
          environment. Each browser offers a unique dashboard and layout
          tailored to your viewing preference.
        </p>

        <div
          className={styles.grid}
          role="radiogroup"
          aria-label="Browser environments"
        >
          {browserList.map((config) => {
            const isSelected = currentChoice === config.id;
            return (
              <div
                key={config.id}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
                onClick={() => setCurrentChoice(config.id)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    setCurrentChoice(config.id);
                  }
                }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <BrowserIcon browser={config.id} size={32} />
                  </div>
                  <span className={styles.badge}>{config.badge}</span>
                </div>

                <h2 className={styles.cardName}>{config.name}</h2>
                <div className={styles.cardTagline}>{config.tagline}</div>
                <p className={styles.cardDescription}>{config.description}</p>

                <div className={styles.selectionIndicator}>
                  <div className={styles.radioCircle}>
                    {isSelected && <div className={styles.radioDot} />}
                  </div>
                  <span>{isSelected ? "Selected" : "Click to select"}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.launchButton}
            onClick={handleLaunch}
            id="launch-browser-button"
          >
            <span>Launch {BROWSER_CONFIGS[currentChoice].name}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
          <span className={styles.hintText}>
            You can seamlessly switch browsers at any time from inside the
            browser menu.
          </span>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>
          Built with React, TypeScript & CSS Modules • Production Architecture •
          No external tracking
        </p>
      </footer>
    </motion.main>
  );
};
