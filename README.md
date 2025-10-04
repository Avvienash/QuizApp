# NewsFlash Quiz 📰⚡

A Progressive Web App that transforms BBC news headlines into engaging timed quizzes. Built with React + Vite + Tailwind CSS and deployed on Netlify.

## Features

- **Daily Quiz Generation**: Automated quiz creation from BBC RSS feeds using OpenAI GPT-4
- **Smart Caching**: 1-hour cache with offline fallback support via [`src/utils/cache.js`](src/utils/cache.js)
- **Timed Questions**: 60-second timer per question with visual feedback
- **PWA Support**: Full offline functionality with service worker and app manifest
- **Responsive Design**: Mobile-optimized glass-morphism UI with background video
- **Answer Review**: Post-quiz review with source article links

## Tech Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS v4
- **Backend**: Netlify Functions (Serverless)
- **AI**: OpenAI GPT-4o for question generation
- **Data**: BBC International RSS Feed
- **Caching**: localStorage with intelligent expiry
- **PWA**: Vite PWA plugin with auto-update

## Architecture

### Components
- [`StartScreen`](src/components/StartScreen.jsx) - Welcome screen
- [`QuizScreen`](src/components/QuizScreen.jsx) - Main quiz interface with timer
- [`ResultScreen`](src/components/ResultScreen.jsx) - Score display
- [`QuizReviewScreen`](src/components/QuizReviewScreen.jsx) - Answer review with navigation
- [`LoadingScreen`](src/components/LoadingScreen.jsx) - Dynamic loading states
- [`ErrorScreen`](src/components/ErrorScreen.jsx) - Error handling

### Backend Functions
- [`generateQuiz.js`](netlify/functions/generateQuiz.js) - Fetches RSS, generates questions via OpenAI
- [`clearQuiz.js`](netlify/functions/clearQuiz.js) - Admin function to clear stored quiz

### Caching System
[`src/utils/cache.js`](src/utils/cache.js) implements intelligent caching:
- 1-hour cache duration for fresh content
- Offline fallback when network unavailable
- Automatic cache invalidation when expired

## Quiz Generation Flow

1. **Daily Check**: Function checks if today's quiz exists in Netlify Blobs storage
2. **RSS Fetch**: Retrieves latest BBC International news articles
3. **AI Processing**: OpenAI generates standalone quiz questions with 4 options each
4. **Storage**: Quiz saved to Netlify Blobs with date timestamp
5. **Delivery**: Structured JSON returned to frontend with caching headers

## API Response Format

```json
{
  "date": "2024-01-15",
  "questions": [
    {
      "Question": "What prompted the temporary suspension of flights at Munich Airport?",
      "Option A": "Technical issues with air traffic control",
      "Option B": "Suspected drones in the area", 
      "Option C": "A security threat alert",
      "Option D": "Severe weather conditions",
      "Answer": "B",
      "Source": "https://bbc.co.uk/news/..."
    }
  ]
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Netlify
npm run deploy
```

## Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## PWA Configuration

The app is configured as a PWA in [`vite.config.js`](vite.config.js) with:
- App manifest for installation
- Service worker for offline functionality
- App store screenshots for mobile stores
- Android TWA support via [`assetlinks.json`](public/.well-known/assetlinks.json)

---

**Live Demo**: [NewsFlash Quiz](https://newsflashquiz.netlify.app)

