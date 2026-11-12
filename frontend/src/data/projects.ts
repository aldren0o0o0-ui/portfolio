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
