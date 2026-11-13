import { create } from "zustand";
import type { BrowserState, BrowserType, Tab } from "../types";
import { FIREFOX_CONFIG } from "../themes/browserConfigs";

let tabCounter = 1;

const ROUTE_ALIASES: Record<string, string[]> = {
  "portfolio://newtab": ["", "new tab", "newtab", "home", "firefox", "browser home", "start"],
  "portfolio://about": ["about", "about me", "bio", "profile", "who am i", "whoami", "my story"],
  "portfolio://skills": ["skills", "skill", "stack", "tech", "technology", "technologies", "tools", "languages", "skills and stack", "stack and skills"],
  "portfolio://projects": ["projects", "project", "portfolio", "work", "case studies", "showcase", "featured work"],
  "portfolio://resume": ["resume", "cv", "curriculum vitae", "experience", "career"],
  "portfolio://contact": ["contact", "contact me", "hire", "message", "reach out", "get in touch", "email", "inquiry", "inquiries"],
  "portfolio://games": ["games", "game", "play", "interactive games", "mini games"],
};

export const resolvePortfolioRoute = (input: string): string => {
  const rawInput = input?.trim() ?? "";
  if (!rawInput) return "portfolio://newtab";

  const lowerInput = rawInput.toLowerCase();
  const normalizedInput = lowerInput.replace(/^\/+/, "");
  const hasScheme = normalizedInput.startsWith("portfolio://");
  const candidate = hasScheme
    ? normalizedInput.slice("portfolio://".length)
    : normalizedInput;
  const compactCandidate = candidate.replace(/[^a-z0-9]+/g, " ").trim();

  if (!compactCandidate) return "portfolio://newtab";

  for (const [route, aliases] of Object.entries(ROUTE_ALIASES)) {
    const aliasMatches = aliases.map((alias) =>
      alias.replace(/[^a-z0-9]+/g, " ").trim(),
    );
    const routeTokens = compactCandidate.split(/\s+/);

    const matched = aliasMatches.some((alias) => {
      if (!alias) return false;
      const aliasTokens = alias.split(/\s+/);
      const canonicalText = compactCandidate;
      return (
        canonicalText === alias ||
        canonicalText.includes(alias) ||
        alias.includes(canonicalText) ||
        aliasTokens.every((token) => routeTokens.includes(token)) ||
        routeTokens.every((token) => alias.includes(token))
      );
    });

    if (matched) {
      return route;
    }
  }

  const sanitized = candidate.replace(/[^a-z0-9_-]/g, "");
  const fallback = sanitized || "search";
  return `portfolio://${fallback}`;
};

export const getTabTitleForUrl = (
  url: string,
  _browser?: BrowserType | null,
): string => {
  const cleanUrl = resolvePortfolioRoute(url);
  if (
    cleanUrl === "portfolio://newtab" ||
    cleanUrl === "/" ||
    cleanUrl === ""
  ) {
    return FIREFOX_CONFIG.defaultTitle;
  }
  if (cleanUrl.includes("about")) return "About — Portfolio";
  if (cleanUrl.includes("skills")) return "Skills & Tech — Portfolio";
  if (cleanUrl.includes("projects")) return "Projects — Portfolio";
  if (cleanUrl.includes("resume")) return "Résumé — Portfolio";
  if (cleanUrl.includes("contact")) return "Contact — Portfolio";
  if (cleanUrl.includes("games")) return "Games Preview — Portfolio";
  return "Not Found — 404";
};

const applyBrowserToDOM = () => {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.browser = "firefox";
  }
};

const createNewTabObject = (
  url = "portfolio://newtab",
  customTitle?: string,
): Tab => {
  const id = `tab-${Date.now()}-${++tabCounter}`;
  const title = customTitle || getTabTitleForUrl(url, "firefox");
  return {
    id,
    title,
    url,
    history: [url],
    historyIndex: 0,
    canGoBack: false,
    canGoForward: false,
    isReloading: false,
  };
};

