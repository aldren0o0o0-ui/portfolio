import React, { useState } from "react";
import { Menu, X, Eye } from "lucide-react";
import {
  resolvePortfolioRoute,
  useBrowserStore,
} from "../../browser/store/browserStore";
import { PROFILE_DATA } from "../../../data/profile";
import { useVisitorCount } from "../hooks/useVisitorCount";
import { OverviewPage } from "../../home/pages/OverviewPage/OverviewPage";
import { AboutPage } from "../../about/pages/AboutPage";
import { ProjectsPage } from "../../projects/pages/ProjectsPage";
import { SkillsPage } from "../../skills/pages/SkillsPage";
import { ResumePage } from "../../resume/pages/ResumePage";
import { ContactPage } from "../../contact/pages/ContactPage";
import { GamesPage } from "../../games/pages/GamesPage";
import { NotFoundPage } from "../../home/pages/NotFoundPage/NotFoundPage";
import type { Tab } from "../../browser/types";
import styles from "./PortfolioLayout.module.css";

interface NavItem {
  label: string;
  route: string;
  match: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", route: "portfolio://newtab", match: "newtab" },
  { label: "Projects", route: "portfolio://projects", match: "projects" },
  { label: "Skills", route: "portfolio://skills", match: "skills" },
  { label: "About", route: "portfolio://about", match: "about" },
  { label: "Resume", route: "portfolio://resume", match: "resume" },
  { label: "Contact", route: "portfolio://contact", match: "contact" },
  { label: "Games", route: "portfolio://games", match: "games" },
];

export const PortfolioLayout: React.FC = () => {
  const { tabs, activeTabId, navigateTab } = useBrowserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const visitorCount = useVisitorCount();

  const activeTab = tabs.find((t: Tab) => t.id === activeTabId);
  const currentUrl = activeTab?.url || "portfolio://newtab";
  const cleanUrl = resolvePortfolioRoute(currentUrl).trim().toLowerCase();

  const handleNavClick = (route: string) => {
    navigateTab(route, true);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isRouteActive = (match: string) => {
    if (match === "newtab") {
      return (
        cleanUrl === "portfolio://newtab" ||
        cleanUrl === "/" ||
        cleanUrl === ""
      );
    }
    return cleanUrl.includes(match);
  };

  const renderPage = () => {
    if (
      cleanUrl === "portfolio://newtab" ||
      cleanUrl === "/" ||
      cleanUrl === ""
    ) {
      return <OverviewPage />;
    }
    if (cleanUrl.includes("about")) return <AboutPage />;
    if (cleanUrl.includes("projects")) return <ProjectsPage />;
    if (cleanUrl.includes("skills")) return <SkillsPage />;
    if (cleanUrl.includes("resume")) return <ResumePage />;
    if (cleanUrl.includes("contact")) return <ContactPage />;
    if (cleanUrl.includes("games")) return <GamesPage />;
    return <NotFoundPage url={currentUrl} />;
  };

  return (
    <div className={styles.layoutRoot}>
      {/* Top Editorial Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button
            type="button"
            className={styles.brandButton}
            onClick={() => handleNavClick("portfolio://newtab")}
            aria-label="Go to Overview"
          >
            <span className={styles.monogramBox} aria-hidden="true">
              AD
            </span>
            <span className={styles.brandName}>Aldren Dico</span>
          </button>

          <nav className={styles.desktopNav} aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const active = isRouteActive(item.match);
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => handleNavClick(item.route)}
                  className={`${styles.navLink} ${
                    active ? styles.navLinkActive : ""
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className={styles.headerRight}>
            <button
              type="button"
              className={styles.statusBadge}
              onClick={() => handleNavClick("portfolio://contact")}
              title="Available for remote projects & opportunities"
            >
              <span className={styles.statusDot} aria-hidden="true" />
              <span>OPEN TO REMOTE PROJECTS</span>
            </button>

            <button
              type="button"
              className={styles.mobileMenuBtn}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <nav className={styles.mobileNav} aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => {
              const active = isRouteActive(item.match);
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => handleNavClick(item.route)}
                  className={`${styles.mobileNavLink} ${
                    active ? styles.mobileNavLinkActive : ""
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className={styles.mainViewport} role="main">
        {renderPage()}
      </main>

      {/* Minimal Monospace Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLeftGroup}>
            <span className={styles.footerLeft}>
              {PROFILE_DATA.contact.email} • {PROFILE_DATA.contact.location}
            </span>
            <span
              className={styles.visitorBadge}
              aria-label="Portfolio visitor count"
              title="Total portfolio visits"
            >
              <Eye size={13} aria-hidden="true" />
              <span>
                VISITORS:{" "}
                {visitorCount !== null ? visitorCount.toLocaleString() : "—"}
              </span>
            </span>
          </div>
          <button
            type="button"
            className={styles.footerRight}
            onClick={() => handleNavClick("portfolio://contact")}
          >
            Message me for a consultation →
          </button>
        </div>
      </footer>
    </div>
  );
};
