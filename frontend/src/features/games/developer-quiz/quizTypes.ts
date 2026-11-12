export type QuizCategory =
  | "all"
  | "fundamentals"
  | "javascript-typescript"
  | "python-backend"
  | "apis-networking"
  | "databases"
  | "testing-architecture";

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  categoryLabel: string;
  difficulty: "beginner" | "intermediate";
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface UserAnswerRecord {
  questionId: string;
  question: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  selectedText: string;
  correctText: string;
  isCorrect: boolean;
  explanation: string;
}

export type QuizGameStatus = "intro" | "in_progress" | "completed";

export interface QuizSessionState {
  questions: QuizQuestion[];
  currentIndex: number;
  selectedOptionIndex: number | null;
  isSubmitted: boolean;
  score: number;
  userAnswers: UserAnswerRecord[];
  status: QuizGameStatus;
  selectedCategory: QuizCategory;
}
