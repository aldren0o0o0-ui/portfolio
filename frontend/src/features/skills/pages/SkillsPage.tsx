import React from "react";
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import { SKILL_GROUPS } from "../../../data/skills";
import styles from "./SkillsPage.module.css";

export const SkillsPage: React.FC = () => {
  return (
    <motion.article
      className={styles.container}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="Technical Skills Matrix"
    >
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.badge}>
          <Code2 size={14} aria-hidden="true" />
          <span>Technical Competencies</span>
        </div>
        <h1 className={styles.title}>Skills & Technologies</h1>
        <p className={styles.subtitle}>
          Organized breakdown of programming languages, frontend systems,
          backend APIs, relational databases, and engineering workflows, with
          contextual descriptions of how each skill is applied in practice.
        </p>
      </header>

      {/* Categories Grid */}
      <section className={styles.categoryGrid} aria-label="Skill categories">
        {SKILL_GROUPS.map((group) => (
          <div key={group.id} className={styles.categoryCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.categoryTitle}>{group.title}</h2>
              <p className={styles.categoryDesc}>{group.description}</p>
            </div>

            <div className={styles.skillsList}>
              {group.skills.map((skill) => (
                <div key={skill.name} className={styles.skillItem}>
                  <div className={styles.skillNameRow}>
                    <span className={styles.skillName}>{skill.name}</span>
                    {skill.highlight && (
                      <span className={styles.coreBadge}>Core</span>
                    )}
                  </div>
                  <span className={styles.skillContext}>{skill.context}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </motion.article>
  );
};
