import React, { useState } from "react";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  Lock,
} from "lucide-react";
import type { PortfolioProject } from "../../../data/projects";
import { GithubIcon } from "../../home/components/GithubIcon";
import styles from "./ProjectCard.module.css";

interface ProjectCardProps {
  project: PortfolioProject;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusClass = (status: PortfolioProject["status"]) => {
    switch (status) {
      case "Active Development":
        return styles.statusActive;
      case "In Progress":
        return styles.statusProgress;
      case "Completed":
      default:
        return styles.statusCompleted;
    }
  };

  const getFeatureStatusClass = (
    status: "Completed" | "In Progress" | "Planned",
  ) => {
    switch (status) {
      case "Completed":
        return styles.featCompleted;
      case "In Progress":
        return styles.featProgress;
      case "Planned":
      default:
        return styles.featPlanned;
    }
  };

  return (
    <article className={styles.card} aria-labelledby={`project-${project.id}`}>
      <div className={styles.mainLayout}>
        {/* Left Column: Project Screenshot / Image */}
        {project.imageUrl && (
          <div className={styles.imageColumn}>
            <div className={styles.imageWrapper}>
              <img
                src={project.imageUrl}
                alt={`${project.title} UI preview`}
                className={styles.projectImage}
                loading="lazy"
              />
              <div className={styles.imageOverlayBadge}>
                <span
                  className={`${styles.statusBadge} ${getStatusClass(project.status)}`}
                >
                  {project.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Project Information & Actions */}
        <div className={styles.infoColumn}>
          {/* Category & Status (status fallback if no image) */}
          <div className={styles.header}>
            <span className={styles.category}>{project.category}</span>
            {!project.imageUrl && (
              <span
                className={`${styles.statusBadge} ${getStatusClass(project.status)}`}
              >
                {project.status}
              </span>
            )}
          </div>

          {/* Title & Tagline */}
          <div className={styles.titleArea}>
            <h2 id={`project-${project.id}`} className={styles.title}>
              {project.title}
            </h2>
            <span className={styles.tagline}>{project.tagline}</span>
          </div>

          {/* Description */}
          <p className={styles.description}>{project.description}</p>

          {/* Problem Addressed */}
          <div className={styles.problemBox}>
            <span className={styles.problemLabel}>Problem Solved</span>
            <p className={styles.problemText}>{project.problemAddressed}</p>
          </div>

          {/* Tech Stack Pills */}
          <div className={styles.stackList} aria-label="Technologies used">
            {project.techStack.map((tech) => (
              <span key={tech} className={styles.stackPill}>
                {tech}
              </span>
            ))}
          </div>

          {/* Footer Actions & Links */}
          <div className={styles.footer}>
            <div className={styles.linksGroup}>
              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkBtn}
                  aria-label={`View ${project.title} on GitHub`}
                >
                  <GithubIcon size={15} />
                  <span>Repository</span>
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              ) : (
                <span
                  className={styles.linkDisabled}
                  title="Repository will be published upon public release"
                >
                  <Lock size={12} aria-hidden="true" />
                  <span>Private Repository</span>
                </span>
              )}

              {project.liveDemoUrl ? (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.linkBtn}
                  aria-label={`View live demo of ${project.title}`}
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  <span>Live Demo</span>
                </a>
              ) : (
                <span
                  className={styles.linkDisabled}
                  title="Deployment in progress"
                >
                  <span>Demo in Development</span>
                </span>
              )}
            </div>

            <button
              type="button"
              className={styles.toggleDetailsBtn}
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              aria-controls={`features-${project.id}`}
            >
              <Layers size={14} aria-hidden="true" />
              <span>
                {isExpanded
                  ? "Hide Architecture Breakdown"
                  : "View Architecture Breakdown"}
              </span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Key Features Details */}
      {isExpanded && (
        <div className={styles.expandSection} id={`features-${project.id}`}>
          <div className={styles.category}>
            Key Features & Progress Breakdown
          </div>
          <div className={styles.featureList}>
            {project.features.map((feat) => (
              <div key={feat.title} className={styles.featureItem}>
                <div className={styles.featureTitleRow}>
                  <span className={styles.featureTitle}>{feat.title}</span>
                  <span
                    className={`${styles.featureStatus} ${getFeatureStatusClass(feat.status)}`}
                  >
                    {feat.status}
                  </span>
                </div>
                <p className={styles.featureDesc}>{feat.description}</p>
              </div>
            ))}
          </div>

          {project.architectureNotes && (
            <div
              className={styles.problemBox}
              style={{ borderLeftColor: "var(--border-strong)" }}
            >
              <span className={styles.problemLabel}>Architecture Notes</span>
              <p className={styles.problemText}>{project.architectureNotes}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer Actions & Links */}
      <div className={styles.footer}>
        <div className={styles.linksGroup}>
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkBtn}
              aria-label={`View ${project.title} on GitHub`}
            >
              <GithubIcon size={15} />
              <span>Repository</span>
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          ) : (
            <span
              className={styles.linkDisabled}
              title="Repository will be published upon public release"
            >
              <Lock size={12} aria-hidden="true" />
              <span>Private Repository</span>
            </span>
          )}

          {project.liveDemoUrl ? (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkBtn}
              aria-label={`View live demo of ${project.title}`}
            >
              <ExternalLink size={14} aria-hidden="true" />
              <span>Live Demo</span>
            </a>
          ) : (
            <span
              className={styles.linkDisabled}
              title="Deployment in progress"
            >
              <span>Demo in Development</span>
            </span>
          )}
        </div>

        <button
          type="button"
          className={styles.toggleDetailsBtn}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-controls={`features-${project.id}`}
        >
          <Layers size={14} aria-hidden="true" />
          <span>
            {isExpanded
              ? "Hide Architecture Breakdown"
              : "View Architecture Breakdown"}
          </span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
    </article>
  );
};
