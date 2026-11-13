import { describe, it, expect, beforeEach } from "vitest";
import {
  useBrowserStore,
  getTabTitleForUrl,
  resolvePortfolioRoute,
} from "../features/browser/store/browserStore";

describe("Browser Store & Tab Lifecycle", () => {
  beforeEach(() => {
    localStorage.clear();
    useBrowserStore.setState({
      selectedBrowser: "firefox",
      tabs: [
        {
          id: "tab-1",
          title: "Firefox Home",
          url: "portfolio://newtab",
          history: ["portfolio://newtab"],
          historyIndex: 0,
          canGoBack: false,
          canGoForward: false,
        },
      ],
      activeTabId: "tab-1",
      isMobileTabSwitcherOpen: false,
      isBrowserMenuOpen: false,
    });
  });

  it("correctly maps URL to tab titles", () => {
    expect(getTabTitleForUrl("portfolio://newtab")).toBe("Firefox Home");
    expect(getTabTitleForUrl("portfolio://projects")).toBe(
      "Projects — Portfolio",
    );
    expect(getTabTitleForUrl("portfolio://skills")).toBe(
      "Skills & Tech — Portfolio",
    );
    expect(getTabTitleForUrl("portfolio://about")).toBe("About — Portfolio");
    expect(getTabTitleForUrl("portfolio://resume")).toBe("Résumé — Portfolio");
    expect(getTabTitleForUrl("portfolio://contact")).toBe(
      "Contact — Portfolio",
    );
    expect(getTabTitleForUrl("portfolio://unknown-xyz")).toBe(
      "Not Found — 404",
    );
  });

  it("resolves common search phrases to canonical portfolio routes", () => {
    expect(resolvePortfolioRoute("about me")).toBe("portfolio://about");
    expect(resolvePortfolioRoute("skills & stack")).toBe("portfolio://skills");
    expect(resolvePortfolioRoute("contact me")).toBe("portfolio://contact");
    expect(resolvePortfolioRoute("portfolio://about me")).toBe(
      "portfolio://about",
    );
  });

  it("maintains Firefox browser environment", () => {
    useBrowserStore.getState().selectBrowser("firefox");

    expect(useBrowserStore.getState().selectedBrowser).toBe("firefox");
    expect(document.documentElement.dataset.browser).toBe("firefox");
    expect(useBrowserStore.getState().tabs[0].title).toBe("Firefox Home");
  });

  it("opens new tabs and sets active tab", () => {
    useBrowserStore.getState().openTab("portfolio://projects", "Projects");

    const state = useBrowserStore.getState();
    expect(state.tabs.length).toBe(2);
    expect(state.activeTabId).toBe(state.tabs[1].id);
    expect(state.tabs[1].url).toBe("portfolio://projects");
  });

  it("closes a tab and switches active tab gracefully", () => {
    useBrowserStore.getState().openTab("portfolio://skills");
    useBrowserStore.getState().openTab("portfolio://about");

    expect(useBrowserStore.getState().tabs.length).toBe(3);
    const secondTabId = useBrowserStore.getState().tabs[1].id;

    // Close the currently active tab (the 3rd tab)
    const thirdTabId = useBrowserStore.getState().tabs[2].id;
    useBrowserStore.getState().closeTab(thirdTabId);

    const stateAfterClose = useBrowserStore.getState();
    expect(stateAfterClose.tabs.length).toBe(2);
    // Active tab switches to the remaining adjacent tab
    expect(stateAfterClose.activeTabId).toBe(secondTabId);
  });

  it("resets to fresh new tab when closing the only remaining tab", () => {
    const onlyTabId = useBrowserStore.getState().tabs[0].id;
    useBrowserStore.getState().closeTab(onlyTabId);

    const state = useBrowserStore.getState();
    expect(state.tabs.length).toBe(1);
    expect(state.tabs[0].url).toBe("portfolio://newtab");
    expect(state.tabs[0].title).toBe("Firefox Home");
  });

  it("handles navigation history (back, forward, navigate)", () => {
    useBrowserStore.getState().navigateTab("portfolio://skills");
    useBrowserStore.getState().navigateTab("portfolio://projects");

    const state1 = useBrowserStore.getState();
    const activeTab1 = state1.tabs.find((t) => t.id === state1.activeTabId)!;
    expect(activeTab1.url).toBe("portfolio://projects");
    expect(activeTab1.canGoBack).toBe(true);
    expect(activeTab1.canGoForward).toBe(false);

    // Go back
    useBrowserStore.getState().goBack();
    const state2 = useBrowserStore.getState();
    const activeTab2 = state2.tabs.find((t) => t.id === state2.activeTabId)!;
    expect(activeTab2.url).toBe("portfolio://skills");
    expect(activeTab2.canGoBack).toBe(true);
    expect(activeTab2.canGoForward).toBe(true);

    // Go forward
    useBrowserStore.getState().goForward();
    const state3 = useBrowserStore.getState();
    const activeTab3 = state3.tabs.find((t) => t.id === state3.activeTabId)!;
    expect(activeTab3.url).toBe("portfolio://projects");
  });

  it("navigates home and resets to Firefox Home view", () => {
    useBrowserStore.getState().navigateTab("portfolio://skills");
    useBrowserStore.getState().goHome();

    const currentTab = useBrowserStore
      .getState()
      .tabs.find((t) => t.id === useBrowserStore.getState().activeTabId)!;
    expect(currentTab.url).toBe("portfolio://newtab");
    expect(currentTab.title).toBe("Firefox Home");
  });
});
