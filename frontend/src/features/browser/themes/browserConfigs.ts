import type { BrowserConfig, BrowserType } from "../types";

export const FIREFOX_CONFIG: BrowserConfig = {
  id: "firefox",
  name: "Mozilla Firefox",
  tagline: "Structured, customizable, developer-centric",
  description:
    "A modular dashboard with floating pill tabs, organized developer widgets, and deep visibility into technical highlights.",
  badge: "Modular Dashboard",
  tabShape: "pill",
  accentColor: "#0060df",
  accentLight: "#e0edff",
  searchPlaceholder: "Search with Firefox or enter portfolio route...",
  defaultTitle: "Firefox Home",
};

export const BROWSER_CONFIGS: Record<BrowserType, BrowserConfig> = {
  firefox: FIREFOX_CONFIG,
};

export const getBrowserConfig = (_type?: BrowserType): BrowserConfig => {
  return FIREFOX_CONFIG;
};
