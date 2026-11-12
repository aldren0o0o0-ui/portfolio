import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Sun,
  Moon,
  MoreVertical,
} from "lucide-react";
import { useBrowserStore } from "../../store/browserStore";
import { useThemeStore } from "../../../theme/themeStore";
import { BrowserIcon } from "../BrowserIcon/BrowserIcon";
import { AddressBar } from "../AddressBar/AddressBar";
import styles from "./BrowserToolbar.module.css";

export const BrowserToolbar: React.FC = () => {
  const {
    tabs,
    activeTabId,
    goBack,
    goForward,
    reloadCurrentTab,
    goHome,
    setBrowserMenuOpen,
    isBrowserMenuOpen,
    setMobileTabSwitcherOpen,
  } = useBrowserStore();

  const { resolvedTheme, toggleTheme } = useThemeStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const canGoBack = activeTab ? activeTab.canGoBack : false;
  const canGoForward = activeTab ? activeTab.canGoForward : false;
  const isReloading = activeTab?.isReloading;

  return (
    <nav className={styles.toolbar} aria-label="Browser Navigation Controls">
      {/* Navigation Buttons */}
      <div className={styles.navGroup}>
        <button
          type="button"
          className={styles.toolButton}
          onClick={goBack}
          disabled={!canGoBack}
          aria-label="Back"
          title="Back (Alt+Left Arrow)"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`${styles.toolButton} ${styles.forwardButton}`}
          onClick={goForward}
          disabled={!canGoForward}
          aria-label="Forward"
          title="Forward (Alt+Right Arrow)"
        >
          <ArrowRight size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`${styles.toolButton} ${isReloading ? styles.toolButtonSpinning : ""}`}
          onClick={reloadCurrentTab}
          aria-label="Reload current page"
          title="Reload (Ctrl+R)"
        >
          <RotateCw size={15} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={`${styles.toolButton} ${styles.homeButton}`}
          onClick={goHome}
          aria-label="Browser Home"
          title="Home"
        >
          <Home size={15} aria-hidden="true" />
        </button>
      </div>

      {/* Address / Search Bar */}
      <AddressBar />

      {/* Action Controls */}
      <div className={styles.actionsGroup}>
        {/* Firefox Brand Badge & Quick Menu Trigger */}
        <button
          type="button"
          className={styles.browserSwitcherButton}
          onClick={() => setBrowserMenuOpen(!isBrowserMenuOpen)}
          aria-label="Firefox options and settings"
          title="Firefox Menu"
        >
          <BrowserIcon size={16} />
          <span>Firefox</span>
        </button>

        {/* Mobile Tab Counter (Shown on <= 768px) */}
        <button
          type="button"
          className={styles.tabCounterButton}
          onClick={() => setMobileTabSwitcherOpen(true)}
          aria-label={`Tabs overview: ${tabs.length} tabs open`}
          title="View all tabs"
        >
          <span>{tabs.length}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          className={styles.toolButton}
          onClick={toggleTheme}
          aria-label={`Toggle theme (currently ${resolvedTheme})`}
          title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {resolvedTheme === "dark" ? (
            <Sun size={16} aria-hidden="true" />
          ) : (
            <Moon size={16} aria-hidden="true" />
          )}
        </button>

        {/* Browser Settings Menu */}
        <button
          type="button"
          className={styles.toolButton}
          onClick={() => setBrowserMenuOpen(!isBrowserMenuOpen)}
          aria-label="Browser Menu"
          aria-expanded={isBrowserMenuOpen}
          title="Firefox settings and tools"
        >
          <MoreVertical size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};
