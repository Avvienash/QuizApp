import { useState, useEffect } from 'react';
import './Components.css';

const taglines = [
  "Fetching today's top stories…",
  "The news wheel is turning…",
  "Bringing the world to your screen…",
  "Scanning the headlines…",
  "Loading facts, stay tuned…"
];

export default function LoadingScreen() {

  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTaglineIndex((prevIndex) => 
        (prevIndex + 1) % taglines.length
      );
    }, 5000); // Change tagline every 5 seconds

    return () => clearInterval(interval);
  }, [taglines.length]);

  return (
    <div className="glass-screen">
      <h1 className="title">{taglines[currentTaglineIndex]}</h1>
      <div className="loader"></div>
    </div>
  );
}
