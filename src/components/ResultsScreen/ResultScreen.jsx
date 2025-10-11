import '../Components.css';
import './ResultScreen.css';

export default function ResultScreen({ score, total, onReview,  onHome }) {
  const percentage = (score / total) * 100;

  const message = percentage >= 70 ? "Congratulations! You're a Star! 🌟" : "Better luck next time! 👀";

  return (
    <div className="glass-screen">
      <h1 className="title">{message}</h1>
      <div className="title-highlight">{score} / {total}</div>
      <button className="event-btn" onClick={onReview}>
        Review Answers
      </button>
      <button className="event-btn" onClick={onHome}>
        Home
      </button>
    </div>
  );
}