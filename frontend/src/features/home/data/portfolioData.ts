import {
  PORTFOLIO_PROJECTS,
  type PortfolioProject,
} from "../../../data/projects";
import { SKILL_GROUPS } from "../../../data/skills";

export interface PortfolioShortcut {
  id: string;
  title: string;
  url: string;
  isExternal?: boolean;
  description: string;
  iconName:
    | "user"
    | "code"
    | "briefcase"
    | "file-text"
    | "mail"
    | "gamepad"
    | "github"
    | "globe";
}

export interface FeaturedProject {
  id: string;
  title: string;
  category: string;
  description: string;
  techStack: string[];
  stats?: string;
  route: string;
  githubUrl?: string | null;
  isLive?: boolean;
  imageUrl?: string;
}

export interface EngineeringHighlight {
  id: string;
  title: string;
  tag: string;
  date: string;
  summary: string;
  readTime: string;
  route: string;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}

export const PORTFOLIO_SHORTCUTS: PortfolioShortcut[] = [
  {
    id: "projects",
    title: "Projects",
    url: "portfolio://projects",
    description: "Featured full-stack applications and engineering showcases",
    iconName: "briefcase",
  },
  {
    id: "skills",
    title: "Skills & Stack",
    url: "portfolio://skills",
    description:
      "Languages, backend APIs, frontend architecture, and databases",
    iconName: "code",
  },
  {
    id: "about",
    title: "About Me",
    url: "portfolio://about",
    description: "Background, engineering principles, and focus areas",
    iconName: "user",
  },
  {
    id: "resume",
    title: "Résumé",
    url: "portfolio://resume",
    description: "Professional experience, technical skills, and education",
    iconName: "file-text",
  },
  {
    id: "contact",
    title: "Contact",
    url: "portfolio://contact",
    description: "Inquiries, email outreach, and professional links",
    iconName: "mail",
  },
  {
    id: "games",
    title: "Interactive Games",
    url: "portfolio://games",
    description: "Browser-based mini-games and canvas experiments (Preview)",
    iconName: "gamepad",
  },
];

// Single source of truth mapped from PORTFOLIO_PROJECTS
export const FEATURED_PROJECTS: FeaturedProject[] = PORTFOLIO_PROJECTS.map(
  (p: PortfolioProject) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    description: p.description,
    techStack: p.techStack,
    stats: p.status,
    route: "portfolio://projects",
    githubUrl: p.githubUrl,
    isLive: p.status === "Completed" || p.status === "Active Development",
    imageUrl: p.imageUrl,
  }),
);

export const ENGINEERING_HIGHLIGHTS: EngineeringHighlight[] = [
  {
    id: "hl-1",
    title: "Designing Constraint-Based Algorithms for Tournament Scheduling",
    tag: "Algorithms",
    date: "Architecture",
    summary:
      "Handling field availability, team conflict constraints, and referee allocations algorithmically.",
    readTime: "5 min read",
    route: "portfolio://projects",
  },
  {
    id: "hl-2",
    title: "Asynchronous API Architectures with Python & FastAPI",
    tag: "Backend",
    date: "Systems",
    summary:
      "Leveraging Pydantic validation, structured route dependencies, and relational PostgreSQL persistence.",
    readTime: "4 min read",
    route: "portfolio://skills",
  },
  {
    id: "hl-3",
    title: "Simulating Desktop Browser Environments with React & CSS Modules",
    tag: "Frontend",
    date: "UI Architecture",
    summary:
      "Decoupled tab state, linear history navigation, and zero-runtime CSS collision styling.",
    readTime: "5 min read",
    route: "portfolio://about",
  },
];

export const SKILL_CATEGORIES: SkillCategory[] = SKILL_GROUPS.map((group) => ({
  title: group.title,
  skills: group.skills.map((s) => s.name),
}));
