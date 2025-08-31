
## The Star Malaysia Latest News Quiz

An interactive quiz web app that generates multiple‑choice questions from the latest Malaysian news articles (RSS feed) and challenges users against a per‑question countdown timer. Built with React + Vite + Tailwind CSS (v4) and deployed to GitHub Pages.

---

### ✨ Key Features
* Dynamic question generation from an external backend API (RSS → quiz transformation)
* 10 timed questions (20s each by default) with visual low‑time warning
* Immediate feedback highlighting correct / incorrect answers
* Automatic progression (including timeout handling)
* Animated glass‑morphism UI with looping background video
* Result summary with score + encouragement message
* Lightweight, fast dev environment via Vite
* GitHub Pages one‑command deployment

---

### 🧰 Tech Stack
| Layer | Tools |
|-------|-------|
| Framework | React 19 + React DOM |
| Bundler / Dev Server | Vite 7 |
| Styling | Tailwind CSS v4 + custom CSS (glass effect) |
| Deployment | GitHub Pages (`gh-pages` npm package) |
| Linting | ESLint 9 (React hooks + refresh plugins) |
| Data Source | Backend quiz endpoint wrapping The Star Malaysia RSS feed |

---

### 📂 Project Structure
```
my-quiz-app/
	index.html              # Vite entry HTML
	vite.config.js          # Vite + Tailwind + base path for GH Pages
	package.json            # Scripts & dependencies
	src/
		main.jsx              # React root render
		App.jsx               # Screen state controller
		index.css             # Tailwind import + base styles
		assets/bg.mp4         # Background looping video
		components/
			StartScreen.jsx
			LoadingScreen.jsx
			QuizScreen.jsx
			ResultScreen.jsx
			ErrorScreen.jsx
			Components.css      # Glass + quiz styling
	public/                 # Static assets copied as‑is (logo, etc.)
```

---

### 🔄 Application Flow
1. Start Screen → user clicks Start
2. `generateQuiz()` fetches questions from backend
3. Loading Screen shown while awaiting response
4. Quiz Screen cycles through N questions (default 10)
	 * 20s timer per question
	 * Auto‑advance on answer or timeout
5. Result Screen shows final score & try again option
6. Retry resets state and regenerates quiz

---

### ⏱ Quiz Logic Highlights
* `QuizScreen` keeps local state: current index, selected option, feedback mode, per‑question timer, score, userAnswers.
* Timer pauses during feedback to avoid overlap.
* Timeout recorded as `null` answer and advances after a short delay.
* Styling classes (`correct`, `incorrect`, `selected`) applied deterministically after user selection or timeout.

---

### 🌐 Data / Backend Contract
The frontend calls (example):
```
https://quizappbackend-wdy4.onrender.com/quiz?n=10&url=https://www.thestar.com.my/rss/News/&debug=false
```
Expected JSON shape (simplified):
```json
{
	"questions": [
		{
			"Question": "...",
			"Option A": "...",
			"Option B": "...",
			"Option C": "...",
			"Option D": "...",
			"Answer": "A"  // Letter matching the correct option
		}
	]
}
```
If the request fails or JSON is malformed, the app switches to the Error screen.

---

### 🚀 Getting Started (Local Development)
Prerequisites: Node.js 18+ (recommended), npm.

1. Install dependencies:
```
npm install
```
2. Run the dev server:
```
npm run dev
```
3. Open the printed local URL (usually `http://localhost:5173`).

Hot reload is enabled by Vite.

---

### 🧪 Linting
Run ESLint:
```
npm run lint
```
Fix issues manually (no auto‑fix script currently defined).

---

### 🛠 Configuration Points
Location: `src/App.jsx` (top constants)
* `debug` (boolean) – when supported by backend, may trigger sample/static data
* `n` (int) – number of quiz questions to request
* `rssUrl` – source RSS feed URL

To make these runtime configurable (future enhancement), consider environment variables + a settings screen.

---

### 🎨 Styling & UI
* Tailwind v4 imported via `@import "tailwindcss";` in `index.css`.
* Component‑scoped enhancements live in `Components.css` (glass effect, buttons, timer states, loader spinner, answer state classes).
* Background video (`bg.mp4`) rendered once in `App.jsx` behind all screens using absolute positioning and layering (`-z-10`).

---

### 📦 Build
Generate a production build:
```
npm run build
```
Outputs to `dist/` (Vite default). The `base` path `/QuizApp/` is set in `vite.config.js` for GitHub Pages.

Preview the production build locally:
```
npm run preview
```

---

### 🌍 Deployment (GitHub Pages)
Configured scripts:
* `predeploy` → runs `npm run build`
* `deploy` → publishes via `gh-pages` to branch `gh-pages`

Steps:
```
npm run deploy
```
Ensure the repository has Pages configured to serve from the `gh-pages` branch (root).

If you fork the repo:
1. Update `homepage` in `package.json` to your GitHub username & repo.
2. Adjust `base` in `vite.config.js` if repository name changes.

---

### 🔐 Environment / Secrets
Currently no client‑side secrets. If future APIs require keys, use server‑side proxying or build‑time environment variables (never hardcode secrets in the frontend).

---

### 🧩 Potential Improvements
* Show progress bar or overall timer
* Add categories / difficulty selection
* Persist high scores (localStorage) and history
* Accessibility: focus outlines, ARIA live region for feedback
* Mobile layout tuning (responsive width < 600px)
* Fetch cancellation & retry logic
* Skeleton loading vs current spinner
* Internationalization (i18n)
* Question review screen after completion
* Adaptive timing (extend if user is reading long question)
* Offline fallback / PWA support

---

### 🧪 Suggested Test Cases (Not Yet Implemented)
Although no automated tests are included, consider adding:
1. Successful quiz fetch populates N questions
2. Timer reaches zero → records null answer and advances
3. Correct answer increments score
4. Quiz end calls `onQuizEnd` with full answer list length N
5. Error path renders Error screen when fetch rejects

---

### ❗ Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Blank screen on GitHub Pages | Wrong `base` path | Ensure `base: '/QuizApp/'` matches repo name |
| 404 on refresh | SPA + static hosting | Enable Pages 404 fallback (add `404.html` copying `index.html`) |
| CORS / network error | Backend down / blocked | Check console, verify backend URL, implement retry |
| Styles missing | Tailwind build misconfigured | Reinstall deps, ensure `@tailwindcss/vite` plugin active |

---

### 📄 License
Add a license (e.g., MIT) if you intend public reuse. (Currently unspecified.)

---

### 🙌 Acknowledgements
* The Star Malaysia RSS feed for content basis
* Vite & Tailwind teams for fast DX

---

### 🤝 Contributing
1. Fork / branch off `main`
2. Make changes with clear commit messages
3. Run build & lint
4. Open PR describing changes + screenshots if UI related

---

### 📬 Contact
Open an issue in the repository for bugs, ideas, or questions.

---

Happy quizzing!

