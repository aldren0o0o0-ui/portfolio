import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FirefoxNewTab } from "../features/home/pages/FirefoxNewTab/FirefoxNewTab";
import { useBrowserStore } from "../features/browser/store/browserStore";

describe("Firefox New-Tab Home Page", () => {
  beforeEach(() => {
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
    });
  });

  it("renders Firefox new tab with structured dashboard widgets", () => {
    render(<FirefoxNewTab />);

    expect(screen.getByText("Firefox Home")).toBeInTheDocument();
    expect(screen.getByText("Frequently Visited")).toBeInTheDocument();
    expect(screen.getAllByText("OmniSport AI").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByAltText("OmniSport AI UI overview")).toBeInTheDocument();
    expect(screen.getByText("Engineer Overview")).toBeInTheDocument();
    expect(
      screen.getByText("Recent Engineering Highlights"),
    ).toBeInTheDocument();
    expect(screen.getByText("Quick Access & Inquiries")).toBeInTheDocument();
    expect(screen.getByTestId("interactive-dots-canvas")).toBeInTheDocument();
  });

  it("renders interactive dots canvas background component", () => {
    render(<FirefoxNewTab />);
    const canvasContainer = screen.getByTestId("interactive-dots-canvas");
    expect(canvasContainer).toBeInTheDocument();
    expect(canvasContainer.querySelector("canvas")).toBeInTheDocument();
  });
});
