const CACHE_KEY = 'quiz_questions';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Check if cached data is still valid
export const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Load questions from cache
export const loadFromCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { questions: cachedQuestions, timestamp } = JSON.parse(cached);
      
      // Load from cache if it's valid OR if there's no internet connection
      if (isCacheValid(timestamp)) {
        console.log("Loading questions from cache (within time frame)");
        return cachedQuestions;
      } else if (!navigator.onLine) {
        console.log("Loading questions from cache (no internet connection)");
        return cachedQuestions;
      } else {
        console.log("Cache expired and internet available, removing old data");
        localStorage.removeItem(CACHE_KEY);
      }
    }
  } catch (err) {
    console.error('Error loading from cache:', err);
    localStorage.removeItem(CACHE_KEY);
  }
  return null;
};

// Save questions to cache
export const saveToCache = (questionsData) => {
  try {
    const cacheData = {
      questions: questionsData,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log("Questions saved to cache");
  } catch (err) {
    console.error('Error saving to cache:', err);
  }
};

// Clear cache function (optional - for debugging/manual refresh)
export const clearCache = () => {
  localStorage.removeItem(CACHE_KEY);
  console.log("Cache cleared");
};

// Check if cache exists and is valid
export const hasCachedQuestions = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp } = JSON.parse(cached);
      return isCacheValid(timestamp);
    }
  } catch (err) {
    console.error('Error checking cache:', err);
  }
  return false;
};