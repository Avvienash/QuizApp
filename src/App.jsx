import {useState, useEffect} from "react";
import StartScreen from './components/StartScreen';
import ErrorScreen from './components/ErrorScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import LoadingScreen from './components/LoadingScreen';
import QuizReviewScreen from './components/QuizReviewScreen';
import backgroundVideo from './assets/bg.mp4';
import winnerVideo from './assets/winner.mp4';
import { loadFromCache, saveToCache, clearCache} from './utils/cache';

// Global Variables
const debug = false; // Set to true to use sample data instead of API
const n = 10; // Number of questions
const rssUrl = "https://feeds.bbci.co.uk/news/rss.xml?edition=int" // "https://www.thestar.com.my/rss/News/"; // RSS feed URL

function App() {
  // State management
  const [questions, setQuestions] = useState([]);
  const [screen, setScreen] = useState('start'); // start, quiz, loading, result
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [showWinnerVideo, setShowWinnerVideo] = useState(false);

  // Generate quiz function
  const generateQuiz = async () => {
    try {
      // Generate the quiz data
      const fetchUrl = `https://quizappbackend-wdy4.onrender.com/quiz?n=${n}&url=${rssUrl}&debug=${debug}`
      console.log("Fetching quiz from:", fetchUrl);
      const res = await fetch(fetchUrl);
      const quizData = await res.json();
      console.log("Response received as: ", quizData);
      
      // Set questions and mark as loaded
      setQuestions(quizData.questions);
      setQuestionsLoaded(true);
      
      // Save to cache
      saveToCache(quizData.questions);
    } catch (err) {
      // Handle any errors that occur during quiz generation
      console.error('Error generating quiz:', err);
      setScreen('error');
    }
  };

  // Load quiz function
  const loadQuiz = () => {
    const cachedQuestions = loadFromCache();
    if (cachedQuestions) {
      setQuestions(cachedQuestions);
      setQuestionsLoaded(true);
    } else {
      generateQuiz();
    }
  }

  // Load questions on app mount
  useEffect(() => {loadQuiz()}, []);

  // Handle Start
  const handleStart = () => {
    setScore(0);
    setAnswers([]);
    if (questionsLoaded) {
      setScreen('quiz'); // Questions are ready, go straight to quiz
    } else {
      setScreen('loading'); // Questions not ready yet, show loading screen
    }
  };

  // Handle when questions finish loading during loading screen
  useEffect(() => {
    if (questionsLoaded && screen === 'loading') {
      setScreen('quiz');
    }
  }, [questionsLoaded, screen]);

  // Handle Quiz End
  const handleQuizEnd = (finalScore, userAnswers) => {
    setScore(finalScore);
    setAnswers(userAnswers);
    setScreen('result');
    if (finalScore === questions.length) setShowWinnerVideo(true);
  };

  // Handle Try Again
  const handleTryAgain = () => {
    setScore(0);
    setAnswers([]);
    setScreen('quiz');
  };

  // Render different screens based on the current state
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white bg-transparent">
      <video
        className="fixed inset-0 w-screen h-screen object-cover -z-10"
        autoPlay
        loop
        muted
        playsInline
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
      {screen === 'loading' && <LoadingScreen /> }
      {screen === 'error' && <ErrorScreen onRetry={handleStart} />}
      {screen === 'quiz' && <QuizScreen questions={questions} onQuizEnd={handleQuizEnd} />}
      {screen === 'result' && <ResultScreen score={score} total={questions.length} onTryAgain={handleTryAgain} onReview={() => setScreen('review')} /> }
      {screen === 'review' && <QuizReviewScreen questions={questions} userAnswers={answers} onReturnToResults={() => setScreen('result')} /> }


    </div>
  );
}

export default App;
