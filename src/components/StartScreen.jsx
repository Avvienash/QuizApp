import './Components.css';

export default function StartScreen({ onStart }) {
  return (
    <div className="glass-screen">
      <h1 className="title">NewsFlash Quiz</h1>
      <button className="event-btn" onClick={onStart}>
        Ready for today’s headlines?
      </button>
    </div>
  );
}
  