import {
  User,
  Code,
  Briefcase,
  FileText,
  Mail,
  Gamepad2,
  Globe,
} from "lucide-react";
import { GithubIcon } from "../GithubIcon";
import type { PortfolioShortcut } from "../../data/portfolioData";
import { useBrowserStore } from "../../../browser/store/browserStore";
import styles from "./ShortcutGrid.module.css";

interface ShortcutGridProps {
  shortcuts: PortfolioShortcut[];
  className?: string;
}

export const ShortcutGrid: React.FC<ShortcutGridProps> = ({
  shortcuts,
  className,
}) => {
  const { navigateTab } = useBrowserStore();

  const renderIcon = (name: PortfolioShortcut["iconName"]) => {
    switch (name) {
      case "user":
        return <User size={24} aria-hidden="true" />;
      case "code":
        return <Code size={24} aria-hidden="true" />;
      case "briefcase":
        return <Briefcase size={24} aria-hidden="true" />;
      case "file-text":
        return <FileText size={24} aria-hidden="true" />;
      case "mail":
        return <Mail size={24} aria-hidden="true" />;
      case "gamepad":
        return <Gamepad2 size={24} aria-hidden="true" />;
      case "github":
        return <GithubIcon size={24} />;
      case "globe":
      default:
        return <Globe size={24} aria-hidden="true" />;
    }
  };

  const handleClick = (shortcut: PortfolioShortcut) => {
    if (shortcut.isExternal) {
      window.open(shortcut.url, "_blank", "noopener,noreferrer");
    } else {
      navigateTab(shortcut.url, true);
    }
  };

  return (
    <div
      className={`${styles.grid} ${className || ""}`}
      role="navigation"
      aria-label="Quick shortcuts"
    >
      {shortcuts.map((shortcut) => (
        <button
          key={shortcut.id}
          type="button"
          className={styles.shortcutTile}
          onClick={() => handleClick(shortcut)}
          title={shortcut.description}
          aria-label={`${shortcut.title}: ${shortcut.description}`}
        >
          <div className={styles.iconCircle}>
            {renderIcon(shortcut.iconName)}
          </div>
          <span className={styles.title}>{shortcut.title}</span>
        </button>
      ))}
    </div>
  );
};
