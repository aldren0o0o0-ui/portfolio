export interface ProfileContactInfo {
  email: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  location: string;
}

export interface EducationItem {
  degree: string;
  field: string;
  institution: string;
  graduationYear?: string;
  status: string;
  relevantCoursework?: string[];
}

export interface EngineeringPrinciple {
  title: string;
  description: string;
}

export interface ProfileData {
  name: string;
  title: string;
  summary: string;
  professionalFocus: string;
  education: EducationItem[];
  principles: EngineeringPrinciple[];
  contact: ProfileContactInfo;
}

export const PROFILE_DATA: ProfileData = {
  name: "Aspiring Software Engineer",
  title: "Software Engineering Student | Full-Stack Developer",
  summary:
    "BSIT student and aspiring software engineer with hands-on experience building full-stack web applications with Python, FastAPI, React, and PostgreSQL. Skilled in REST API development, relational database design, and application logic for scheduling, e-commerce, and business operations. Focused on reliable, maintainable software that solves practical workflow problems.",
  professionalFocus:
    "Focused on Python (FastAPI), modern TypeScript/React, PostgreSQL database design, and modular software architecture. Interested in solving complex operational workflows through thoughtful software engineering.",
  education: [
    {
      degree: "Bachelor of Science",
      field: "Information Technology",
      institution: "Buenavista Community College",
      status: "Active Student",
      relevantCoursework: [
        "Database Management Systems",
        "Web Application Development",
        "Software Engineering Principles",
        "Object-Oriented Programming",
      ],
    },
  ],
  principles: [
    {
      title: "Reliability & Clean Architecture",
      description:
        "Prioritizing modular, decoupled services and typed data models that are straightforward to test, maintain, and reason about.",
    },
    {
      title: "Algorithmic Problem Solving",
      description:
        "Applying constraint-based scheduling, graph logic, and structured data queries to real-world logistics and coordination problems.",
    },
    {
      title: "Responsive & Accessible UX",
      description:
        "Ensuring web interfaces respect accessibility standards (WCAG), keyboard navigation, fast load times, and clean visual hierarchies.",
    },
    {
      title: "Honest & Transparent Engineering",
      description:
        "Documenting technical tradeoffs, accurately communicating feature statuses, and choosing established tools over hype-driven complexity.",
    },
  ],
  contact: {
    email: "aldren.dico.it@gmail.com", // Configurable email address
    githubUrl: "https://github.com/settings/profile", // Configurable: set to real GitHub profile URL when ready
    linkedinUrl: null, // Configurable: set to real LinkedIn profile URL when ready
    location: "Bohol, Philippines",
  },
};
