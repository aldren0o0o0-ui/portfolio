import React from "react";
import { Plus, X, Globe } from "lucide-react";
import { useBrowserStore } from "../../store/browserStore";
import styles from "./BrowserTabStrip.module.css";

export const BrowserTabStrip: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, openTab } =
    useBrowserStore();

  return (
    <div className={styles.tabStrip} role="tablist" aria-label="Browser tabs">
      <div className={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setActiveTab(tab.id);
                }
              }}
            >
              <div className={styles.tabIcon}>
                <Globe size={13} aria-hidden="true" />
              </div>
              <span className={styles.tabTitle} title={tab.title}>
                {tab.title}
              </span>
              <button
                type="button"
                className={styles.closeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                aria-label={`Close tab ${tab.title}`}
              >
                <X size={12} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.newTabButton}
        onClick={() => openTab()}
        aria-label="Open new tab"
        title="New Tab"
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
};
