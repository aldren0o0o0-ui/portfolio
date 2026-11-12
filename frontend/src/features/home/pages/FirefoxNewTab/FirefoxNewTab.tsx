import React from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Send,
  FileDown,
  Compass,
} from "lucide-react";
import { GithubIcon } from "../../components/GithubIcon";
import { HomeSearchBar } from "../../components/HomeSearchBar/HomeSearchBar";
import { ShortcutGrid } from "../../components/ShortcutGrid/ShortcutGrid";
import { WidgetCard } from "../../components/WidgetCard/WidgetCard";
import {
  PORTFOLIO_SHORTCUTS,
  FEATURED_PROJECTS,
  ENGINEERING_HIGHLIGHTS,
} from "../../data/portfolioData";
import { InteractiveDotsCanvas } from "../../components/InteractiveDots/InteractiveDotsCanvas";
import { useBrowserStore } from "../../../browser/store/browserStore";
import styles from "./FirefoxNewTab.module.css";

export const FirefoxNewTab: React.FC = () => {
  const { navigateTab } = useBrowserStore();
  const [selectedProjectIndex, setSelectedProjectIndex] = React.useState(0);
  const featured =
    FEATURED_PROJECTS[selectedProjectIndex] || FEATURED_PROJECTS[0];

  return (
    <div className={styles.wrapper}>
      <InteractiveDotsCanvas />
      <motion.div
        className={styles.page}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
      {/* Top Search & Firefox Brand Identity */}
      <section className={styles.topSection}>
        <div className={styles.firefoxBrand}>
          <Compass size={28} color="#0060df" aria-hidden="true" />
          <div>
            <h1 className={styles.brandText}>Firefox Home</h1>
            <span className={styles.brandSubtitle}>
              Aldren Dico • Engineering Workspace
            </span>
          </div>
        </div>

        <HomeSearchBar placeholder="Search with Firefox or enter portfolio route..." />
      </section>

      {/* Shortcuts Row */}
      <section className={styles.shortcutsContainer}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionTitle}>Frequently Visited</span>
        </div>
        <ShortcutGrid shortcuts={PORTFOLIO_SHORTCUTS} />
      </section>

      {/* Structured Dashboard Widgets */}
      <section className={styles.widgetGrid}>
        {/* Widget 1: Featured Project */}
        <WidgetCard
          title={featured.title}
          badge="Featured System"
          icon={<Sparkles size={18} aria-hidden="true" />}
          footer={
            <button
              type="button"
              className={styles.cardActionBtn}
              onClick={() => navigateTab(featured.route, true)}
            >
              <span>Explore Architecture</span>
              <ArrowRight size={13} aria-hidden="true" />
            </button>
          }
        >
          {/* Quick Switcher Between Featured Projects */}
          <div
            className={styles.projectTabSelector}
            role="tablist"
            aria-label="Select Featured Project"
          >
            {FEATURED_PROJECTS.map((proj, idx) => (
              <button
                key={proj.id}
                type="button"
                role="tab"
                aria-selected={idx === selectedProjectIndex}
                className={`${styles.projectTabBtn} ${
                  idx === selectedProjectIndex ? styles.projectTabBtnActive : ""
                }`}
                onClick={() => setSelectedProjectIndex(idx)}
              >
                {proj.title}
              </button>
            ))}
          </div>

          {featured.imageUrl && (
            <div className={styles.featuredImageWrapper}>
              <img
                src={featured.imageUrl}
                alt={`${featured.title} UI overview`}
                className={styles.featuredImage}
                loading="lazy"
              />
            </div>
          )}

          <p className={styles.bioText}>{featured.description}</p>
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {selectedProjectIndex === 0
                  ? "45k"
                  : selectedProjectIndex === 1
                    ? "100%"
                    : "60fps"}
              </span>
              <span className={styles.statLabel}>
                {selectedProjectIndex === 0
                  ? "msgs/sec throughput"
                  : selectedProjectIndex === 1
                    ? "compatibility accuracy"
                    : "smooth canvas rendering"}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {selectedProjectIndex === 0
                  ? "12ms"
                  : selectedProjectIndex === 1
                    ? "<50ms"
                    : "0.01ms"}
              </span>
              <span className={styles.statLabel}>
                {selectedProjectIndex === 0
                  ? "solver latency"
                  : selectedProjectIndex === 1
                    ? "query response"
                    : "state dispatch latency"}
              </span>
            </div>
          </div>
          <div className={styles.techPills}>
            {featured.techStack.map((tech) => (
              <span key={tech} className={styles.techPill}>
                {tech}
              </span>
            ))}
          </div>
        </WidgetCard>

        {/* Widget 2: Developer Overview */}
        <WidgetCard
          title="Engineer Overview"
          badge="Profile"
          icon={<Code2 size={18} aria-hidden="true" />}
          footer={
            <button
              type="button"
              className={styles.cardActionBtn}
              onClick={() => navigateTab("portfolio://about", true)}
            >
              <span>Read Full Bio</span>
              <ArrowRight size={13} aria-hidden="true" />
            </button>
          }
        >
          <p className={styles.bioText}>
            Senior Frontend Engineer & Software Architect focused on
            high-performance web applications, design systems, and state
            synchronization. Passionate about clean modular code and accessible
            interfaces.
          </p>
          <div className={styles.techPills}>
            <span className={styles.techPill}>React 19 & TypeScript</span>
            <span className={styles.techPill}>Distributed State (Zustand)</span>
            <span className={styles.techPill}>Design Tokens & CSS Modules</span>
            <span className={styles.techPill}>Vitest & CI/CD</span>
          </div>
        </WidgetCard>

        {/* Widget 3: Technical Highlights & Writing */}
        <WidgetCard
          title="Recent Engineering Highlights"
          badge="Articles"
          icon={<BookOpen size={18} aria-hidden="true" />}
        >
          <div className={styles.highlightList}>
            {ENGINEERING_HIGHLIGHTS.map((hl) => (
              <div
                key={hl.id}
                role="button"
                tabIndex={0}
                className={styles.highlightItem}
                onClick={() => navigateTab(hl.route, true)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    navigateTab(hl.route, true);
                  }
                }}
              >
                <div className={styles.highlightHeader}>
                  <span className={styles.highlightTag}>{hl.tag}</span>
                  <span className={styles.highlightTime}>{hl.readTime}</span>
                </div>
                <div className={styles.highlightTitle}>{hl.title}</div>
              </div>
            ))}
          </div>
        </WidgetCard>

        {/* Widget 4: Quick Links & Outreach */}
        <WidgetCard
          title="Quick Access & Inquiries"
          badge="Outreach"
          icon={<Send size={18} aria-hidden="true" />}
        >
          <p className={styles.bioText}>
            Direct channels to review code repositories, download updated
            credentials, or discuss frontend architecture collaborations.
          </p>
          <div className={styles.quickLinkRow}>
            <button
              type="button"
              className={styles.quickLinkBtn}
              onClick={() => navigateTab("portfolio://resume", true)}
            >
              <FileDown size={16} aria-hidden="true" />
              <span>Download Résumé</span>
            </button>
            <button
              type="button"
              className={styles.quickLinkBtn}
              onClick={() => navigateTab("portfolio://contact", true)}
            >
              <Send size={16} aria-hidden="true" />
              <span>Contact Me</span>
            </button>
            <button
              type="button"
              className={styles.quickLinkBtn}
              onClick={() =>
                window.open(
                  "https://github.com",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              <GithubIcon size={16} />
              <span>GitHub Profile</span>
            </button>
            <button
              type="button"
              className={styles.quickLinkBtn}
              onClick={() => navigateTab("portfolio://skills", true)}
            >
              <Code2 size={16} aria-hidden="true" />
              <span>Skills Matrix</span>
            </button>
          </div>
        </WidgetCard>
      </section>
    </motion.div>
  </div>
  );
};
