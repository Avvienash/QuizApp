import './Components.css';

export default function StartScreen({ onStart }) {
  return (
    <div className="glass-screen">
      <h1 className="title">The Star Malaysia Latest News Quiz</h1>
      <button className="event-btn" onClick={onStart}>
        Start
      </button>
    </div>
  );
}
  