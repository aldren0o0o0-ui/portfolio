import React from "react";
import type { Tab } from "../../types";
import { useBrowserStore } from "../../store/browserStore";
import { BrowserTabStrip } from "../BrowserTabStrip/BrowserTabStrip";
import { BrowserToolbar } from "../BrowserToolbar/BrowserToolbar";
import { BrowserMenu } from "../BrowserMenu/BrowserMenu";
import { MobileTabSwitcher } from "../MobileTabSwitcher/MobileTabSwitcher";
import { FirefoxNewTab } from "../../../home/pages/FirefoxNewTab/FirefoxNewTab";
import { AboutPage } from "../../../about/pages/AboutPage";
import { ProjectsPage } from "../../../projects/pages/ProjectsPage";
import { SkillsPage } from "../../../skills/pages/SkillsPage";
import { ResumePage } from "../../../resume/pages/ResumePage";
import { ContactPage } from "../../../contact/pages/ContactPage";
import { GamesPage } from "../../../games/pages/GamesPage";
import { NotFoundPage } from "../../../home/pages/NotFoundPage/NotFoundPage";
import styles from "./BrowserShell.module.css";

export const BrowserShell: React.FC = () => {
  const { tabs, activeTabId, goHome } = useBrowserStore();
  const activeTab = tabs.find((t: Tab) => t.id === activeTabId);
  const currentUrl = activeTab?.url || "portfolio://newtab";

  const renderTabContent = () => {
    const cleanUrl = currentUrl.trim().toLowerCase();

    if (
      cleanUrl === "portfolio://newtab" ||
      cleanUrl === "/" ||
      cleanUrl === ""
    ) {
      return <FirefoxNewTab />;
    }

    if (cleanUrl.includes("about")) {
      return <AboutPage />;
    }
    if (cleanUrl.includes("projects")) {
      return <ProjectsPage />;
    }
    if (cleanUrl.includes("skills")) {
      return <SkillsPage />;
    }
    if (cleanUrl.includes("resume")) {
      return <ResumePage />;
    }
    if (cleanUrl.includes("contact")) {
      return <ContactPage />;
    }
    if (cleanUrl.includes("games")) {
      return <GamesPage />;
    }

    return <NotFoundPage url={currentUrl} />;
  };

  return (
    <div className={styles.shellContainer} data-testid="browser-shell">
      <div className={styles.browserFrame}>
        {/* Window controls bar */}
        <div className={styles.windowTitleBar}>
          <div className={styles.windowControls} aria-hidden="true">
            <span
              className={`${styles.windowDot} ${styles.dotClose}`}
              onClick={goHome}
              title="Return to Firefox Home"
              style={{ cursor: "pointer" }}
            />
            <span className={`${styles.windowDot} ${styles.dotMinimize}`} />
            <span className={`${styles.windowDot} ${styles.dotMaximize}`} />
          </div>

          <BrowserTabStrip />
        </div>

        {/* Browser Toolbar (Nav, Address Bar, Actions) */}
        <BrowserToolbar />

        {/* Active Tab Viewport */}
        <main
          className={styles.viewport}
          role="region"
          aria-label="Web page content"
        >
          {renderTabContent()}
        </main>

        {/* Modals & Drawers */}
        <BrowserMenu />
        <MobileTabSwitcher />
      </div>
    </div>
  );
};
