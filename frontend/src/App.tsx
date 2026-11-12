import React, { useEffect } from "react";
import { useBrowserStore } from "./features/browser/store/browserStore";
import { BrowserShell } from "./features/browser/components/BrowserShell/BrowserShell";
import "./App.css";

export const App: React.FC = () => {
  const { openTab, closeTab, activeTabId } = useBrowserStore();

  // Support helpful keyboard shortcuts within the simulated Firefox browser
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
        openTab();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        if (activeTabId) {
          closeTab(activeTabId);
        }
      }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, [openTab, closeTab, activeTabId]);

  return <BrowserShell />;
};

export default App;
