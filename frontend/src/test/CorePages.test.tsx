import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AboutPage } from "../features/about/pages/AboutPage";
import { ProjectsPage } from "../features/projects/pages/ProjectsPage";
import { SkillsPage } from "../features/skills/pages/SkillsPage";
import { ResumePage } from "../features/resume/pages/ResumePage";
import { ContactPage } from "../features/contact/pages/ContactPage";
import { BrowserShell } from "../features/browser/components/BrowserShell/BrowserShell";
import { useBrowserStore } from "../features/browser/store/browserStore";

describe("Phase 4 — Core Portfolio Pages", () => {
  beforeEach(() => {
    useBrowserStore.setState({
      selectedBrowser: "firefox",
      tabs: [
        {
          id: "tab-1",
          title: "About — Portfolio",
          url: "portfolio://about",
          history: ["portfolio://about"],
          historyIndex: 0,
          canGoBack: false,
          canGoForward: false,
        },
      ],
      activeTabId: "tab-1",
      isMobileTabSwitcherOpen: false,
      isBrowserMenuOpen: false,
    });
  });

  describe("AboutPage", () => {
    it("renders professional focus, education, and principles", () => {
      render(<AboutPage />);

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(
        screen.getByText(/Professional Focus & Career Direction/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: /Engineering Principles/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /View Projects/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Contact Me/i }),
      ).toBeInTheDocument();
    });
  });

  describe("ProjectsPage", () => {
    it("renders real candidate projects and handles filtering", () => {
      render(<ProjectsPage />);

      expect(screen.getByText("OmniSport AI")).toBeInTheDocument();
      expect(screen.getByText("BuildTech")).toBeInTheDocument();
      expect(
        screen.getByText("Browser-Engine Developer Portfolio"),
      ).toBeInTheDocument();

      // Filter by Frontend
      const frontendTab = screen.getByRole("tab", { name: "Frontend" });
      fireEvent.click(frontendTab);

      expect(
        screen.getByText("Browser-Engine Developer Portfolio"),
      ).toBeInTheDocument();
      expect(screen.queryByText("BuildTech")).not.toBeInTheDocument();
    });

    it("expands architecture breakdown and safely handles unreleased links", () => {
      render(<ProjectsPage />);

      const expandButtons = screen.getAllByRole("button", {
        name: /View Architecture Breakdown/i,
      });
      fireEvent.click(expandButtons[0]);

      expect(
        screen.getByText(/Key Features & Progress Breakdown/i),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/Private Repository/i)[0]).toBeInTheDocument();
    });
  });

  describe("SkillsPage", () => {
    it("renders structured skill categories with practical context", () => {
      render(<SkillsPage />);

      expect(screen.getByText("Programming Languages")).toBeInTheDocument();
      expect(screen.getByText("Frontend Development")).toBeInTheDocument();
      expect(
        screen.getByText("Backend Development & APIs"),
      ).toBeInTheDocument();
      expect(screen.getByText("Databases & Persistence")).toBeInTheDocument();
      expect(
        screen.getByText("Testing & Engineering Practices"),
      ).toBeInTheDocument();

      // Verified technologies present
      expect(screen.getByText("FastAPI")).toBeInTheDocument();
      expect(screen.getByText("PostgreSQL")).toBeInTheDocument();
      expect(screen.getByText("Python")).toBeInTheDocument();
    });
  });

  describe("ResumePage", () => {
    it("renders readable resume layout and provides a PDF download", () => {
      render(<ResumePage />);

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getByText("Professional Summary")).toBeInTheDocument();
      expect(screen.getByText("Education")).toBeInTheDocument();
      expect(screen.getByText("Technical Skills")).toBeInTheDocument();
      expect(
        screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent),
      ).toEqual([
        "Professional Summary",
        "Technical Skills",
        "Software Projects & Engineering Experience",
        "Education",
      ]);
      const downloadButton = screen.getByRole("button", {
        name: /Download Résumé PDF/i,
      });

      // Print action triggers window.print
      const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
      const printBtn = screen.getByRole("button", {
        name: /Print or save as PDF/i,
      });
      fireEvent.click(printBtn);
      expect(printSpy).toHaveBeenCalled();
      fireEvent.click(downloadButton);
      expect(printSpy).toHaveBeenCalledTimes(2);
      printSpy.mockRestore();
    });
  });

  describe("ContactPage", () => {
    it("validates client-side inputs and prevents sending empty drafts", () => {
      render(<ContactPage />);

      const submitBtn = screen.getByRole("button", {
        name: /Open in email client/i,
      });
      fireEvent.click(submitBtn);

      expect(screen.getByText("Please provide your name.")).toBeInTheDocument();
      expect(
        screen.getByText("Please provide your email address."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Please provide a subject line."),
      ).toBeInTheDocument();
      expect(screen.getByText("Please provide a message.")).toBeInTheDocument();
    });

    it("validates email format properly", () => {
      render(<ContactPage />);

      const emailInput = screen.getByLabelText(/Your Email \*/i);
      fireEvent.change(emailInput, { target: { value: "not-an-email" } });

      const submitBtn = screen.getByRole("button", {
        name: /Open in email client/i,
      });
      fireEvent.click(submitBtn);

      expect(
        screen.getByText(
          "Please provide a valid email format (e.g. name@domain.com).",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("BrowserShell Core Route Integration", () => {
    it("routes to all 5 core portfolio pages seamlessly", () => {
      const { unmount } = render(<BrowserShell />);
      expect(screen.getByText(/About Me/i)).toBeInTheDocument();
      unmount();

      // Navigate to projects
      useBrowserStore.getState().navigateTab("portfolio://projects");
      const { unmount: unmountProjects } = render(<BrowserShell />);
      expect(
        screen.getByText("Featured Software Projects"),
      ).toBeInTheDocument();
      unmountProjects();

      // Navigate to skills
      useBrowserStore.getState().navigateTab("portfolio://skills");
      const { unmount: unmountSkills } = render(<BrowserShell />);
      expect(screen.getByText("Skills & Technologies")).toBeInTheDocument();
      unmountSkills();

      // Navigate to resume
      useBrowserStore.getState().navigateTab("portfolio://resume");
      const { unmount: unmountResume } = render(<BrowserShell />);
      expect(screen.getByText("Curriculum Vitae")).toBeInTheDocument();
      unmountResume();

      // Navigate to contact
      useBrowserStore.getState().navigateTab("portfolio://contact");
      const { unmount: unmountContact } = render(<BrowserShell />);
      expect(screen.getByText("Get in Touch")).toBeInTheDocument();
      unmountContact();
    });
  });
});
