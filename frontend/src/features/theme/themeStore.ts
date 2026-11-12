import { create } from "zustand";
import type { ThemeMode, ResolvedTheme, ThemeState } from "./types";

const STORAGE_KEY = "portfolio_theme_mode";

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const getSavedMode = (): ThemeMode => {
  if (typeof window === "undefined") return "system";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {
    // LocalStorage might be disabled or throw in restricted environments
  }
  return "system";
};

const resolveTheme = (mode: ThemeMode): ResolvedTheme => {
  if (mode === "system") {
    return getSystemTheme();
  }
  return mode;
};

const applyThemeToDOM = (resolved: ResolvedTheme) => {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  }
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialMode = getSavedMode();
  const initialResolved = resolveTheme(initialMode);
  applyThemeToDOM(initialResolved);

  // Listen for system changes if mode is 'system'
  if (typeof window !== "undefined" && window.matchMedia) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (get().mode === "system") {
        const newResolved = getSystemTheme();
        applyThemeToDOM(newResolved);
        set({ resolvedTheme: newResolved });
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }
  }

  return {
    mode: initialMode,
    resolvedTheme: initialResolved,
    setThemeMode: (mode: ThemeMode) => {
      const resolved = resolveTheme(mode);
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // Safe fallback
      }
      applyThemeToDOM(resolved);
      set({ mode, resolvedTheme: resolved });
    },
    toggleTheme: () => {
      const currentResolved = get().resolvedTheme;
      const nextMode: ThemeMode = currentResolved === "dark" ? "light" : "dark";
      get().setThemeMode(nextMode);
    },
  };
});
