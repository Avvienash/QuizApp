// Check if cached data is still valid
export const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < 60 * 60 * 1000; // 1 hour
};

// Load questions from cache
export const loadFromCache = (key) => {
  try {
    console.log("category:", key);
    const cached = localStorage.getItem(`quiz-${key}`);
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
        localStorage.removeItem(`quiz-${key}`);
      }
    }
  } catch (err) {
    console.error('Error loading from cache:', err);
    localStorage.removeItem(`quiz-${key}`);
  }
  return null;
};

// Save questions to cache
export const saveToCache = (key,questionsData) => {
  try {
    const cacheData = {
      questions: questionsData,
      timestamp: Date.now()
    };
    localStorage.setItem(`quiz-${key}`, JSON.stringify(cacheData));
    console.log("Questions saved to cache");
  } catch (err) {
    console.error('Error saving to cache:', err);
  }
};

// Clear cache function (optional - for debugging/manual refresh)
export const clearCache = (key) => {
  localStorage.removeItem(`quiz-${key}`);
  console.log("Cache cleared for key:", key);
};

// Check if cache exists and is valid
export const hasCachedQuestions = (key) => {
  try {
    const cached = localStorage.getItem(`quiz-${key}`);
    if (cached) {
      const { timestamp } = JSON.parse(cached);
      return isCacheValid(timestamp);
    }
  } catch (err) {
    console.error('Error checking cache:', err);
  }
  return false;
};