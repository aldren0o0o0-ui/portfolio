import React, { useState } from "react";
import { Lock, ArrowRight, X } from "lucide-react";
import { resolvePortfolioRoute, useBrowserStore } from "../../store/browserStore";
import styles from "./AddressBar.module.css";

export const AddressBar: React.FC = () => {
  const { tabs, activeTabId, navigateTab } = useBrowserStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeUrl = activeTab?.url || "portfolio://newtab";

  const [inputValue, setInputValue] = useState(activeUrl);
  const [prevUrl, setPrevUrl] = useState(activeUrl);
  const [isFocused, setIsFocused] = useState(false);

  // Adjust state during render when active tab URL changes from outside
  if (activeUrl !== prevUrl) {
    setPrevUrl(activeUrl);
    if (!isFocused) {
      setInputValue(activeUrl);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputValue.trim();
    const targetUrl = resolvePortfolioRoute(raw || "portfolio://newtab");

    navigateTab(targetUrl, true);
    setInputValue(targetUrl);
    setIsFocused(false);
  };

  const handleClear = () => {
    setInputValue("");
  };

  return (
    <div className={styles.addressBarContainer}>
      <form
        onSubmit={handleSubmit}
        className={styles.addressBarForm}
        role="search"
      >
        <div
          className={styles.protocolBadge}
          title="Simulated Secure Connection"
        >
          <Lock size={12} aria-hidden="true" />
          <span>portfolio://</span>
        </div>

        <input
          type="text"
          className={styles.input}
          value={inputValue.replace(/^portfolio:\/\//, "")}
          onChange={(e) => setInputValue(`portfolio://${e.target.value}`)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type a destination (e.g. projects, skills, about, contact)..."
          aria-label="Simulated address and navigation bar"
          spellCheck={false}
          autoComplete="off"
        />

        {inputValue && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Clear address bar"
            title="Clear"
          >
            <X size={12} aria-hidden="true" />
          </button>
        )}

        <button
          type="submit"
          className={styles.actionButton}
          aria-label="Navigate to destination"
          title="Go"
        >
          <ArrowRight size={13} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
};
