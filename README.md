# NewsFlash Quiz 📰⚡

NewsFlash Quiz is a Progressive Web App that turns BBC headlines into timed trivia. The React client consumes Netlify Functions that assemble daily quizzes with OpenAI assistance and caches them to keep gameplay fast—even offline.

---

## Table of Contents

1. [Feature Highlights](#feature-highlights)
2. [System Architecture](#system-architecture)
   - [Frontend Screens & State](#frontend-screens--state)
   - [Quiz Lifecycle](#quiz-lifecycle)
   - [Serverless Pipeline](#serverless-pipeline)
3. [Key Modules](#key-modules)
4. [Data Contracts](#data-contracts)
5. [PWA & Assets](#pwa--assets)
6. [Local Development](#local-development)
7. [Testing & Quality Gates](#testing--quality-gates)
8. [Deployment Workflows](#deployment-workflows)
9. [Environment Variables](#environment-variables)
10. [Project Structure](#project-structure)
11. [Troubleshooting & Tips](#troubleshooting--tips)
12. [Roadmap Ideas](#roadmap-ideas)

---

## Feature Highlights

- ⚡ **Daily AI-Generated Quizzes** powered by OpenAI GPT-4o.
- 🌍 **Regional Categories** selectable via a glass-morphism dropdown.
- ⏱️ **Timed Gameplay** with per-question countdown and instant feedback.
- 🧠 **Post-Quiz Review** summarizing answers and linking to source articles.
- 📦 **Smart Caching** with offline fallback via [`utils/cache.loadFromCache`](src/utils/cache.js) and [`utils/cache.saveToCache`](src/utils/cache.js).
- 📱 **Installable PWA** with manifest, service worker, and tailored screenshots.
- 🎬 **Immersive UX** featuring looping video backgrounds and celebratory overlays.
- ☁️ **Netlify Functions** orchestrating RSS ingestion, AI question generation, and blob storage persistence.

---

## System Architecture

### Frontend Screens & State

The root UI lives in [`src/App.jsx`](src/App.jsx) and manages a mini state machine with the following transitions:

| Screen | Trigger | Description |
| --- | --- | --- |
| `start` | initial load / `Home` | Renders [`components.StartScreen`](src/components/StartScreen.jsx) with category selector. |
| `loading` | `Start Quiz` while data pending | Shows [`components.LoadingScreen`](src/components/LoadingScreen.jsx) and waits for question fetch/cache. |
| `quiz` | Questions ready | Runs [`components.QuizScreen`](src/components/QuizScreen.jsx) with timers and choice feedback. |
| `result` | Quiz completion | Displays [`components.ResultScreen`](src/components/ResultScreen.jsx) summary and actions. |
| `review` | `Review Answers` | Uses [`components.QuizReviewScreen`](src/components/QuizReviewScreen.jsx) for detailed navigation. |
| `error` | Fetch failure | Presents [`components.ErrorScreen`](src/components/ErrorScreen.jsx) retry prompt. |

State slices:
- `questions`, `questionsLoaded` track quiz availability.
- `score`, `answers` store engagement results.
- `category` syncs with [`components.DropdownMenu`](src/components/DropdownMenu.jsx).
- `showWinnerVideo` toggles celebratory overlay.

### Quiz Lifecycle

1. App boot invokes `loadQuiz` from [`src/App.jsx`](src/App.jsx) which prefers cache before network.
2. Cached payloads are read with [`utils/cache.loadFromCache`](src/utils/cache.js) and validated via [`utils/cache.isCacheValid`](src/utils/cache.js); fallback fetch occurs if stale or offline requirements fail the freshness check.
3. Fetch path hits [`.netlify/functions/generateQuiz`](netlify/functions/generateQuiz.js), returning structured quiz JSON.
4. Gameplay loops through [`components.QuizScreen`](src/components/QuizScreen.jsx) with:
   - Countdown (60 s) and warning threshold.
   - Immediate score updates.
   - Auto-progression on answer or timeout.
5. Completion persists score and answers, transitions to results screen, and optionally plays celebratory video.
6. Review screen lets users page through questions, compare outcomes, and revisit articles.

### Serverless Pipeline

1. [`functions/generateQuiz`](netlify/functions/generateQuiz.js) receives `category` query param.
2. Validated categories map to BBC feeds defined in [`functions/config/bbcFeeds`](netlify/functions/config/bbcFeeds.js).
3. Existing quizzes are retrieved via [`functions/services/storageService.getExistingQuiz`](netlify/functions/services/storageService.js). Fresh quizzes (matching today's date from [`functions/utils/helpers.getTodayDate`](netlify/functions/utils/helpers.js)) are returned immediately.
4. New quizzes call [`functions/services/quizGenerator.generateQuizJSON`](netlify/functions/services/quizGenerator.js):
   - Pull RSS items with [`functions/services/rssService.fetchRSS`](netlify/functions/services/rssService.js).
   - Iterate articles through OpenAI Chat Completions (`gpt-4o-mini`) inside `generateQuestionForArticle`.
   - Shuffle answers, label A–D, and build the quiz object.
5. Generated quizzes save to Netlify Blobs using [`functions/services/storageService.saveQuiz`](netlify/functions/services/storageService.js).
6. Admin maintenance uses [`functions/clearQuiz`](netlify/functions/clearQuiz.js) to wipe stored blobs.

---

## Key Modules

| Module | Responsibility |
| --- | --- |
| [`src/App.jsx`](src/App.jsx) | Root component orchestrating screens, fetching, caching, and quiz flow. |
| [`src/components/StartScreen.jsx`](src/components/StartScreen.jsx) | Intro UX with category selection using [`components.DropdownMenu`](src/components/DropdownMenu.jsx). |
| [`src/components/QuizScreen.jsx`](src/components/QuizScreen.jsx) | Handles timers, option feedback classes, and progression logic. |
| [`src/components/QuizReviewScreen.jsx`](src/components/QuizReviewScreen.jsx) | Supports keyboard navigation, answer validation classes, and source links. |
| [`src/utils/cache.js`](src/utils/cache.js) | Provides `isCacheValid`, `loadFromCache`, `saveToCache`, `clearCache`, `hasCachedQuestions`. |
| [`netlify/functions/generateQuiz.js`](netlify/functions/generateQuiz.js) | HTTP entry point coordinating quiz provisioning. |
| [`netlify/functions/services/quizGenerator.js`](netlify/functions/services/quizGenerator.js) | AI prompt construction, response parsing, and quiz normalization. |
| [`netlify/functions/services/rssService.js`](netlify/functions/services/rssService.js) | RSS parsing via `fast-xml-parser`. |
| [`netlify/functions/clearQuiz.js`](netlify/functions/clearQuiz.js) | Administrative endpoint to purge all quiz blobs. |
| [`vite.config.js`](vite.config.js) | Vite setup with React, Tailwind CSS v4, and PWA plugin. |

---

## Data Contracts

### Quiz Payload

```jsonc
{
  "date": "2024-12-31",
  "category": "world",
  "questions": [
    {
      "Question": "What event...",
      "Option A": "...",
      "Option B": "...",
      "Option C": "...",
      "Option D": "...",
      "Answer": "B",
      "Source": "https://..."
    }
  ]
}
```

- `Answer` is always one of `A`, `B`, `C`, `D`.
- `Source` links directly to the BBC article driving the question.

### Local Cache Format

Stored under `localStorage["quiz-{category}"]`:

```jsonc
{
  "questions": { /* same shape as API response */ },
  "timestamp": 1736203439123
}
```

Cache validity is one hour; however, [`src/App.jsx`](src/App.jsx) also checks `questions.date` for daily freshness.

---

## PWA & Assets

- Manifest configured in [`vite.config.js`](vite.config.js) via `VitePWA` plugin with auto-update registration.
- PWA includes app icons (`public/web-app-manifest-*.png`) and store-quality screenshots (`public/Screenshot_*.png`).
- Android Trusted Web Activity (TWA) support declared through [`.well-known/assetlinks.json`](public/.well-known/assetlinks.json).
- Service worker generated automatically on build; app supports installation prompts and offline caching of static assets.

---

## Local Development

```bash
npm install
npm run dev
```

- Default dev server: `http://localhost:5173`.
- Vite hot module reload ensures instant component updates.
- Tailwind v4 JIT is enabled via [`src/index.css`](src/index.css) `@import "tailwindcss";`.

### Required Tooling

- Node.js ≥ 18 (Netlify Functions require native `fetch` support).
- Netlify CLI (optional) for local function emulation.
- Access to an OpenAI API key to enable quiz generation.

---

## Testing & Quality Gates

- **Linting:** `npm run lint` leverages ESLint config in [`eslint.config.js`](eslint.config.js) with React Hooks and React Refresh plugins.
- **Type Safety:** Project currently relies on runtime checks; consider adding TypeScript or static analysis for question objects.
- **Unit Tests:** Not yet implemented—opportunity to cover timer logic and cache boundary conditions.

---

## Deployment Workflows

### Netlify

1. Set environment variables (`OPENAI_API_KEY`, etc.) in Netlify dashboard.
2. Deploy the Vite site and Netlify Functions together (`netlify/functions/...`).
3. Blobs storage persists in `getStore("quiz")` namespace.

### GitHub Pages

- Build step: `npm run build`.
- Publish: `npm run deploy`, configured via [`package.json`](package.json) to push `dist` to `gh-pages` branch.

### PWA Verification

- After deployment, validate via Chrome Lighthouse and ensure `/.well-known/assetlinks.json` is accessible for Android installs.

---

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | ✅ | Authenticates OpenAI client for question generation. |
| `VITE_SUPABASE_URL` | ➖ | Placeholder for future analytics/integration. |
| `VITE_SUPABASE_ANON_KEY` | ➖ | Placeholder for future analytics/integration. |

Load `.env` locally; production secrets managed through Netlify or GitHub Actions.

---

## Project Structure

```
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── components/
│   │   ├── StartScreen.jsx
│   │   ├── QuizScreen.jsx
│   │   ├── ResultScreen.jsx
│   │   ├── QuizReviewScreen.jsx
│   │   ├── LoadingScreen.jsx
│   │   ├── ErrorScreen.jsx
│   │   └── styles/
│   └── utils/
│       ├── cache.js
│       └── categories.js
├── netlify/
│   └── functions/
│       ├── generateQuiz.js
│       ├── clearQuiz.js
│       └── services/
└── public/
    ├── _redirects
    └── .well-known/
```

Refer to the repository tree above for file locations linked throughout this document.

---

## Troubleshooting & Tips

- **Cache vs Fresh Data:** When debugging quiz updates, call [`utils/cache.clearCache`](src/utils/cache.js) or toggle the `disable_cache` flag in [`src/App.jsx`](src/App.jsx).
- **Offline Experience:** Ensure service workers are refreshed between deployments; in Chrome DevTools, tick "Update on reload".
- **OpenAI Quotas:** Handle API rate limits gracefully—`generateQuizJSON` already retries per article; consider exponential backoff if quotas tighten.
- **RSS Changes:** If BBC feed schemas shift, adjust [`functions/services/rssService.fetchRSS`](netlify/functions/services/rssService.js) parsing.

---

## Roadmap Ideas

- Add unit tests for timer and cache flows.
- Persist user scores historically (requires backend storage).
- Internationalize copy and category labels sourced from [`src/utils/categories`](src/utils/categories.js).
- Introduce difficulty settings (alter timer, question selection).
- Surface daily streaks and shareable results with dynamic Open Graph images.

---

