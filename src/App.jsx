import {useState, useEffect} from "react";
import StartScreen from './components/StartScreen';
import ErrorScreen from './components/ErrorScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import LoadingScreen from './components/LoadingScreen';
import QuizReviewScreen from './components/QuizReviewScreen';
import backgroundVideo from './assets/bg.mp4';
import backgroundPoster from './assets/bg.jpg';
import winnerVideo from './assets/winner.mp4';
import { loadFromCache, saveToCache } from './utils/cache'; // removed clearCache

function App() {
  // State management
  const [questions, setQuestions] = useState([]);
  const [screen, setScreen] = useState('start'); // start, quiz, loading, result, review, error
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [showWinnerVideo, setShowWinnerVideo] = useState(false);

  // Helper: freshness check (24h)
  const isFresh = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    if (!dateString || dateString !== today) return false;
    return true;
  };

  // Fetch existing daily quiz (no generation here)
  const fetchQuiz = async () => {
    try {
      const res = await fetch("/.netlify/functions/generateQuiz?category=sport");
      if (!res.ok) throw new Error("Failed to fetch quiz");
      const quizData = await res.json();
      setQuestions(quizData.questions || []);
      setQuestionsLoaded(true);
      saveToCache(quizData); // store entire object: { date, questions }
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setScreen('error');
    }
  };

  // Load quiz (cached if <24h, else fetch)
  const loadQuiz = () => {
    const cached = loadFromCache();
    if (cached && isFresh(cached.date) && Array.isArray(cached.questions) && cached.questions.length) {
      setQuestions(cached.questions);
      setQuestionsLoaded(true);
    } else {
      fetchQuiz();
    }
  };

  // On mount
  useEffect(() => { loadQuiz(); }, []);

  // Start quiz
  const handleStart = () => {
    setScore(0);
    setAnswers([]);
    if (questionsLoaded) {
      setScreen('quiz');
    } else {
      setScreen('loading');
    }
  };

  // Transition from loading when ready
  useEffect(() => {
    if (questionsLoaded && screen === 'loading') {
      setScreen('quiz');
    }
  }, [questionsLoaded, screen]);

  // Quiz end
  const handleQuizEnd = (finalScore, userAnswers) => {
    setScore(finalScore);
    setAnswers(userAnswers);
    if (finalScore === questions.length) setShowWinnerVideo(true);
    setScreen('result');
  };

  // Return to home
  const handleHome = () => {
    setScore(0);
    setAnswers([]);
    setShowWinnerVideo(false);
    setScreen('start');
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white">
      <video
        className="fixed inset-0 w-screen h-screen object-cover -z-10"
        autoPlay
        loop
        muted
        playsInline
        poster={backgroundPoster}
        preload="metadata"
      >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {showWinnerVideo && (
        <video
          className="fixed inset-0 w-screen h-screen object-cover -z-9 mix-blend-screen"
          muted
          autoPlay
          playsInline
          onEnded={() => setShowWinnerVideo(false)}
        >
          <source src={winnerVideo} type="video/mp4" />
        </video>
      )}

      {screen === 'start' && <StartScreen onStart={handleStart} />}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'error' && <ErrorScreen onRetry={handleStart} />}
      {screen === 'quiz' && <QuizScreen questions={questions} onQuizEnd={handleQuizEnd} />}
      {screen === 'result' && <ResultScreen score={score} total={questions.length} onHome={handleHome} onReview={() => setScreen('review')} />}
      {screen === 'review' && <QuizReviewScreen questions={questions} userAnswers={answers} onReturnToResults={() => setScreen('result')} />}
    </div>
  );
}

export default App;
