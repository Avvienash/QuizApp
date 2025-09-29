# NewsFlash Quiz 📰⚡

Transform current news headlines into an engaging quiz experience! NewsFlash Quiz is a Progressive Web App that generates multiple-choice questions from the latest BBC international news and challenges users with timed questions. Built with React + Vite + Tailwind CSS and deployed as a PWA on Netlify.

---

### ✨ Key Features
* **Dynamic Question Generation**: Real-time quiz creation from BBC International RSS feeds using OpenAI GPT-4
* **Offline-First Caching**: 30-minute intelligent cache with offline fallback support
* **Timed Challenges**: 60-second per-question timer with visual warnings and timeout handling
* **Progressive Web App**: Full PWA support with app manifest, service worker, and offline capabilities
* **Immersive UI**: Glass-morphism design with background video and winner celebration effects
* **Question Review**: Post-quiz review mode to explore answers and source articles
* **Responsive Design**: Mobile-optimized with touch-friendly interactions
* **Netlify Functions**: Serverless backend for quiz generation

---

### 🧰 Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 19 + React DOM |
| Build Tool | Vite 7 with PWA plugin |
| Styling | Tailwind CSS v4 + Custom CSS |
| Backend | Netlify Functions (Serverless) |
| AI Integration | OpenAI GPT-4o-mini |
| Data Source | BBC International RSS Feed |
| Caching | Browser localStorage with intelligent expiry |
| Deployment | Netlify with automatic deployments |
| PWA | Vite PWA plugin with auto-update |

---

### 📂 Project Structure
```
NewsFlash-Quiz/
├── index.html                    # PWA entry point with app metadata
├── vite.config.js               # Vite + Tailwind + PWA configuration
├── package.json                 # Dependencies and build scripts
├── netlify/
│   └── functions/
│       └── generateQuiz.js      # Serverless quiz generation function
├── src/
│   ├── main.jsx                 # React root with StrictMode
│   ├── App.jsx                  # Main app state management
│   ├── index.css                # Tailwind imports + global styles
│   ├── assets/
│   │   ├── bg.mp4              # Background loop video
│   │   └── winner.mp4          # Perfect score celebration
│   ├── components/
│   │   ├── StartScreen.jsx      # Welcome screen
│   │   ├── LoadingScreen.jsx    # Dynamic loading with taglines
│   │   ├── QuizScreen.jsx       # Main quiz interface
│   │   ├── ResultScreen.jsx     # Score summary
│   │   ├── QuizReviewScreen.jsx # Answer review with navigation
│   │   ├── ErrorScreen.jsx      # Error handling
│   │   └── Components.css       # Component-specific styling
│   └── utils/
│       └── cache.js            # Intelligent caching system
└── public/                     # PWA assets and static files
    ├── _redirects             # Netlify SPA routing
    ├── web-app-manifest-*.png # PWA icons
    ├── Screenshot_*.png       # App store screenshots
    └── .well-known/
        └── assetlinks.json    # Android TWA verification
```

---

### 🔄 Application Flow
1. **App Launch**: Loads cached questions or shows loading screen
2. **Question Generation**: Netlify function fetches BBC RSS → OpenAI processes → Returns structured quiz
3. **Intelligent Caching**: 30-minute cache with offline fallback support
4. **Quiz Experience**: 10 questions, 60s each, with immediate feedback
5. **Results & Review**: Score display with detailed answer review option
6. **Offline Support**: Cached questions available when network unavailable

---

### ⚙️ Serverless Backend (Netlify Functions)

The quiz generation happens server-side via [`netlify/functions/generateQuiz.js`](netlify/functions/generateQuiz.js):

**Process Flow:**
1. Fetches BBC International RSS feed
2. Processes articles through OpenAI GPT-4o-mini
3. Generates standalone, engaging questions with 4 options each
4. Returns structured JSON with questions, answers, and source links

**API Contract:**
```javascript
// GET /.netlify/functions/generateQuiz
{
  "date": "2024-01-15T10:30:00.000Z",
  "questions": [
    {
      "Question": "Which country announced new climate targets for 2030?",
      "Option A": "United Kingdom",
      "Option B": "Germany", 
      "Option C": "France",
      "Option D": "Italy",
      "Answer": "A",
      "Source": "https://bbc.co.uk/news/..."
    }
    // ... 9 more questions
  ]
}
```

---

### 💾 Intelligent Caching System

[`src/utils/cache.js`](src/utils/cache.js) implements smart caching:

- **30-minute cache duration** for fresh content
- **Offline fallback** when network unavailable
- **Automatic cache invalidation** when expired and online
- **Error handling** with cache cleanup on corruption

```javascript
// Cache functions
loadFromCache()     // Load with validity check
saveToCache(data)   // Save with timestamp
isCacheValid(ts)    // Check if within 30min
hasCachedQuestions() // Quick validity check
clearCache()        // Manual cache reset
```

