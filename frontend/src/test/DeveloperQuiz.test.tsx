import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeveloperQuizGame } from "../features/games/developer-quiz/DeveloperQuizGame";
import { MASTER_QUIZ_QUESTIONS } from "../features/games/developer-quiz/quizData";
import {
  shuffleQuestionOptions,
  prepareQuizQuestions,
  calculatePercentage,
  getScoreSummary,
} from "../features/games/developer-quiz/quizLogic";

describe("Phase 5 — Developer Quiz Logic & Gameplay", () => {
  describe("Quiz Data Integrity", () => {
    it("ensures all questions have valid IDs, unique entries, and valid options", () => {
      const ids = new Set<string>();

      MASTER_QUIZ_QUESTIONS.forEach((q) => {
        expect(q.id).toBeTruthy();
        expect(ids.has(q.id)).toBe(false);
        ids.add(q.id);

        expect(q.question.trim().length).toBeGreaterThan(10);
        expect(q.options.length).toBe(4);
        expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswerIndex).toBeLessThan(q.options.length);
        expect(q.explanation.trim().length).toBeGreaterThan(15);
      });

      expect(MASTER_QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(14);
    });

    it("shuffleQuestionOptions correctly preserves the correct answer text and updates index", () => {
      const question = MASTER_QUIZ_QUESTIONS[0];
      const originalCorrectText = question.options[question.correctAnswerIndex];

      const shuffled = shuffleQuestionOptions(question);
      expect(shuffled.options).toHaveLength(4);
      expect(shuffled.options[shuffled.correctAnswerIndex]).toBe(
        originalCorrectText,
      );
    });

    it("prepareQuizQuestions filters by category and falls back gracefully", () => {
      const dbQuestions = prepareQuizQuestions("databases", 5);
      expect(dbQuestions.length).toBeGreaterThan(0);
      dbQuestions.forEach((q) => {
        expect(q.category).toBe("databases");
      });

      // All categories
      const allQuestions = prepareQuizQuestions("all", 6);
      expect(allQuestions).toHaveLength(6);
    });

    it("calculates percentage and summarizes performance accurately", () => {
      expect(calculatePercentage(8, 8)).toBe(100);
      expect(calculatePercentage(6, 8)).toBe(75);
      expect(calculatePercentage(0, 8)).toBe(0);
      expect(calculatePercentage(5, 0)).toBe(0);

      expect(getScoreSummary(100).headline).toBe("Perfect Score");
      expect(getScoreSummary(80).headline).toBe("Strong Technical Grasp");
      expect(getScoreSummary(65).headline).toBe("Competent Foundation");
      expect(getScoreSummary(40).headline).toBe("Review & Learn");
    });
  });

  describe("DeveloperQuizGame Component Interaction", () => {
    it("renders intro screen and allows category selection", () => {
      render(<DeveloperQuizGame />);

      expect(
        screen.getByRole("heading", { name: "Developer Technical Quiz" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Start Quiz/i }),
      ).toBeInTheDocument();

      // Check category buttons exist
      expect(
        screen.getByRole("radio", { name: /Comprehensive Mix/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("radio", { name: /Fundamentals/i }),
      ).toBeInTheDocument();
    });

    it("starts quiz, allows answering, provides immediate explanation, and advances", () => {
      render(<DeveloperQuizGame />);

      // Click Start Quiz
      fireEvent.click(screen.getByRole("button", { name: /Start Quiz/i }));

      // Question screen should now be visible
      expect(screen.getByText(/Question 1 of/i)).toBeInTheDocument();
      expect(
        screen.queryByTestId("quiz-explanation-box"),
      ).not.toBeInTheDocument();

      // Options A, B, C, D
      const options = screen.getAllByRole("radio");
      expect(options.length).toBe(4);

      // Select first option
      fireEvent.click(options[0]);

      // Immediate explanation appears
      expect(screen.getByTestId("quiz-explanation-box")).toBeInTheDocument();

      // Next Question button appears
      const nextBtn = screen.getByTestId("quiz-next-btn");
      expect(nextBtn).toBeInTheDocument();

      // All options are now disabled to prevent re-answering
      options.forEach((opt) => {
        expect(opt).toBeDisabled();
      });

      // Click Next Question
      fireEvent.click(nextBtn);
      expect(screen.getByText(/Question 2 of/i)).toBeInTheDocument();
    });
  });
});
