import React, { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useBrowserStore } from "../../../browser/store/browserStore";
import styles from "./HomeSearchBar.module.css";

interface HomeSearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  placeholder = "Search portfolio or enter command (e.g. projects, skills, about)...",
  autoFocus = false,
}) => {
  const { navigateTab } = useBrowserStore();
  const [query, setQuery] = useState("");

  const quickSuggestions = [
    { label: "Projects", route: "portfolio://projects" },
    { label: "Skills & Stack", route: "portfolio://skills" },
    { label: "About Me", route: "portfolio://about" },
    { label: "Résumé", route: "portfolio://resume" },
    { label: "Contact", route: "portfolio://contact" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = query.trim().toLowerCase();
    if (!raw) return;

    if (raw.startsWith("portfolio://")) {
      navigateTab(raw, true);
    } else if (raw === "about" || raw === "about-me") {
      navigateTab("portfolio://about", true);
    } else if (raw === "skills" || raw === "tech") {
      navigateTab("portfolio://skills", true);
    } else if (raw === "projects" || raw === "work") {
      navigateTab("portfolio://projects", true);
    } else if (raw === "resume" || raw === "cv") {
      navigateTab("portfolio://resume", true);
    } else if (raw === "contact") {
      navigateTab("portfolio://contact", true);
    } else if (raw === "games") {
      navigateTab("portfolio://games", true);
    } else {
      const sanitized = raw.replace(/[^a-z0-9_-]/g, "");
      navigateTab(`portfolio://${sanitized || "search"}`, true);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSubmit} className={styles.searchForm} role="search">
        <Search size={18} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search portfolio"
          autoFocus={autoFocus}
          spellCheck={false}
        />
        <button
          type="submit"
          className={styles.submitBtn}
          aria-label="Submit search"
          title="Search"
        >
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </form>

      <div className={styles.suggestions} aria-label="Quick search suggestions">
        {quickSuggestions.map((item) => (
          <button
            key={item.label}
            type="button"
            className={styles.suggestionPill}
            onClick={() => navigateTab(item.route, true)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
