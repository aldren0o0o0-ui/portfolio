import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Filter,
} from "lucide-react";
import type {
  QuizCategory,
  QuizQuestion,
  UserAnswerRecord,
  QuizGameStatus,
} from "./quizTypes";
import {
  prepareQuizQuestions,
  calculatePercentage,
  getScoreSummary,
} from "./quizLogic";
import styles from "./DeveloperQuizGame.module.css";

interface DeveloperQuizGameProps {
  onBackToHub?: () => void;
}

const CATEGORY_OPTIONS: Array<{
  id: QuizCategory;
  name: string;
  description: string;
}> = [
  {
    id: "all",
    name: "Comprehensive Mix",
    description: "Questions across all engineering topics",
  },
  {
    id: "fundamentals",
    name: "Fundamentals",
    description: "Big-O, data structures, and computer science basics",
  },
  {
    id: "javascript-typescript",
    name: "JavaScript & TypeScript",
    description: "Closures, event loop, types, and modern syntax",
  },
  {
    id: "python-backend",
    name: "Python & Backend",
    description: "GIL, generators, asynchronous I/O, and server logic",
  },
  {
    id: "apis-networking",
    name: "APIs & Networking",
    description: "REST, HTTP methods, status codes, and idempotency",
  },
  {
    id: "databases",
    name: "Databases & SQL",
    description: "ACID isolation, foreign keys, indexing, and B-trees",
  },
  {
    id: "testing-architecture",
    name: "Testing & Architecture",
    description: "Pure functions, unit vs integration, and clean design",
  },
];