export const useBrowserStore = create<BrowserState>((set, get) => {
  applyBrowserToDOM();

  const initialTab = createNewTabObject("portfolio://newtab");

  return {
    selectedBrowser: "firefox",
    tabs: [initialTab],
    activeTabId: initialTab.id,
    isMobileTabSwitcherOpen: false,
    isBrowserMenuOpen: false,

    selectBrowser: (_browser: BrowserType) => {
      applyBrowserToDOM();
      set({ selectedBrowser: "firefox" });
    },

    openTab: (url = "portfolio://newtab", title?: string) => {
      const newTab = createNewTabObject(url, title);
      set((state) => ({
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
        isMobileTabSwitcherOpen: false,
      }));
    },

    closeTab: (tabId: string) => {
      const { tabs, activeTabId } = get();
      if (tabs.length <= 1) {
        // If closing the last tab, reset to a clean new tab
        const freshTab = createNewTabObject("portfolio://newtab");
        set({
          tabs: [freshTab],
          activeTabId: freshTab.id,
        });
        return;
      }

      const tabIndex = tabs.findIndex((t) => t.id === tabId);
      if (tabIndex === -1) return;

      const remainingTabs = tabs.filter((t) => t.id !== tabId);
      let nextActiveId = activeTabId;

      if (activeTabId === tabId) {
        // Switch to the adjacent tab
        const nextIndex =
          tabIndex >= remainingTabs.length
            ? remainingTabs.length - 1
            : tabIndex;
        nextActiveId = remainingTabs[nextIndex].id;
      }

      set({
        tabs: remainingTabs,
        activeTabId: nextActiveId,
      });
    },

    setActiveTab: (tabId: string) => {
      set({
        activeTabId: tabId,
        isMobileTabSwitcherOpen: false,
      });
    },

    navigateTab: (url: string, pushHistory = true) => {
      const { tabs, activeTabId } = get();
      const formattedUrl = url.trim();
      const title = getTabTitleForUrl(formattedUrl, "firefox");

      const updatedTabs = tabs.map((tab) => {
        if (tab.id !== activeTabId) return tab;

        let newHistory = tab.history;
        let newIndex = tab.historyIndex;

        if (pushHistory) {
          // If navigating from middle of history, truncate forward history
          newHistory = [
            ...tab.history.slice(0, tab.historyIndex + 1),
            formattedUrl,
          ];
          newIndex = newHistory.length - 1;
        }

        return {
          ...tab,
          url: formattedUrl,
          title,
          history: newHistory,
          historyIndex: newIndex,
          canGoBack: newIndex > 0,
          canGoForward: newIndex < newHistory.length - 1,
        };
      });

      set({ tabs: updatedTabs });
    },

    goBack: () => {
      const { tabs, activeTabId } = get();
      const currentTab = tabs.find((t) => t.id === activeTabId);
      if (!currentTab || currentTab.historyIndex <= 0) return;

      const newIndex = currentTab.historyIndex - 1;
      const newUrl = currentTab.history[newIndex];
      const title = getTabTitleForUrl(newUrl, "firefox");

      const updatedTabs = tabs.map((tab) => {
        if (tab.id !== activeTabId) return tab;
        return {
          ...tab,
          url: newUrl,
          title,
          historyIndex: newIndex,
          canGoBack: newIndex > 0,
          canGoForward: true,
        };
      });

      set({ tabs: updatedTabs });
    },

    goForward: () => {
      const { tabs, activeTabId } = get();
      const currentTab = tabs.find((t) => t.id === activeTabId);
      if (
        !currentTab ||
        currentTab.historyIndex >= currentTab.history.length - 1
      )
        return;

      const newIndex = currentTab.historyIndex + 1;
      const newUrl = currentTab.history[newIndex];
      const title = getTabTitleForUrl(newUrl, "firefox");

      const updatedTabs = tabs.map((tab) => {
        if (tab.id !== activeTabId) return tab;
        return {
          ...tab,
          url: newUrl,
          title,
          historyIndex: newIndex,
          canGoBack: true,
          canGoForward: newIndex < tab.history.length - 1,
        };
      });

      set({ tabs: updatedTabs });
    },

    reloadCurrentTab: () => {
      const { tabs, activeTabId } = get();
      set({
        tabs: tabs.map((tab) =>
          tab.id === activeTabId ? { ...tab, isReloading: true } : tab,
        ),
      });

      setTimeout(() => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === activeTabId ? { ...tab, isReloading: false } : tab,
          ),
        }));
      }, 250);
    },

    goHome: () => {
      get().navigateTab("portfolio://newtab", true);
    },

    setMobileTabSwitcherOpen: (isOpen: boolean) => {
      set({ isMobileTabSwitcherOpen: isOpen });
    },

    setBrowserMenuOpen: (isOpen: boolean) => {
      set({ isBrowserMenuOpen: isOpen });
    },
  };
});
