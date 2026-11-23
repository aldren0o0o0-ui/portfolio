export type ProjectStatus =
  "Active Development" | "In Progress" | "Completed" | "Planned";

export interface ProjectFeature {
  title: string;
  description: string;
  status: "Completed" | "In Progress" | "Planned";
}

export interface PortfolioProject {
  id: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  problemAddressed: string;
  techStack: string[];
  status: ProjectStatus;
  features: ProjectFeature[];
  githubUrl: string | null;
  liveDemoUrl: string | null;
  architectureNotes?: string;
  imageUrl?: string;
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "study-guide",
    title: "StudyGuide — AI Learning Companion",
    tagline: "AI Learning Companion & Offline-First Mobile/Web App",
    category: "Full-Stack AI & Cross-Platform App",
    description:
      "Cross-platform mobile and web learning platform helping students turn raw study materials (PDF, DOCX, and TXT files) into active, interactive study sessions—even when offline.",
    problemAddressed:
      "Addresses passive reading and unreliable internet access by turning raw documents into grounded AI summaries, adaptive quizzes, real-time voice coaching, and offline-cached study sessions.",
    techStack: [
      "React Native (Expo)",
      "TypeScript",
      "FastAPI",
      "PostgreSQL (pgvector)",
      "Gemini Live",
      "Redis / Valkey",
      "Zustand",
      "HTML5 Canvas",
    ],
    status: "Completed",
    features: [
      {
        title: "AI Document Analysis (pgvector)",
        description:
          "Extracts and chunks uploaded PDF, DOCX, and TXT files using vector embeddings to generate structured summaries, key concepts, and definitions.",
        status: "Completed",
      },
      {
        title: "Smart Exam Reviewer",
        description:
          "Creates multiple-choice, true/false, and short-answer quizzes grounded in source documents with instant grading, explanations, and offline retakes.",
        status: "Completed",
      },
      {
        title: "Real-Time AI Voice Practice",
        description:
          "Bidirectional WebSocket voice coaching powered by Gemini Live (24 kHz streaming audio + live transcription) for mock interviews and oral defenses.",
        status: "Completed",
      },
      {
        title: "Grounded AI Chat & Study Planner",
        description:
          "Multi-turn Q&A assistant citing uploaded materials plus a persistent daily planner synced with PostgreSQL and local storage.",
        status: "Completed",
      },
      {
        title: "Offline-First Sync & Persistent Auth",
        description:
          "Caches documents, analyses, chats, and quizzes locally, skips re-login when offline, and syncs pending changes automatically on reconnect.",
        status: "Completed",
      },
      {
        title: "Study Break Arcade (7 Canvas Games)",
        description:
          "7 built-in 60fps HTML5 Canvas mini-games (Blade Rift, Neon Drift, Violet Sudoku, Memory Rift, Astro Breaker, Neon Block Surge, Math Blitz Runner).",
        status: "Completed",
      },
    ],
    githubUrl: null,
    liveDemoUrl: "https://aldren-study-guide.netlify.app/",
    architectureNotes:
      "React Native (Expo SDK 58), Expo Router, TypeScript, TanStack Query, and Zustand frontend paired with a Python FastAPI, SQLAlchemy, Alembic, and RQ (Redis Queue) backend on PostgreSQL (pgvector) & Valkey/Redis, deployed across Netlify, Render, and EAS Build.",
  },
  {
    id: "omnisport-ai",
    title: "OmniSport AI - Capstone Project",
    imageUrl: "/images/projects/omnisportai.png",
    tagline:
      "Intramural competition management and constraint-based scheduling engine",
    category: "Full-Stack Application & Operations",
    description:
      "Developing a full-stack platform for managing intramural leagues and automating competition schedules with constraint-based rules.",
    problemAddressed:
      "Addresses manual coordination of field availability, team conflicts, referee assignments, and weather delays that can cause double-bookings and inefficient resource use.",
    techStack: ["FastAPI", "React", "Tailwind CSS", "PostgreSQL", "Python"],
    status: "Active Development",
    features: [
      {
        title: "Constraint-Based Scheduling Engine",
        description:
          "Implementing automated match scheduling that evaluates facility hours, referee availability, and team conflict rules.",
        status: "In Progress",
      },
      {
        title: "Competition & League Management",
        description:
          "Building structured workflows for standings, brackets, score submission, and division tracking.",
        status: "In Progress",
      },
      {
        title: "Relational Schema with PostgreSQL",
        description:
          "Optimized relational models for teams, rosters, match events, venues, and user permissions.",
        status: "Completed",
      },
      {
        title: "FastAPI Backend Architecture",
        description:
          "RESTful endpoints with Pydantic validation, structured error handling, and asynchronous query handling.",
        status: "Completed",
      },
    ],
    githubUrl: null, // Configurable: populate when repository is public
    liveDemoUrl: null, // Configurable: populate when deployed
    architectureNotes:
      "Combines a high-performance Python FastAPI service with an interactive React interface, backed by relational PostgreSQL persistence.",
  },
  {
    id: "buildtech",
    title: "BuildTech - School Project",
    imageUrl: "/images/projects/buildtech.jpg",
    tagline:
      "Computer-parts e-commerce platform with an integrated AI assistant",
    category: "Full-Stack E-Commerce & Systems",
    description:
      "Developing a PC hardware e-commerce application with structured catalog navigation, compatibility checks, and configuration guidance.",
    problemAddressed:
      "Addresses the complexity of matching PC components across socket types, power requirements, and physical-clearance constraints.",
    techStack: ["FastAPI", "React", "PostgreSQL", "Python"],
    status: "In Progress",
    features: [
      {
        title: "Hardware Catalog & Inventory Structure",
        description:
          "Designed database models for CPUs, GPUs, motherboards, memory, and power supplies with technical specifications.",
        status: "Completed",
      },
      {
        title: "Built-in AI Assistant",
        description:
          "Implementing a chat-driven assistant for component-compatibility suggestions and build-configuration questions.",
        status: "In Progress",
      },
      {
        title: "Multi-Vendor Marketplace Architecture",
        description:
          "Planned backend expansion allowing verified third-party vendors to list components with separate inventory tracking.",
        status: "Planned",
      },
      {
        title: "Intelligent Product Recommendations",
        description:
          "Planned recommendation heuristics matching complementary parts based on budget tiers and performance profiles.",
        status: "Planned",
      },
    ],
    githubUrl: null, // Configurable: populate when repository is public
    liveDemoUrl: null, // Configurable: populate when deployed
    architectureNotes:
      "Built with a modular FastAPI service structure and PostgreSQL persistence, designed for upcoming multi-tenant marketplace extension.",
  },
   {
    id: "coffeeShop",
    title: "ldrn's Coffee - School Project",
    imageUrl: "/images/projects/coffee.png",
    tagline: "Specialty Coffee Operations, Point-of-Sale & Live Order Fulfillment System",
    category: "Full-Stack SME & Enterprise Systems",
    description:
      "Built an end-to-end coffee shop operations platform with point-of-sale, kitchen-display, inventory, procurement, and analytics workflows.",
    problemAddressed:
      "Unifies fragmented point-of-sale, barista-queue, inventory, and sales-reporting workflows for independent coffee shops.",
    techStack: ["FastAPI", "React", "PostgreSQL", "Tailwind CSS", "SQLAlchemy", "Python", "Vite"],
    status: "Completed",
    features: [
      {
        title: "Modern POS & Counter Ticket Retrieval",
        description:
          "Implemented a POS workflow with drink-size adjustments, add-ons, cash-tender calculation, online-order lookup, and thermal receipt generation.",
        status: "Completed",
      },
      {
        title: "Barista Drink Preparation Queue (KDS)",
        description:
          "Implemented a live kitchen-display workflow for ticket timing, preparation status, recipe details, and customer pickup handoff.",
        status: "Completed",
      },
      {
        title: "Executive & Managerial Analytics",
        description:
          "Interactive sales velocity graphs, real-time database-driven trending coffee analytics, shift team roster supervision, and branch-level turnover metrics.",
        status: "Completed",
      },
      {
        title: "Inventory & Automated Procurement",
        description:
          "Ingredient-level stock tracking with critical reorder thresholds, inventory auditing, purchase request workflows, and cost-of-goods-sold (COGS) analysis.",
        status: "Completed",
      },
    ],
    githubUrl: null, // Configurable: populate when repository is public
    liveDemoUrl: null, // Configurable: populate when deployed
    architectureNotes:
      "Engineered with a domain-modular FastAPI backend architecture, SQLAlchemy ORM with PostgreSQL persistence, and a reactive Vite/React frontend utilizing role-based access control (RBAC) across Owner, Manager, Cashier, Barista, and Inventory Staff personas.",
  },
];
