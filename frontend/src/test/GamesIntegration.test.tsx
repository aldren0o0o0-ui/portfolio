import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BrowserShell } from "../features/browser/components/BrowserShell/BrowserShell";
import { useBrowserStore } from "../features/browser/store/browserStore";
import { useThemeStore } from "../features/theme/themeStore";

describe("Phase 5 — Games Hub & Browser Shell Integration", () => {
  beforeEach(() => {
    useBrowserStore.setState({
      selectedBrowser: "firefox",
      tabs: [
        {
          id: "tab-games",
          title: "Games & Playground — Portfolio",
          url: "portfolio://games",
          history: ["portfolio://games"],
          historyIndex: 0,
          canGoBack: false,
          canGoForward: false,
        },
      ],
      activeTabId: "tab-games",
      isMobileTabSwitcherOpen: false,
      isBrowserMenuOpen: false,
    });
  });

  it("renders Games Hub at portfolio://games with both games available", () => {
    render(<BrowserShell />);

    expect(
      screen.getByRole("heading", { name: "Games & Developer Playground" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Memory Match" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Developer Quiz" }),
    ).toBeInTheDocument();
  });

  it("launches Memory Match and allows returning to Games Hub", () => {
    render(<BrowserShell />);

    // Launch Memory Match
    fireEvent.click(
      screen.getByRole("button", { name: "Launch Memory Match" }),
    );

    expect(screen.getByTestId("memory-match-game")).toBeInTheDocument();
    expect(screen.getByText("Memory Match Challenge")).toBeInTheDocument();

    // Click All Games to return
    fireEvent.click(screen.getByRole("button", { name: "Back to Games Hub" }));

    expect(screen.getByTestId("games-page")).toBeInTheDocument();
    expect(screen.queryByTestId("memory-match-game")).not.toBeInTheDocument();
  });

  it("launches Developer Quiz and preserves view during theme toggling", () => {
    render(<BrowserShell />);

    // Launch Developer Quiz
    fireEvent.click(
      screen.getByRole("button", { name: "Launch Developer Quiz" }),
    );

    expect(screen.getByTestId("developer-quiz-game")).toBeInTheDocument();

    // Toggle theme to dark and light
    act(() => {
      useThemeStore.getState().toggleTheme();
    });
    expect(screen.getByTestId("developer-quiz-game")).toBeInTheDocument();

    act(() => {
      useThemeStore.getState().toggleTheme();
    });
    expect(screen.getByTestId("developer-quiz-game")).toBeInTheDocument();
  });

  it("verifies all existing portfolio pages continue to route properly", () => {
    // 1. About
    useBrowserStore.getState().navigateTab("portfolio://about");
    const { unmount: unmountAbout } = render(<BrowserShell />);
    expect(screen.getByText(/Professional Focus/i)).toBeInTheDocument();
    unmountAbout();

    // 2. Projects
    useBrowserStore.getState().navigateTab("portfolio://projects");
    const { unmount: unmountProjects } = render(<BrowserShell />);
    expect(screen.getByText("Featured Software Projects")).toBeInTheDocument();
    unmountProjects();

    // 3. Skills
    useBrowserStore.getState().navigateTab("portfolio://skills");
    const { unmount: unmountSkills } = render(<BrowserShell />);
    expect(screen.getByText("Skills & Technologies")).toBeInTheDocument();
    unmountSkills();

    // 4. Resume
    useBrowserStore.getState().navigateTab("portfolio://resume");
    const { unmount: unmountResume } = render(<BrowserShell />);
    expect(screen.getByText("Curriculum Vitae")).toBeInTheDocument();
    unmountResume();

    // 5. Contact
    useBrowserStore.getState().navigateTab("portfolio://contact");
    const { unmount: unmountContact } = render(<BrowserShell />);
    expect(screen.getByText("Get in Touch")).toBeInTheDocument();
    unmountContact();
  });
});
