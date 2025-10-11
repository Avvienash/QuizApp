import { useState, useEffect } from "react";
import "../Components.css";
import "./QuizReviewScreen.css";

export default function QuizReviewScreen({ questions, userAnswers, onReturnToResults }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];
  const userAnswer = userAnswers[currentIndex];

  // Move to next question
  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Move to previous question
  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Keyboard navigation (arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        nextQuestion();
      } else if (e.key === "ArrowLeft") {
        prevQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, questions.length]);

  // Determine button class based on user answer and correct answer
  const getOptionClass = (opt) => {
    if (opt === currentQuestion.Answer) return "correct";
    if (userAnswer === opt && opt !== currentQuestion.Answer) return "incorrect";
    return "";
  };

  return (
    <div className="glass-screen">
      <div className="quiz-header">
        <div className="question-count">
          Question {currentIndex + 1} / {questions.length}
        </div>
        <div className="nav-buttons">
          {/* <button
            className="nav-btn"
            onClick={onReturnToResults}
          >
            Return to Results
          </button> */}
          <button
            className="nav-btn"
            onClick={prevQuestion}
            disabled={currentIndex === 0}
          >
            Back
          </button>
          <button
            className="nav-btn"
            onClick={nextQuestion}
            disabled={currentIndex === questions.length - 1}
          >
            Next
          </button>
        </div>
      </div>

      <div className="question-text">{currentQuestion.Question}</div>

      <div className="options">
        {["A", "B", "C", "D"].map((opt) => (
          <button
            key={opt}
            className={`option-btn ${getOptionClass(opt)}`}
            disabled
          >
            <span className="opt-label">{opt}.</span>{" "}
            {currentQuestion[`Option ${opt}`]}
          </button>
        ))}
      </div>

        <div className="quiz-header">
          <div className="source-link">
            <a
              href={currentQuestion.Source}
              target="_blank"
              rel="noopener noreferrer"
              className="source-link-text"
            >
              Read more
            </a>
          </div>
          <div className="nav-buttons">
              <button
                className="nav-btn"
                onClick={onReturnToResults}
              >
                Return to Results
              </button>
          </div>
      </div>

    </div>
  );
}
