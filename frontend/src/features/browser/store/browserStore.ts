import { create } from "zustand";
import type { BrowserState, BrowserType, Tab } from "../types";
import { FIREFOX_CONFIG } from "../themes/browserConfigs";

let tabCounter = 1;

export const getTabTitleForUrl = (
  url: string,
  _browser?: BrowserType | null,
): string => {
  const cleanUrl = url.trim().toLowerCase();
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
