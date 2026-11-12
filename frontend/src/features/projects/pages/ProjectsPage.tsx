import React, { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { PORTFOLIO_PROJECTS } from "../../../data/projects";
import { ProjectCard } from "../components/ProjectCard";
import styles from "./ProjectsPage.module.css";

export const ProjectsPage: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const filterOptions = ["All", "Full-Stack", "Frontend", "Active Development"];

  const filteredProjects = PORTFOLIO_PROJECTS.filter((project) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Full-Stack")
      return project.category.includes("Full-Stack");
    if (selectedFilter === "Frontend")
      return project.category.includes("Frontend");
    if (selectedFilter === "Active Development")
      return project.status === "Active Development";
    return true;
  });

  return (
    <motion.article
      className={styles.container}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="Software Projects Showcase"
    >
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.badge}>
          <Briefcase size={14} aria-hidden="true" />
          <span>Projects & Architecture</span>
        </div>
        <h1 className={styles.title}>Featured Software Projects</h1>
        <p className={styles.subtitle}>
          A collection of full-stack web applications and architectures, with
          transparent descriptions of problems addressed, technology stacks, and
          active feature milestones.
        </p>
      </header>

      {/* Filter Tabs */}
      <div
        className={styles.filtersBar}
        role="tablist"
        aria-label="Filter projects"
      >
        {filterOptions.map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={selectedFilter === option}
            className={`${styles.filterBtn} ${selectedFilter === option ? styles.filterBtnActive : ""}`}
            onClick={() => setSelectedFilter(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <section className={styles.projectsList} aria-label="Projects list">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className={styles.emptyState}>
            No projects found matching the selected filter.
          </div>
        )}
      </section>
    </motion.article>
  );
};
