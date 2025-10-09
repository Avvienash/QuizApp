import './styles/Components.css';
import './styles/ErrorScreen.css';

export default function ErrorScreen({ onRetry }) {
  return (
    <div className="glass-screen">
      <h1 className="title">There was an issue generating the quiz. Please try again later.</h1>
      <button className="event-btn" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}
  