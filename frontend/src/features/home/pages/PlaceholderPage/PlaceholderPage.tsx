import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Code,
  Briefcase,
  FileText,
  Mail,
  Gamepad2,
  Home,
  ArrowLeft,
  Construction,
} from "lucide-react";
import { useBrowserStore } from "../../../browser/store/browserStore";
import styles from "./PlaceholderPage.module.css";

interface PlaceholderPageProps {
  url: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ url }) => {
  const { goHome, goBack, tabs, activeTabId } = useBrowserStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const canGoBack = activeTab?.canGoBack ?? false;

  const getPageDetails = (path: string) => {
    if (path.includes("about")) {
      return {
        title: "About Me",
        tag: "Portfolio Page",
        icon: <User size={28} aria-hidden="true" />,
        desc: "In-depth professional background, architecture philosophies, career milestones, and engineering values. Slated for implementation in Phase 4.",
      };
    }
    if (path.includes("skills")) {
      return {
        title: "Skills & Technologies",
        tag: "Portfolio Page",
        icon: <Code size={28} aria-hidden="true" />,
        desc: "Interactive skill matrix, framework proficiencies, distributed systems tooling, and performance benchmarks.",
      };
    }
    if (path.includes("projects")) {
      return {
        title: "Projects & Architecture",
        tag: "Portfolio Page",
        icon: <Briefcase size={28} aria-hidden="true" />,
        desc: "Detailed architectural breakdowns, live production demos, source repositories, and technical post-mortems.",
      };
    }
    if (path.includes("resume")) {
      return {
        title: "Professional Résumé",
        tag: "Portfolio Page",
        icon: <FileText size={28} aria-hidden="true" />,
        desc: "Curated work history, education, leadership achievements, and downloadable PDF document.",
      };
    }
    if (path.includes("contact")) {
      return {
        title: "Contact Information",
        tag: "Portfolio Page",
        icon: <Mail size={28} aria-hidden="true" />,
        desc: "Secure inquiry form, direct email outreach, and verified professional network links.",
      };
    }
    if (path.includes("games")) {
      return {
        title: "Interactive Games",
        tag: "Experimental Module",
        icon: <Gamepad2 size={28} aria-hidden="true" />,
        desc: "Custom canvas-based mini-games designed to demonstrate frame-rate stability and 60 FPS animation loops.",
      };
    }
    return {
      title: "Portfolio Destination",
      tag: "Scaffolded View",
      icon: <Construction size={28} aria-hidden="true" />,
      desc: "This route is registered in the simulated browser router and is ready for full content delivery in Phase 4.",
    };
  };

  const details = getPageDetails(url);

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.iconBox}>{details.icon}</div>
      <span className={styles.tag}>{details.tag}</span>
      <h1 className={styles.title}>{details.title}</h1>
      <span className={styles.urlBadge}>{url}</span>
      <p className={styles.description}>{details.desc}</p>

      <div className={styles.actions}>
        {canGoBack && (
          <button
            type="button"
            className={styles.actionSecondary}
            onClick={goBack}
            aria-label="Go Back"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Go Back</span>
          </button>
        )}
        <button
          type="button"
          className={styles.actionPrimary}
          onClick={goHome}
          aria-label="Return to Home"
        >
          <Home size={16} aria-hidden="true" />
          <span>Browser Home</span>
        </button>
      </div>
    </motion.div>
  );
};
