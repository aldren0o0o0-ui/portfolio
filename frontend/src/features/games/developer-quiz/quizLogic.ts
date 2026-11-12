import type { QuizCategory, QuizQuestion } from "./quizTypes";
import { MASTER_QUIZ_QUESTIONS } from "./quizData";

/**
 * Fisher-Yates shuffle algorithm.
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Shuffles options for a question while maintaining the correct answer index.
 */
export function shuffleQuestionOptions(question: QuizQuestion): QuizQuestion {
  const originalCorrectText = question.options[question.correctAnswerIndex];

  // Create indexed options
  const indexedOptions = question.options.map((opt, idx) => ({
    text: opt,
    isOriginalCorrect: idx === question.correctAnswerIndex,
  }));

  const shuffledIndexed = shuffleArray(indexedOptions);
  const newOptions = shuffledIndexed.map((item) => item.text);
  const newCorrectIndex = shuffledIndexed.findIndex(
    (item) => item.isOriginalCorrect,
  );

  return {
    ...question,
    options: newOptions,
    correctAnswerIndex:
      newCorrectIndex !== -1 ? newCorrectIndex : question.correctAnswerIndex,
    // Preserve other fields
    explanation: question.explanation.includes(originalCorrectText)
      ? question.explanation
      : question.explanation,
  };
}

/**
 * Filters and prepares questions for a quiz session.
 */
export function prepareQuizQuestions(
  category: QuizCategory = "all",
  count: number = 8,
): QuizQuestion[] {
  let pool = MASTER_QUIZ_QUESTIONS;

  if (category !== "all") {
    pool = MASTER_QUIZ_QUESTIONS.filter((q) => q.category === category);
  }

  // Handle empty or insufficient pool safely
  if (pool.length === 0) {
    pool = MASTER_QUIZ_QUESTIONS;
  }

  const shuffledQuestions = shuffleArray(pool).slice(0, count);
  return shuffledQuestions.map((q) => shuffleQuestionOptions(q));
}

/**
 * Calculates score percentage cleanly.
 */
export function calculatePercentage(score: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((score / total) * 100);
}

/**
 * Returns a concise performance assessment based on the score percentage.
 */
export function getScoreSummary(percentage: number): {
  headline: string;
  subtext: string;
} {
  if (percentage === 100) {
    return {
      headline: "Perfect Score",
      subtext:
        "Flawless execution across fundamentals, backend systems, databases, and testing principles.",
    };
  }
  if (percentage >= 80) {
    return {
      headline: "Strong Technical Grasp",
      subtext:
        "Solid command of modern web and backend engineering concepts with few misses.",
    };
  }
  if (percentage >= 60) {
    return {
      headline: "Competent Foundation",
      subtext:
        "Good core knowledge with a few areas open for deeper review in asynchronous flow or database constraints.",
    };
  }
  return {
    headline: "Review & Learn",
    subtext:
      "A valuable opportunity to review runtime architectures, closures, and distributed systems fundamentals.",
  };
}
