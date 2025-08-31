import { useState, useEffect, useCallback } from "react";
import "./Components.css";

const QUIZ_TIME_LIMIT = 20;
const QUIZ_TIME_WARNING_THRESHOLD = 5;
const QUIZ_FEEDBACK_DISPLAY_TIME = 2; // seconds


export default function QuizScreen({ questions, onQuizEnd }) {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(""); // 'correct', 'incorrect', 'timeout', ''
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  const currentQuestion = questions[currentIndex];

  // Handle timer countdown
  useEffect(() => {
    if (feedback) return;

    if (timeLeft === 0) {
      handleTimeout();
      return;
    }

    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, feedback]);

  // Handle timeout scenario
  const handleTimeout = useCallback(() => {
    setFeedback("timeout"); // Indicate timeout feedback
    const updatedAnswers = [...userAnswers, null]; // null for unanswered
    setUserAnswers(updatedAnswers); // Record unanswered
    setTimeout(() => nextQuestion(score, updatedAnswers), QUIZ_FEEDBACK_DISPLAY_TIME * 1000); // Move to next question after delay
  }, [score, userAnswers]);

  // Handle option selection
  const handleOptionClick = (option) => {
    if (feedback) return;

    setSelectedOption(option);
    const correctAnswer = currentQuestion.Answer;

    const isCorrect = option === correctAnswer;
    const newScore = isCorrect ? score + 1 : score;

    if (isCorrect) setScore(newScore);
    setFeedback(isCorrect ? "correct" : "incorrect");

    const updatedAnswers = [...userAnswers, option];
    setUserAnswers(updatedAnswers);

    setTimeout(() => nextQuestion(newScore, updatedAnswers), 1200);
  };

  // Move to next question or end quiz
  const nextQuestion = (finalScore = score, finalAnswers = userAnswers) => {
    setSelectedOption(null);
    setFeedback("");
    setTimeLeft(QUIZ_TIME_LIMIT);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onQuizEnd(finalScore, finalAnswers);
    }
  };

  // Determine button class based on state
  const getOptionClass = (opt) => {
    if (!feedback) return selectedOption === opt ? "selected" : "";
    if (opt === currentQuestion.Answer) return "correct";
    if (selectedOption === opt && opt !== currentQuestion.Answer)
      return "incorrect";
    return "";
  };

  return (
    <div className="glass-screen">
      <div className="quiz-header">
        <div className="question-count">
          Question {currentIndex + 1} / {questions.length}
        </div>
        <div className={`timer ${timeLeft <= QUIZ_TIME_WARNING_THRESHOLD ? "timer-warning" : ""}`}>
          {timeLeft}s
        </div>
      </div>

      <div className="question-text">{currentQuestion.Question}</div>

      <div className="options">
        {["A", "B", "C", "D"].map((opt) => (
          <button
            key={opt}
            className={`option-btn ${getOptionClass(opt)}`}
            onClick={() => handleOptionClick(opt)}
            disabled={!!feedback}
          >
            <span className="opt-label">{opt}.</span>{" "}
            {currentQuestion[`Option ${opt}`]}
          </button>
        ))}
      </div>
    </div>
  );
};