import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AddressBar } from "../features/browser/components/AddressBar/AddressBar";
import { useBrowserStore } from "../features/browser/store/browserStore";

describe("AddressBar Component", () => {
  beforeEach(() => {
    useBrowserStore.setState({
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
      selectedBrowser: "firefox",
    });
  });

  it("renders current simulated url and allows keyboard submission", () => {
    render(<AddressBar />);

    const input = screen.getByRole("textbox", {
      name: /simulated address and navigation bar/i,
    });
    expect(input).toHaveValue("newtab");

    // Type 'projects' and submit
    fireEvent.change(input, { target: { value: "projects" } });
    fireEvent.submit(input.closest("form")!);

    // Store tab URL should update to portfolio://projects
    const activeTab = useBrowserStore
      .getState()
      .tabs.find((t) => t.id === "tab-1")!;
    expect(activeTab.url).toBe("portfolio://projects");
  });

  it("navigates to contact when entering contact alias", () => {
    render(<AddressBar />);

    const input = screen.getByRole("textbox", {
      name: /simulated address and navigation bar/i,
    });
    fireEvent.change(input, { target: { value: "contact" } });
    fireEvent.submit(input.closest("form")!);

    const activeTab = useBrowserStore
      .getState()
      .tabs.find((t) => t.id === "tab-1")!;
    expect(activeTab.url).toBe("portfolio://contact");
  });
});
