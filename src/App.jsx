import {useState} from "react";
import StartScreen from './components/StartScreen';
import ErrorScreen from './components/ErrorScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import LoadingScreen from './components/LoadingScreen';
import backgroundVideo from './assets/bg.mp4';

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

  // Generate quiz function
  const generateQuiz = async () => {
    try {
      // Generate the quiz data
      const fetchUrl = `https://quizappbackend-wdy4.onrender.com/quiz?n=${n}&url=${rssUrl}&debug=${debug}`
      console.log("Fetching quiz from:", fetchUrl);
      const res = await fetch(fetchUrl);
      const quizData = await res.json();
      console.log("Response received as: ", quizData);
      // Set questions and navigate to quiz screen
      setQuestions(quizData.questions);
      setScreen('quiz');
    } catch (err) {
      // Handle any errors that occur during quiz generation
      console.error('Error generating quiz:', err);
      setScreen('error');
    }
  };

  // Handle Start
  const handleStart = () => {
    setScreen('loading');
    setScore(0);
    setAnswers([]);
    generateQuiz();
  };

  // Handle Quiz End
  const handleQuizEnd = (finalScore, userAnswers) => {
    setScore(finalScore);
    setAnswers(userAnswers);
    setScreen('result');
  };

  // Handle Try Again
  const handleTryAgain = () => {
    setScreen('loading');
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
      {screen === 'start' && <StartScreen onStart={handleStart} />}
      {screen === 'loading' && <LoadingScreen /> }
      {screen === 'error' && <ErrorScreen onRetry={handleStart} />}
      {screen === 'quiz' && <QuizScreen questions={questions} onQuizEnd={handleQuizEnd} />}
      {screen === 'result' && <ResultScreen score={score} total={questions.length} onTryAgain={handleTryAgain} /> }
    </div>
  );
}

export default App;
