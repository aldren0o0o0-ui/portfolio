import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Home, RotateCw } from "lucide-react";
import { useBrowserStore } from "../../../browser/store/browserStore";
import styles from "./NotFoundPage.module.css";

interface NotFoundPageProps {
  url: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ url }) => {
  const { goHome, reloadCurrentTab } = useBrowserStore();

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.card}>
        <div className={styles.header}>
          <AlertCircle
            size={28}
            className={styles.warningIcon}
            aria-hidden="true"
          />
          <div className={styles.titleArea}>
            <h1 className={styles.title}>
              This simulated page can&apos;t be reached
            </h1>
            <span className={styles.errorCode}>
              ERR_PORTFOLIO_ROUTE_NOT_FOUND
            </span>
          </div>
        </div>

        <p className={styles.message}>
          The address <strong>{url}</strong> does not match any recognized
          portfolio route.
        </p>

        <ul className={styles.detailsList}>
          <li>
            Check the address for typos (e.g. <code>portfolio://projects</code>,{" "}
            <code>skills</code>, <code>about</code>, <code>resume</code>,{" "}
            <code>contact</code>).
          </li>
          <li>
            Return to the browser home page to select from the verified
            shortcuts.
          </li>
        </ul>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={goHome}
            aria-label="Return to browser home"
          >
            <Home size={14} aria-hidden="true" />
            <span>Go to Home Page</span>
          </button>

          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={reloadCurrentTab}
            aria-label="Reload current view"
          >
            <RotateCw size={14} aria-hidden="true" />
            <span>Try Reloading</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
