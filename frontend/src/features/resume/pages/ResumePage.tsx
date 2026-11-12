import React from "react";
import { motion } from "framer-motion";
import { FileText, Printer, Download, Mail, MapPin } from "lucide-react";
import { PROFILE_DATA } from "../../../data/profile";
import { PORTFOLIO_PROJECTS } from "../../../data/projects";
import styles from "./ResumePage.module.css";

export const ResumePage: React.FC = () => {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <motion.article
      className={styles.container}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="Professional Résumé"
    >
      {/* Top Action Bar */}
      <header className={styles.topBar}>
        <div className={styles.badge}>
          <FileText size={14} aria-hidden="true" />
          <span>Curriculum Vitae</span>
        </div>

        <div className={styles.actionsGroup}>
          <button
            type="button"
            className={styles.printBtn}
            onClick={handlePrint}
            aria-label="Print or save as PDF via system print dialog"
          >
            <Printer size={15} aria-hidden="true" />
            <span>Print / Save PDF</span>
          </button>

          <button
            type="button"
            className={styles.downloadBtn}
            onClick={handlePrint}
            aria-label="Download Résumé PDF"
            title="Choose Save to PDF in the system print dialog"
          >
            <Download size={15} aria-hidden="true" />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Résumé Document Sheet */}
      <div className={styles.resumeSheet}>
        {/* Header */}
        <section className={styles.sheetHeader}>
          <h1 className={styles.candidateName}>{PROFILE_DATA.name}</h1>
          <span className={styles.candidateTitle}>{PROFILE_DATA.title}</span>

          <div className={styles.contactLine}>
            {PROFILE_DATA.contact.email && (
              <span className={styles.contactItem}>
                <Mail size={12} aria-hidden="true" />
                <span>{PROFILE_DATA.contact.email}</span>
              </span>
            )}
            {PROFILE_DATA.contact.location && (
              <span className={styles.contactItem}>
                <MapPin size={12} aria-hidden="true" />
                <span>{PROFILE_DATA.contact.location}</span>
              </span>
            )}
          </div>
        </section>

        {/* Professional Summary */}
        <section
          className={styles.sheetSection}
          aria-labelledby="resume-summary"
        >
          <h2 id="resume-summary" className={styles.sheetSectionHeading}>
            Professional Summary
          </h2>
          <p className={styles.summaryText}>{PROFILE_DATA.summary}</p>
        </section>

        {/* Technical Skills Summary */}
        <section
          className={styles.sheetSection}
          aria-labelledby="resume-skills"
        >
          <h2 id="resume-skills" className={styles.sheetSectionHeading}>
            Technical Skills
          </h2>
          <div className={styles.skillsSummary}>
            <div className={styles.skillLine}>
              <strong>Languages:</strong> Python, TypeScript, JavaScript (ES6+),
              SQL, HTML5, CSS3
            </div>
            <div className={styles.skillLine}>
              <strong>Backend & APIs:</strong> FastAPI, RESTful API Design,
              Pydantic, Asynchronous Services, Architecture Patterns
            </div>
            <div className={styles.skillLine}>
              <strong>Frontend:</strong> React 19, CSS Modules, Tailwind CSS,
              Zustand, Vite, Web Accessibility (WCAG)
            </div>
            <div className={styles.skillLine}>
              <strong>Databases & Persistence:</strong> PostgreSQL, Relational
              Schema Modeling, Foreign Key Constraints, Query Optimization
            </div>
            <div className={styles.skillLine}>
              <strong>Developer Tools & Practices:</strong> Git, GitHub,
              Vitest, Testing Library, Oxlint, Prettier, Constraint-Based
              Scheduling
            </div>
          </div>
        </section>

        {/* Technical Projects & Relevant Experience */}
        <section
          className={styles.sheetSection}
          aria-labelledby="resume-projects"
        >
          <h2 id="resume-projects" className={styles.sheetSectionHeading}>
            Software Projects & Engineering Experience
          </h2>

          {PORTFOLIO_PROJECTS.map((proj) => (
            <div key={proj.id} className={styles.entryItem}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTitle}>{proj.title}</span>
                <span className={styles.entryDate}>{proj.status}</span>
              </div>
              <span className={styles.entrySub}>
                {proj.category} • Stack: {proj.techStack.join(", ")}
              </span>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Project Focus:</strong> {proj.description}{" "}
                  <strong>Addresses:</strong> {proj.problemAddressed}
                </li>
                {proj.features.slice(0, 2).map((feat) => (
                  <li key={feat.title}>
                    <strong>{feat.title}:</strong> {feat.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Education */}
        <section
          className={styles.sheetSection}
          aria-labelledby="resume-education"
        >
          <h2 id="resume-education" className={styles.sheetSectionHeading}>
            Education
          </h2>
          {PROFILE_DATA.education.map((edu, idx) => (
            <div key={idx} className={styles.entryItem}>
              <div className={styles.entryHeader}>
                <span className={styles.entryTitle}>
                  {edu.degree} in {edu.field}
                </span>
                <span className={styles.entryDate}>{edu.status}</span>
              </div>
              <span className={styles.entrySub}>{edu.institution}</span>
              {edu.relevantCoursework && (
                <ul className={styles.bulletList}>
                  <li>
                    <strong>Core Coursework:</strong>{" "}
                    {edu.relevantCoursework.join(", ")}
                  </li>
                </ul>
              )}
            </div>
          ))}
        </section>
      </div>
    </motion.article>
  );
};
