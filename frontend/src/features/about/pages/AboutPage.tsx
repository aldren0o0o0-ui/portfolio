import React from "react";
import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Send,
  Briefcase,
  Terminal,
} from "lucide-react";
import { PROFILE_DATA } from "../../../data/profile";
import { useBrowserStore } from "../../browser/store/browserStore";
import styles from "./AboutPage.module.css";

export const AboutPage: React.FC = () => {
  const { navigateTab } = useBrowserStore();

  return (
    <motion.article
      className={styles.container}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="About Me Profile"
    >
      {/* Header */}
      <header className={styles.heroSection}>
        <div className={styles.badge}>
          <User size={14} aria-hidden="true" />
          <span>About Me</span>
        </div>
        <h1 className={styles.pageTitle}>{PROFILE_DATA.name}</h1>
        <p className={styles.leadText}>{PROFILE_DATA.summary}</p>
      </header>

      {/* Professional Focus */}
      <section className={styles.section} aria-labelledby="focus-heading">
        <h2 id="focus-heading" className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>
            <Terminal size={20} aria-hidden="true" />
          </span>
          <span>Professional Focus & Career Direction</span>
        </h2>
        <p className={styles.bodyText}>{PROFILE_DATA.professionalFocus}</p>
        <p className={styles.bodyText}>
          I focus on building cohesive software architectures where the frontend
          and backend work in harmony. From designing relational schemas in
          PostgreSQL and constructing async RESTful APIs in FastAPI to
          implementing accessible, token-driven interfaces in React, my goal is
          to craft solutions that are reliable and straightforward to maintain.
        </p>
      </section>

      {/* Education & Academic Background */}
      <section className={styles.section} aria-labelledby="education-heading">
        <h2 id="education-heading" className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>
            <GraduationCap size={22} aria-hidden="true" />
          </span>
          <span>Education & Foundation</span>
        </h2>
        {PROFILE_DATA.education.map((edu, idx) => (
          <div key={idx} className={styles.educationCard}>
            <div className={styles.eduHeader}>
              <div>
                <h3 className={styles.degreeTitle}>
                  {edu.degree} in {edu.field}
                </h3>
                <span className={styles.institution}>{edu.institution}</span>
              </div>
              <span className={styles.eduStatus}>{edu.status}</span>
            </div>

            {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
              <div className={styles.courseworkSection}>
                <span className={styles.courseworkLabel}>
                  Core Coursework & Studies
                </span>
                <div className={styles.coursePills}>
                  {edu.relevantCoursework.map((course) => (
                    <span key={course} className={styles.coursePill}>
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Development Interests & Engineering Principles */}
      <section className={styles.section} aria-labelledby="principles-heading">
        <h2 id="principles-heading" className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <span>Engineering Principles</span>
        </h2>
        <div className={styles.principlesGrid}>
          {PROFILE_DATA.principles.map((principle) => (
            <div key={principle.title} className={styles.principleCard}>
              <h3 className={styles.principleTitle}>{principle.title}</h3>
              <p className={styles.principleDesc}>{principle.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation CTA */}
      <footer className={styles.ctaBox}>
        <div className={styles.ctaText}>
          <h2 className={styles.ctaTitle}>Explore My Work or Connect</h2>
          <p className={styles.ctaDesc}>
            Check out real project architectures or get in touch for software
            engineering opportunities.
          </p>
        </div>
        <div className={styles.ctaButtons}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => navigateTab("portfolio://projects", true)}
            aria-label="View Projects"
          >
            <Briefcase size={16} aria-hidden="true" />
            <span>View Projects</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => navigateTab("portfolio://contact", true)}
            aria-label="Contact Me"
          >
            <Send size={15} aria-hidden="true" />
            <span>Contact Me</span>
          </button>
        </div>
      </footer>
    </motion.article>
  );
};
