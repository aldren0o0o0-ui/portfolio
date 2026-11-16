import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Code2,
  Database,
  Server,
  ShieldCheck,
  Terminal,
  Layers,
  Cpu,
  GitBranch,
  CheckCircle2,
  Sparkles,
  FileCode2,
  Workflow,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react";
import { PROFILE_DATA } from "../../../../data/profile";
import { PORTFOLIO_PROJECTS } from "../../../../data/projects";
import { useBrowserStore } from "../../../browser/store/browserStore";
import styles from "./OverviewPage.module.css";

interface CapabilityTile {
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface CapabilityCard {
  title: string;
  pill: string;
  description: string;
  tiles: CapabilityTile[];
}

const CAPABILITY_CARDS: CapabilityCard[] = [
  {
    title: "Frontend & UI",
    pill: "react · typescript",
    description:
      "Responsive React interfaces, modular CSS architectures, and accessible user workflows.",
    tiles: [
      { label: "React 19", icon: <Code2 size={18} />, color: "#0284c7" },
      { label: "TypeScript", icon: <FileCode2 size={18} />, color: "#2563eb" },
      { label: "Tailwind", icon: <Layers size={18} />, color: "#0ea5e9" },
      { label: "CSS Mod", icon: <Sparkles size={18} />, color: "#ea580c" },
      { label: "Zustand", icon: <Workflow size={18} />, color: "#71717a" },
    ],
  },
  {
    title: "Backend & APIs",
    pill: "python · fastapi",
    description:
      "Async RESTful APIs, Pydantic validation, role-based access, and scheduling logic.",
    tiles: [
      { label: "Python", icon: <Terminal size={18} />, color: "#15803d" },
      { label: "FastAPI", icon: <Server size={18} />, color: "#0d9488" },
      { label: "REST API", icon: <Workflow size={18} />, color: "#ea580c" },
      { label: "Pydantic", icon: <ShieldCheck size={18} />, color: "#dc2626" },
      { label: "SQLAlchemy", icon: <Cpu size={18} />, color: "#27272a" },
    ],
  },
  {
    title: "Databases & Tools",
    pill: "postgresql · sql",
    description:
      "Relational schema design, data integrity constraints, and modern build tooling.",
    tiles: [
      { label: "PostgreSQL", icon: <Database size={18} />, color: "#1d4ed8" },
      { label: "SQL", icon: <Layers size={18} />, color: "#0f766e" },
      { label: "Vite", icon: <Sparkles size={18} />, color: "#d97706" },
      { label: "Node.js", icon: <Server size={18} />, color: "#15803d" },
      { label: "Git", icon: <GitBranch size={18} />, color: "#ea580c" },
    ],
  },
  {
    title: "Testing & Quality",
    pill: "vitest · clean code",
    description:
      "Automated component tests, static linting, and maintainable system architecture.",
    tiles: [
      { label: "Vitest", icon: <CheckCircle2 size={18} />, color: "#15803d" },
      { label: "RTL", icon: <Code2 size={18} />, color: "#dc2626" },
      { label: "Oxlint", icon: <ShieldCheck size={18} />, color: "#d97706" },
      { label: "Prettier", icon: <Sparkles size={18} />, color: "#0284c7" },
      { label: "RBAC", icon: <Terminal size={18} />, color: "#27272a" },
    ],
  },
];

export const OverviewPage: React.FC = () => {
  const { navigateTab } = useBrowserStore();

  const handleNavigate = (route: string) => {
    navigateTab(route, true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* 1. HERO CARD */}
      <section className={styles.heroCard} aria-label="Developer Introduction">
        <div className={styles.heroGrid}>
          {/* Left Framed Profile Box */}
          <div className={styles.avatarFrame}>
            {PROFILE_DATA.avatarUrl ? (
              <div className={styles.avatarPhotoWrap}>
                <img
                  src={PROFILE_DATA.avatarUrl}
                  alt="Aldren Dico profile"
                  className={styles.avatarPhoto}
                />
              </div>
            ) : (
              <div className={styles.avatarInner}>
                <div className={styles.avatarMonogram} aria-hidden="true">
                  AD
                </div>
                <div className={styles.avatarCaption}>
                  <span className={styles.avatarName}>Aldren Dico</span>
                  <span className={styles.avatarSub}>
                    {PROFILE_DATA.contact.location}
                  </span>
                </div>
              </div>
            )}
            <div className={styles.avatarTag}>BSIT • BUENAVISTA CC</div>
          </div>

          {/* Right Headline & Stats */}
          <div className={styles.heroContent}>
            <span className={styles.eyebrowOrange}>
              {PROFILE_DATA.title.toUpperCase()}
            </span>

            <h1 className={styles.heroHeadline}>
              Aspiring Software Developer
              <br />
              <span className={styles.headlineAccent}>Let&apos;s build it.</span>
            </h1>

            <p className={styles.heroSummary}>{PROFILE_DATA.summary}</p>

            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <span className={styles.statValue}>3+</span>
                <span className={styles.statLabel}>Full-stack systems</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>BSIT</span>
                <span className={styles.statLabel}>Buenavista CC</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>FastAPI</span>
                <span className={styles.statLabel}>Python &amp; REST APIs</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>React</span>
                <span className={styles.statLabel}>TypeScript UI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHAT I CAN BUILD FOR YOU (2x2 GRID) */}
      <section className={styles.section} aria-labelledby="capabilities-heading">
        <div className={styles.sectionTopRow}>
          <span id="capabilities-heading" className={styles.sectionEyebrow}>
            WHAT I CAN BUILD FOR YOU
          </span>
          <button
            type="button"
            className={styles.sectionLink}
            onClick={() => handleNavigate("portfolio://skills")}
          >
            View all skills <ArrowUpRight size={13} />
          </button>
        </div>

        <div className={styles.capabilitiesGrid}>
          {CAPABILITY_CARDS.map((card) => (
            <article key={card.title} className={styles.capabilityCard}>
              <div className={styles.capabilityHeader}>
                <h2 className={styles.capabilityTitle}>{card.title}</h2>
                <span className={styles.darkPill}>{card.pill}</span>
              </div>
              <p className={styles.capabilityDesc}>{card.description}</p>
              <div className={styles.tilesRow}>
                {card.tiles.map((tile) => (
                  <div key={tile.label} className={styles.techTile}>
                    <div
                      className={styles.techTileBox}
                      style={{ color: tile.color }}
                    >
                      {tile.icon}
                    </div>
                    <span className={styles.techTileLabel}>{tile.label}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. CTA CONTACT BANNER */}
      <section className={styles.ctaBanner} aria-label="Project Inquiry">
        <div className={styles.ctaLeft}>
          <h2 className={styles.ctaTitle}>Send me your project idea</h2>
          <div className={styles.ctaMetaList}>
            <div className={styles.ctaMetaRow}>
              <span className={styles.greenPill}>EMAIL</span>
              <span className={styles.ctaMetaValue}>
                {PROFILE_DATA.contact.email}
              </span>
            </div>
            <div className={styles.ctaMetaRow}>
              <span className={styles.greenPill}>LOCATION</span>
              <span className={styles.ctaMetaValue}>
                {PROFILE_DATA.contact.location}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={styles.ctaButton}
          onClick={() => handleNavigate("portfolio://contact")}
        >
          <Mail size={16} aria-hidden="true" />
          <span>Message me for a consultation</span>
        </button>
      </section>

      {/* 4. SYSTEMS I'VE BUILT (PROJECTS SHOWCASE) */}
      <section className={styles.section} aria-labelledby="projects-heading">
        <div className={styles.projectsSectionHeader}>
          <div>
            <span className={styles.eyebrowOrange}>
              CAPSTONE &amp; SCHOOL WORKS
            </span>
            <h2 id="projects-heading" className={styles.projectsHeadline}>
              Systems I&apos;ve{" "}
              <span className={styles.headlineAccent}>built.</span>
            </h2>
          </div>
          <button
            type="button"
            className={styles.sectionLink}
            onClick={() => handleNavigate("portfolio://projects")}
          >
            Full architecture details <ArrowUpRight size={13} />
          </button>
        </div>

        <div className={styles.projectsGrid}>
          {PORTFOLIO_PROJECTS.map((project, index) => (
            <article
              key={project.id}
              className={`${styles.projectCard} ${index === 0 ? styles.projectCardWide : ""
                }`}
              onClick={() => handleNavigate("portfolio://projects")}
            >
              {project.imageUrl && (
                <div className={styles.projectImageFrame}>
                  <img
                    src={project.imageUrl}
                    alt={`${project.title} preview`}
                    className={styles.projectImage}
                    loading="lazy"
                  />
                </div>
              )}

              <div className={styles.projectCardBody}>
                <div className={styles.projectTitleRow}>
                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  <span className={styles.projectStatusPill}>
                    {project.status}
                  </span>
                </div>

                <div className={styles.projectTagRow}>
                  <span className={styles.darkPill}>
                    {project.techStack.slice(0, 3).join(" · ").toLowerCase()}
                  </span>
                </div>

                <p className={styles.projectTagline}>{project.tagline}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. EDUCATION & ENGINEERING PRINCIPLES */}
      <section className={styles.section} aria-labelledby="foundation-heading">
        <div className={styles.sectionTopRow}>
          <span id="foundation-heading" className={styles.sectionEyebrow}>
            EDUCATION &amp; PRINCIPLES
          </span>
          <button
            type="button"
            className={styles.sectionLink}
            onClick={() => handleNavigate("portfolio://about")}
          >
            Read full profile <ArrowUpRight size={13} />
          </button>
        </div>

        <div className={styles.foundationGrid}>
          {PROFILE_DATA.education.map((edu, idx) => (
            <article key={idx} className={styles.foundationCard}>
              <div className={styles.foundationHeader}>
                <GraduationCap size={18} aria-hidden="true" />
                <span className={styles.darkPill}>{edu.status.toLowerCase()}</span>
              </div>
              <h3 className={styles.foundationTitle}>
                {edu.degree} in {edu.field}
              </h3>
              <p className={styles.foundationSub}>{edu.institution}</p>
              {edu.relevantCoursework && (
                <div className={styles.courseworkTags}>
                  {edu.relevantCoursework.map((course) => (
                    <span key={course} className={styles.outlineTag}>
                      {course}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}

          <article className={styles.foundationCard}>
            <div className={styles.foundationHeader}>
              <Terminal size={18} aria-hidden="true" />
              <span className={styles.darkPill}>engineering principles</span>
            </div>
            <ul className={styles.principlesList}>
              {PROFILE_DATA.principles.map((p) => (
                <li key={p.title} className={styles.principleItem}>
                  <strong>{p.title}:</strong> {p.description}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </motion.div>
  );
};
