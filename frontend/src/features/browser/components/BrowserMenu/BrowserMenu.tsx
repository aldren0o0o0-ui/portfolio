import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Sun,
  Moon,
  RefreshCw,
  Home,
} from "lucide-react";
import { useBrowserStore } from "../../store/browserStore";
import { useThemeStore } from "../../../theme/themeStore";
import { BrowserIcon } from "../BrowserIcon/BrowserIcon";
import styles from "./BrowserMenu.module.css";

export const BrowserMenu: React.FC = () => {
  const {
    isBrowserMenuOpen,
    setBrowserMenuOpen,
    openTab,
    reloadCurrentTab,
    goHome,
  } = useBrowserStore();

  const { resolvedTheme, toggleTheme } = useThemeStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isBrowserMenuOpen) {
        setBrowserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBrowserMenuOpen, setBrowserMenuOpen]);

  if (!isBrowserMenuOpen) return null;

  return (
    <AnimatePresence>
      <div
        className={styles.backdrop}
        onClick={() => setBrowserMenuOpen(false)}
        role="presentation"
      >
        <motion.div
          ref={menuRef}
          className={styles.menuPanel}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Firefox Options Menu"
        >
          <div className={styles.menuHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <BrowserIcon size={18} />
              <span className={styles.menuTitle}>Firefox Settings & Tools</span>
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setBrowserMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.menuBody}>
            <span className={styles.sectionLabel}>Actions & Navigation</span>
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => {
                openTab();
                setBrowserMenuOpen(false);
              }}
            >
              <div className={styles.menuItemIcon}>
                <Plus size={16} aria-hidden="true" />
              </div>
              <span>New Tab</span>
              <span className={styles.shortcutBadge}>Ctrl+T</span>
            </button>

            <button
              type="button"
              className={styles.menuItem}
              onClick={() => {
                reloadCurrentTab();
                setBrowserMenuOpen(false);
              }}
            >
              <div className={styles.menuItemIcon}>
                <RefreshCw size={16} aria-hidden="true" />
              </div>
              <span>Reload Current View</span>
              <span className={styles.shortcutBadge}>Ctrl+R</span>
            </button>

            <button
              type="button"
              className={styles.menuItem}
              onClick={() => {
                goHome();
                setBrowserMenuOpen(false);
              }}
            >
              <div className={styles.menuItemIcon}>
                <Home size={16} aria-hidden="true" />
              </div>
              <span>Firefox Home Page</span>
            </button>

            <div className={styles.menuDivider} />

            <span className={styles.sectionLabel}>Appearance</span>
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => toggleTheme()}
            >
              <div className={styles.menuItemIcon}>
                {resolvedTheme === "dark" ? (
                  <Sun size={16} aria-hidden="true" />
                ) : (
                  <Moon size={16} aria-hidden="true" />
                )}
              </div>
              <span>
                Switch to {resolvedTheme === "dark" ? "Light" : "Dark"} Mode
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
