export type BrowserType = "firefox";

export type TabShape = "pill";

export interface BrowserConfig {
  id: BrowserType;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  tabShape: TabShape;
  accentColor: string;
  accentLight: string;
  searchPlaceholder: string;
  defaultTitle: string;
}

export interface Tab {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  isReloading?: boolean;
}

export interface BrowserState {
  selectedBrowser: BrowserType;
  tabs: Tab[];
  activeTabId: string;
  isMobileTabSwitcherOpen: boolean;
  isBrowserMenuOpen: boolean;

  // Actions
  selectBrowser: (browser: BrowserType) => void;
  openTab: (url?: string, title?: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  navigateTab: (url: string, pushHistory?: boolean) => void;
  goBack: () => void;
  goForward: () => void;
  reloadCurrentTab: () => void;
  goHome: () => void;
  setMobileTabSwitcherOpen: (isOpen: boolean) => void;
  setBrowserMenuOpen: (isOpen: boolean) => void;
}
