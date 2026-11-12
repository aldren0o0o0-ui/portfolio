import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Globe } from "lucide-react";
import { useBrowserStore } from "../../store/browserStore";
import styles from "./MobileTabSwitcher.module.css";

export const MobileTabSwitcher: React.FC = () => {
  const {
    isMobileTabSwitcherOpen,
    setMobileTabSwitcherOpen,
    tabs,
    activeTabId,
    setActiveTab,
    closeTab,
    openTab,
  } = useBrowserStore();

  if (!isMobileTabSwitcherOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.2 }}
        role="dialog"
        aria-modal="true"
        aria-label="Tabs Overview"
      >
        <div className={styles.header}>
          <span className={styles.title}>Tabs ({tabs.length})</span>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => openTab()}
              aria-label="Open New Tab"
            >
              <Plus size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => setMobileTabSwitcherOpen(false)}
              aria-label="Close Tab Overview"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                role="button"
                tabIndex={0}
                className={`${styles.tabCard} ${isActive ? styles.tabCardActive : ""}`}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    setActiveTab(tab.id);
                  }
                }}
              >
                <div className={styles.tabCardHeader}>
                  <span className={styles.tabCardTitle}>{tab.title}</span>
                  <button
                    type="button"
                    className={styles.tabCloseBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    aria-label={`Close ${tab.title}`}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>

                <div className={styles.tabPreview}>
                  <Globe size={18} aria-hidden="true" />
                  <span className={styles.tabUrl}>{tab.url}</span>
                </div>

                {isActive && (
                  <div className={styles.activeIndicator}>Active</div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
