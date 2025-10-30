import {useState, useEffect} from "react";
import StartScreen from './components/StartScreen/StartScreen';
import ErrorScreen from './components/ErrorScreen/ErrorScreen';
import QuizScreen from './components/QuizScreen/QuizScreen';
import ResultScreen from './components/ResultsScreen/ResultScreen';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import QuizReviewScreen from './components/QuizReviewScreen/QuizReviewScreen';
import AuthScreen from "./components/AuthScreen/AuthScreen";
import UpdateProfileScreen from './components/UpdateProfileScreen/UpdateProfileScreen';
import backgroundVideo from './assets/bg.mp4';
import backgroundPoster from './assets/bg.jpg';
import winnerVideo from './assets/winner.mp4';
import { loadFromCache, saveToCache } from './utils/cache';
import { supabase, createUser, checkUserExists, getUserData} from './utils/supabaseClient';

const disable_cache = false;

function App() {
  // State management
  const [questions, setQuestions] = useState([]);
  const [screen, setScreen] = useState('start'); // 'start' | 'quiz' | 'result' | 'login' | 'updateProfile'
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [showWinnerVideo, setShowWinnerVideo] = useState(false);
  const [category, setCategory] = useState('world');
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('login'); 
  const [userName, setUserName] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      setSession(session);

      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('resetPassword');
        setScreen('login');
      }

      if (event === 'SIGNED_IN' && session) {

        const uid = session.user.id;

        checkUserExists(uid).then(async ({ exists, error }) => {
          if (error) {
            console.error('Error checking user existence:', error);
            return;
          }

          if (!exists) {
            const name = session.user.user_metadata?.name || session.user.email || '';
            const { error: createError } = await createUser(uid, name);
            if (createError) {
              console.error('Error creating user:', createError);
            } else {
              setUserName(name);
              console.log('User created successfully with name:', name);
            }
          }

          setAuthMode('login');
          setScreen('start');
        });
      }
      else if (session) {
        const uid = session.user.id;
        getUserData(uid, 'name').then(({ data, error }) => {
          if (error) {
            console.error('Error fetching user data:', error);
            return;
          }
          setUserName(data.name || '');
        });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Helper: freshness check (24h)
  const isFresh = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    if (!dateString || dateString !== today) return false;
    return true;
  };

  // Fetch existing daily quiz
  const fetchQuiz = async (categoryToFetch = category) => {
    try {
      const res = await fetch("/.netlify/functions/generateQuiz?category=" + categoryToFetch);
      if (!res.ok) throw new Error("Failed to fetch quiz");
      const quizData = await res.json();
      setQuestions(quizData.questions || []);
      setQuestionsLoaded(true);
      saveToCache(categoryToFetch, quizData);
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setScreen('error');
    }
  };

  // Load quiz (cached if <24h, else fetch)
  const loadQuiz = (categoryToLoad = category) => {
    if (disable_cache) {
      fetchQuiz(categoryToLoad);
      return;
    }

    const cached = loadFromCache(categoryToLoad);
    if (cached && isFresh(cached.date) && Array.isArray(cached.questions) && cached.questions.length) {
      setQuestions(cached.questions);
      setQuestionsLoaded(true);
    } else {
      fetchQuiz(categoryToLoad);
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

  // Handle login
  const handleLogin = () => {
    setAuthMode('login');
    setScreen('login');
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setAuthMode('login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

 
  // change category
  const changeCategory = (newCategory) => {
    console.log("Changing category to:", newCategory);
    if (newCategory !== category) {
      setCategory(newCategory);
      setQuestions([]);
      setQuestionsLoaded(false);
      loadQuiz(newCategory);
    }
  };

  const handleLoginSuccess = () => { setScreen('start'); };
  const handleUpdateProfile = () => {setScreen('updateProfile');};
  const handleBackToHome = () => {setScreen('start');};

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
      
      {screen === 'error' && <ErrorScreen onRetry={handleStart} />}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'login' && <AuthScreen authMode={authMode} onChangeMode={setAuthMode} onLoginSuccess={handleLoginSuccess} onHome={handleHome}/>}
      {screen === 'quiz' && <QuizScreen questions={questions} onQuizEnd={handleQuizEnd} />}
      {screen === 'result' && <ResultScreen score={score} total={questions.length} onHome={handleHome} onReview={() => setScreen('review')} />}
      {screen === 'review' && <QuizReviewScreen questions={questions} userAnswers={answers} onReturnToResults={() => setScreen('result')} />}
      {screen === 'start' && <StartScreen onStart={handleStart} onCategoryChange={changeCategory} selectedCategory={category}isLoggedIn={!!session}onLogIn={handleLogin}onLogOut={handleLogout}onUpdateProfile={handleUpdateProfile} userName={userName} />}
      {screen === 'updateProfile' && <UpdateProfileScreen onBack={handleBackToHome} session={session} userName={userName} setUserName={setUserName} />}
    </div>
  );
}

export default App;