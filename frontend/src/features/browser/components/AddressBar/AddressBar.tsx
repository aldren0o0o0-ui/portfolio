import React, { useState } from "react";
import { Lock, ArrowRight, X } from "lucide-react";
import { useBrowserStore } from "../../store/browserStore";
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
    let raw = inputValue.trim().toLowerCase();
    if (!raw) {
      raw = "portfolio://newtab";
    }

    let targetUrl: string;

    if (raw.startsWith("portfolio://")) {
      targetUrl = raw;
    } else if (raw === "home" || raw === "newtab" || raw === "/") {
      targetUrl = "portfolio://newtab";
    } else if (raw === "about" || raw === "about-me") {
      targetUrl = "portfolio://about";
    } else if (raw === "skills" || raw === "technologies" || raw === "stack") {
      targetUrl = "portfolio://skills";
    } else if (raw === "projects" || raw === "work" || raw === "portfolio") {
      targetUrl = "portfolio://projects";
    } else if (raw === "resume" || raw === "cv") {
      targetUrl = "portfolio://resume";
    } else if (raw === "contact" || raw === "message" || raw === "hire") {
      targetUrl = "portfolio://contact";
    } else if (raw === "games" || raw === "game") {
      targetUrl = "portfolio://games";
    } else {
      // Clean query string for unknown destination
      const sanitized = raw.replace(/[^a-z0-9_-]/g, "");
      targetUrl = `portfolio://${sanitized || "search"}`;
    }

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