export const DeveloperQuizGame: React.FC<DeveloperQuizGameProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>("all");
  const [status, setStatus] = useState<QuizGameStatus>("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null,
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswerRecord[]>([]);

  // Start new quiz session
  const startQuiz = (cat: QuizCategory = selectedCategory) => {
    const sessionQuestions = prepareQuizQuestions(cat, 8);
    setQuestions(sessionQuestions);
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setIsSubmitted(false);
    setScore(0);
    setUserAnswers([]);
    setStatus("in_progress");
  };

  const currentQuestion = questions[currentIndex];
  const isFinalQuestion = currentIndex === questions.length - 1;

  // Handle selecting an answer
  const handleSelectOption = (index: number) => {
    if (isSubmitted || !currentQuestion) return;

    setSelectedOptionIndex(index);
    setIsSubmitted(true);

    const isCorrect = index === currentQuestion.correctAnswerIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    const answerRecord: UserAnswerRecord = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedOptionIndex: index,
      correctOptionIndex: currentQuestion.correctAnswerIndex,
      selectedText: currentQuestion.options[index],
      correctText: currentQuestion.options[currentQuestion.correctAnswerIndex],
      isCorrect,
      explanation: currentQuestion.explanation,
    };

    setUserAnswers((prev) => [...prev, answerRecord]);
  };

  // Next question or complete quiz
  const handleNextQuestion = () => {
    if (isFinalQuestion) {
      setStatus("completed");
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsSubmitted(false);
    }
  };

  // Return to category selection
  const handleChooseCategory = () => {
    setStatus("intro");
  };

  // 1. Intro Screen
  if (status === "intro") {
    return (
      <div className={styles.container} data-testid="developer-quiz-game">
        <div className={styles.introCard}>
          <h2 className={styles.introTitle}>Developer Technical Quiz</h2>
          <p className={styles.introDesc}>
            Test your knowledge across core software engineering fundamentals,
            language mechanics, web architecture, and database principles.
            Select a category to begin an 8-question session.
          </p>

          <div
            className={styles.categoryGrid}
            role="radiogroup"
            aria-label="Quiz Categories"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.categoryBtn} ${selectedCategory === cat.id ? styles.selected : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
                role="radio"
                aria-checked={selectedCategory === cat.id}
              >
                <span className={styles.categoryName}>{cat.name}</span>
                <span className={styles.categoryCount}>{cat.description}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles.startBtn}
            onClick={() => startQuiz(selectedCategory)}
          >
            <BookOpen size={16} aria-hidden="true" />
            <span>Start Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Completed Results Screen
  if (status === "completed") {
    const totalQuestions = questions.length;
    const percentage = calculatePercentage(score, totalQuestions);
    const summary = getScoreSummary(percentage);

    return (
      <div className={styles.container} data-testid="developer-quiz-game">
        <div
          className={styles.resultsCard}
          role="region"
          aria-label="Quiz Results"
        >
          <div className={styles.scoreBadge}>
            <span
              className={styles.scorePercentage}
              data-testid="quiz-percentage"
            >
              {percentage}%
            </span>
            <span className={styles.scoreFraction}>
              {score} of {totalQuestions} Correct
            </span>
          </div>

          <h2 className={styles.resultsHeadline}>{summary.headline}</h2>
          <p className={styles.resultsSubtext}>{summary.subtext}</p>

          <div className={styles.resultsActions}>
            <button
              type="button"
              className={styles.nextBtn}
              onClick={() => startQuiz(selectedCategory)}
            >
              <RotateCcw size={16} aria-hidden="true" />
              <span>Play Again</span>
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleChooseCategory}
            >
              <Filter size={16} aria-hidden="true" />
              <span>Change Category</span>
            </button>
          </div>

          {/* Question-by-Question Review */}
          <div className={styles.reviewSection} aria-label="Question Review">
            <h3 className={styles.reviewTitle}>Session Review</h3>
            {userAnswers.map((record, index) => (
              <div
                key={record.questionId}
                className={styles.reviewItem}
                data-testid={`quiz-review-item-${index}`}
              >
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewQuestionText}>
                    {index + 1}. {record.question}
                  </span>
                  {record.isCorrect ? (
                    <span className={styles.reviewBadgeCorrect}>
                      <CheckCircle2 size={13} aria-hidden="true" />
                      <span>Correct</span>
                    </span>
                  ) : (
                    <span className={styles.reviewBadgeIncorrect}>
                      <XCircle size={13} aria-hidden="true" />
                      <span>Incorrect</span>
                    </span>
                  )}
                </div>

                <div className={styles.reviewDetails}>
                  <div className={styles.reviewAnswerRow}>
                    <span className={styles.reviewAnswerLabel}>
                      Your Answer:
                    </span>
                    <span>{record.selectedText}</span>
                  </div>
                  {!record.isCorrect && (
                    <div className={styles.reviewAnswerRow}>
                      <span className={styles.reviewAnswerLabel}>
                        Correct Answer:
                      </span>
                      <span>{record.correctText}</span>
                    </div>
                  )}
                  <div
                    className={styles.reviewAnswerRow}
                    style={{ marginTop: "4px" }}
                  >
                    <span className={styles.reviewAnswerLabel}>
                      Explanation:
                    </span>
                    <span>{record.explanation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. In-Progress Question Screen
  const progressPercent = Math.round(
    ((currentIndex + (isSubmitted ? 1 : 0)) / questions.length) * 100,
  );

  return (
    <div className={styles.container} data-testid="developer-quiz-game">
      {/* Quiz Progress Header */}
      <div className={styles.quizHeader}>
        <div className={styles.metaRow}>
          <span className={styles.categoryTag}>
            {currentQuestion?.categoryLabel || "General"}
          </span>

          <span className={styles.scoreTracker}>
            Question {currentIndex + 1} of {questions.length} • Score: {score}
          </span>
        </div>

        <div
          className={styles.progressBarContainer}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={styles.progressBarFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className={styles.questionCard}>
          <h2 className={styles.questionPrompt}>{currentQuestion.question}</h2>

          <div
            className={styles.optionsList}
            role="radiogroup"
            aria-label="Answer options"
          >
            {currentQuestion.options.map((optText, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D
              const isSelected = selectedOptionIndex === idx;
              const isCorrectAnswer =
                idx === currentQuestion.correctAnswerIndex;

              let optionClass = styles.optionBtn;
              if (isSubmitted) {
                if (isCorrectAnswer) {
                  optionClass = `${styles.optionBtn} ${styles.optionCorrect}`;
                } else if (isSelected) {
                  optionClass = `${styles.optionBtn} ${styles.optionIncorrect}`;
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  className={optionClass}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isSubmitted}
                  role="radio"
                  aria-checked={isSelected}
                  data-testid={`quiz-option-${idx}`}
                >
                  <span className={styles.optionLetter}>{letter}</span>
                  <span className={styles.optionText}>{optText}</span>
                  {isSubmitted && isCorrectAnswer && (
                    <span
                      className={styles.optionStatusIcon}
                      title="Correct Option"
                    >
                      <CheckCircle2
                        size={18}
                        color="var(--color-success)"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                  {isSubmitted && isSelected && !isCorrectAnswer && (
                    <span
                      className={styles.optionStatusIcon}
                      title="Incorrect Option"
                    >
                      <XCircle size={18} color="#ef4444" aria-hidden="true" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box appears immediately upon submission */}
          {isSubmitted && (
            <div
              className={styles.explanationBox}
              role="status"
              aria-live="polite"
              data-testid="quiz-explanation-box"
            >
              <div className={styles.explanationIcon}>
                <HelpCircle size={20} aria-hidden="true" />
              </div>
              <div className={styles.explanationContent}>
                <span className={styles.explanationLabel}>
                  {selectedOptionIndex === currentQuestion.correctAnswerIndex
                    ? "Correct!"
                    : "Explanation"}
                </span>
                <p className={styles.explanationText}>
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Action Row */}
          {isSubmitted && (
            <div className={styles.actionRow}>
              <button
                type="button"
                className={styles.nextBtn}
                onClick={handleNextQuestion}
                data-testid="quiz-next-btn"
              >
                <span>
                  {isFinalQuestion ? "View Results" : "Next Question"}
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
