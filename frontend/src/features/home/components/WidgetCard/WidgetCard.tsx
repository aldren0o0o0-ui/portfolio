import React from "react";
import styles from "./WidgetCard.module.css";

interface WidgetCardProps {
  title: string;
  icon?: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  icon,
  badge,
  children,
  footer,
  className,
}) => {
  return (
    <article className={`${styles.card} ${className || ""}`}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <h3 className={styles.title}>{title}</h3>
        </div>
        {badge && <span className={styles.badge}>{badge}</span>}
      </header>

      <div className={styles.body}>{children}</div>

      {footer && <footer className={styles.footer}>{footer}</footer>}
    </article>
  );
};
