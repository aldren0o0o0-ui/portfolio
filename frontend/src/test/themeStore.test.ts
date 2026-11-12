import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "../features/theme/themeStore";

describe("Theme Store & Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.theme = "light";
    useThemeStore.setState({ mode: "light", resolvedTheme: "light" });
  });

  it("sets theme mode to dark and updates DOM dataset", () => {
    useThemeStore.getState().setThemeMode("dark");

    expect(useThemeStore.getState().mode).toBe("dark");
    expect(useThemeStore.getState().resolvedTheme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("portfolio_theme_mode")).toBe("dark");
  });

  it("toggles theme between light and dark", () => {
    useThemeStore.getState().setThemeMode("light");
    expect(useThemeStore.getState().resolvedTheme).toBe("light");

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
