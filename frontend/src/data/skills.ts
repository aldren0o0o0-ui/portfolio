export interface SkillItem {
  name: string;
  context: string; // Concise description of how or where it is applied
  highlight?: boolean;
}

export interface SkillCategoryGroup {
  id: string;
  title: string;
  description: string;
  skills: SkillItem[];
}

export const SKILL_GROUPS: SkillCategoryGroup[] = [
  {
    id: "languages",
    title: "Programming Languages",
    description:
      "Core languages used for backend logic, web interfaces, and structured queries.",
    skills: [
      {
        name: "Python",
        context:
          "Backend development with FastAPI and Flask, asynchronous APIs, data modeling, constraint logic",
        highlight: true,
      },
      {
        name: "TypeScript",
        context:
          "Type-safe frontend development, strict application interfaces, component typing",
        highlight: true,
      },
      {
        name: "JavaScript (ES6+)",
        context:
          "Modern web fundamentals, DOM events, asynchronous operations, state patterns",
      },
      {
        name: "SQL",
        context:
          "Relational database querying, schema definitions, join operations, constraints",
        highlight: true,
      },
      {
        name: "HTML5 & CSS3",
        context:
          "Semantic markup, accessibility hierarchy, modern CSS custom properties, flexbox/grid",
      },
    ],
  },
  {
    id: "frontend",
    title: "Frontend Development",
    description:
      "Component architecture, user interaction, and responsive design systems.",
    skills: [
      {
        name: "React 19 & React",
        context:
          "Hooks, functional components, simulated routing, interactive UI architectures",
        highlight: true,
      },
      {
        name: "CSS Modules",
        context:
          "Scoped component styling, zero runtime CSS collisions, token-based design systems",
        highlight: true,
      },
      {
        name: "Tailwind CSS",
        context:
          "Utility-first frontend styling applied in full-stack project development (OmniSport AI)",
      },
      {
        name: "State Management (Zustand)",
        context:
          "Decoupled shared state, lightweight tab lifecycle, and theme persistence",
      },
      {
        name: "Responsive & Accessible UX",
        context:
          "WCAG contrast guidelines, keyboard accessibility, mobile-friendly touch targets",
      },
    ],
  },
  {
    id: "backend",
    title: "Backend Development & APIs",
    description:
      "Service architecture, asynchronous request handling, and data validation.",
    skills: [
      {
        name: "FastAPI",
        context:
          "High-performance Python web framework, OpenAPI schema generation, async endpoints",
        highlight: true,
      },
      {
        name: "RESTful API Design",
        context:
          "HTTP status codes, structured JSON payloads, clear endpoint routing, resource modeling",
        highlight: true,
      },
      {
        name: "Pydantic & Validation",
        context:
          "Strict request/response validation, schema enforcement, settings management",
      },
      {
        name: "Backend Architecture",
        context:
          "Layered service patterns, controller separation, constraint-based evaluation algorithms",
      },
    ],
  },
  {
    id: "databases",
    title: "Databases & Persistence",
    description:
      "Relational data structures, entity relationships, and storage reliability.",
    skills: [
      {
        name: "PostgreSQL",
        context:
          "Relational database persistence for competition data and hardware inventory models",
        highlight: true,
      },
      {
        name: "Relational Schema Design",
        context:
          "Foreign key constraints, normalization, indexes, primary keys, and entity relations",
        highlight: true,
      },
      {
        name: "Data Integrity & Constraints",
        context: "Unique checks, cascade rules, and transactional consistency",
      },
    ],
  },
  {
    id: "tools",
    title: "Tools & Development Workflows",
    description:
      "Development environment, build automation, and version control.",
    skills: [
      {
        name: "Git & GitHub",
        context:
          "Branching strategies, version tracking, pull request workflows, code collaboration",
        highlight: true,
      },
      {
        name: "Vite",
        context:
          "Fast modern frontend bundling, hot module replacement, production asset optimization",
      },
      {
        name: "Node.js & npm",
        context:
          "Package dependency management, build scripts, development tooling execution",
      }
    ],
  },
  {
    id: "practices",
    title: "Testing & Engineering Practices",
    description:
      "Code verification, architectural discipline, and maintainability.",
    skills: [
      {
        name: "Unit & Integration Testing",
        context:
          "Automated test suites using Vitest and React Testing Library for frontend reliability",
        highlight: true,
      },
      {
        name: "Code Quality & Linting",
        context:
          "Static code analysis with Oxlint, automated formatting with Prettier, strict TypeScript",
      },
      {
        name: "Constraint-Based Problem Solving",
        context:
          "Designing algorithms to manage complex scheduling and scheduling matrix rules",
      },
      {
        name: "Documentation & Architecture Reviews",
        context:
          "Writing maintainable technical specifications and transparent project progress tracking",
      },
    ],
  },
];
