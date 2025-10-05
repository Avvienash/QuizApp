import OpenAI from "openai";
import { XMLParser } from "fast-xml-parser";
import { getStore } from "@netlify/blobs";

// --- BBC RSS Feeds Configuration ---
export const BBC_FEEDS = {
  // General
  world: "https://feeds.bbci.co.uk/news/world/rss.xml",
  uk: "https://feeds.bbci.co.uk/news/uk/rss.xml",
  business: "https://feeds.bbci.co.uk/news/business/rss.xml",
  politics: "https://feeds.bbci.co.uk/news/politics/rss.xml",
  health: "https://feeds.bbci.co.uk/news/health/rss.xml",
  tech: "https://feeds.bbci.co.uk/news/technology/rss.xml",
  science: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
  education: "https://feeds.bbci.co.uk/news/education/rss.xml",
  entertainment: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
  sport: "https://feeds.bbci.co.uk/sport/rss.xml?edition=uk",

  // Regional
  africa: "https://feeds.bbci.co.uk/news/world/africa/rss.xml",
  asia: "https://feeds.bbci.co.uk/news/world/asia/rss.xml",
  europe: "https://feeds.bbci.co.uk/news/world/europe/rss.xml",
  latin_america: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml",
  middle_east: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
  us_canada: "https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml",

  // Culture
  travel: "https://www.bbc.com/travel/feed.rss",
  culture: "https://www.bbc.com/culture/feed.rss",
  music: "https://www.bbc.com/culture/music/rss.xml",
  film_tv: "https://www.bbc.com/culture/film-tv/rss.xml",
  art_design: "https://www.bbc.com/culture/art/rss.xml",
  books: "https://www.bbc.com/culture/books/rss.xml",
  style: "https://www.bbc.com/culture/style/rss.xml",

  // Innovation
  ai: "https://www.bbc.com/innovation/artificial-intelligence/rss.xml",
  science_health: "https://www.bbc.com/innovation/science/rss.xml",
};

// --- OpenAI setup ---
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

// --- Helper: Get today's date in YYYY-MM-DD format ---
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// --- Helper: Fetch RSS articles ---
async function fetchRSS(rssUrl) {
  const res = await fetch(rssUrl);
  const xml = await res.text();
  const parser = new XMLParser();
  const jsonObj = parser.parse(xml);

  return jsonObj.rss.channel.item.map(item => ({
    title: item.title,
    link: item.link,
    description: item.description,
  }));
}

// --- Helper: Filter inappropriate questions ---
function containsInappropriateContent(quizItem) {
  const inappropriateKeywords = [
    "sexual assault", "rape", "murder", "murdered", "kill", "killed", "death", "dead",
    "child abuse", "abuse", "assault", "shooting", "stabbing", "kidnap", "torture",
    "drugs", "human trafficking", "suicide", "harassment"
  ];

  const textToCheck = [
    quizItem.Question,
    quizItem["Option A"],
    quizItem["Option B"],
    quizItem["Option C"],
    quizItem["Option D"]
  ].join(" ").toLowerCase().replace(/[^\w\s]/g, "");

  return inappropriateKeywords.some(keyword => textToCheck.includes(keyword));
}

// --- Helper: Generate question for an article ---
async function generateQuestionForArticle(article) {
  const prompt = `
    You are a quiz generator. 
    Create **one multiple-choice question** (4 options) based on the following news article:

    Title: ${article.title}
    Description: ${article.description}

    GUIDELINES:
    - The question must be **self-contained** and make full sense without referencing "this article" or "the news".
    - Avoid **obvious or tautological questions** (e.g., “Where did the Australian Cup take place?” → “Australia”).
    - Avoid questions where the correct answer is **directly stated in the question itself**.
    - The question should focus on **a meaningful fact or insight**: a cause, reason, outcome, statistic, quote, or specific detail.
    - Include **real context** (names, dates, organizations, or events) to make it feel grounded and interesting.
    - Keep it **clear, concise, and naturally phrased**, like something you'd see in a trivia game or smart news quiz.

    Format as JSON:
    {
      "Question": "string",
      "CorrectAnswer": "string",
      "WrongAnswer1": "string",
      "WrongAnswer2": "string",
      "WrongAnswer3": "string"
    }
    `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6
    });

    let content = response.choices[0].message.content.trim();
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;

    let aiResponse;
    try {
      aiResponse = JSON.parse(match[0]);
    } catch (e) {
      console.error("❌ Failed to parse AI JSON:", content);
      return null;
    }

    const answers = [
      { text: aiResponse.CorrectAnswer, isCorrect: true },
      { text: aiResponse.WrongAnswer1, isCorrect: false },
      { text: aiResponse.WrongAnswer2, isCorrect: false },
      { text: aiResponse.WrongAnswer3, isCorrect: false }
    ];
    
    // Shuffle answers
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    const correctAnswerIndex = answers.findIndex(a => a.isCorrect);
    const correctAnswerLetter = ["A", "B", "C", "D"][correctAnswerIndex];

    const quizItem = {
      Question: aiResponse.Question,
      "Option A": answers[0].text,
      "Option B": answers[1].text,
      "Option C": answers[2].text,
      "Option D": answers[3].text,
      Answer: correctAnswerLetter,
      Source: article.link
    };

    //if (containsInappropriateContent(quizItem)) return null;

    return quizItem;
  } catch (err) {
    console.error("❌ Error generating question:", err);
    return null;
  }
}

// --- Retry helper ---
async function tryGenerateQuestion(article, attempts = 2) {
  for (let i = 0; i < attempts; i++) {
    const question = await generateQuestionForArticle(article);
    if (question) return question;
  }
  return null;
}

// --- Sleep helper ---
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Main Function: Generate quiz JSON in parallel ---
async function generateQuizJSON(n, rssUrl, category) {
  console.log(`🔄 Generating new ${category} quiz with ${n} questions from RSS feed...`);
  
  const articles = await fetchRSS(rssUrl);
  console.log(`📰 Fetched ${articles.length} articles from RSS feed`);
  
  const candidates = articles.slice(0, n+1);
  const quizPromises = candidates.map(article => tryGenerateQuestion(article));
  const results = await Promise.allSettled(quizPromises);
  const quiz = results
    .filter(r => r.status === "fulfilled" && r.value !== null)
    .map(r => r.value)
    .slice(0, n);
    
  console.log(`✅ Successfully generated ${quiz.length} questions out of ${n} requested`);
  
  return {
    date: getTodayDate(),
    category: category,
    questions: quiz
  };
}

// --- Netlify Function Handler ---
export default async function handler(event, context) {
  try {
    console.log("🚀 Quiz generation function called");
    // Console log the entire event for debugging
    console.log("Event:", event);
    console.log("Context:", context);
    

    let category = event.queryStringParameters?.category ?? "world";
    
    console.log(`🔍 Requested category: ${category}`);

    // Validate category
    if (!BBC_FEEDS[category]) {
      console.log(`❌ Invalid category: ${category}, defaulting to world`);
      category = "world";
    }

    const todayDate = getTodayDate();
    const rssUrl = BBC_FEEDS[category];
    const blobKey = `quiz-${category}`;
    
    console.log(`📅 Today's date: ${todayDate}`);
    console.log(`📂 Category: ${category}`);
    console.log(`🔗 RSS URL: ${rssUrl}`);
    console.log(`💾 Blob key: ${blobKey}`);

    // Check if existing quiz exists in Netlify Blobs
    const quizStore = getStore("quiz");
    let existingQuiz = null;
    
    try {
      const storedQuizString = await quizStore.get(blobKey);
      if (storedQuizString) {
        existingQuiz = JSON.parse(storedQuizString);
        console.log(`📋 Found existing ${category} quiz with date: ${existingQuiz.date}`);
      } else {
        console.log(`📋 No existing ${category} quiz found in storage`);
      }
    } catch (err) {
      console.log(`⚠️ Error retrieving existing ${category} quiz from storage:`, err.message);
    }

    // Check if we need to generate a new quiz
    if (existingQuiz && existingQuiz.date === todayDate) {
      console.log(`✅ Returning existing ${category} quiz from today`);
      console.log(`📊 Quiz contains ${existingQuiz.questions.length} questions`);
      
      return new Response(JSON.stringify(existingQuiz), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Generate new quiz
    console.log(`🔄 Existing ${category} quiz is outdated or doesn't exist, generating new quiz...`);
    
    const n = 10;
    const newQuiz = await generateQuizJSON(n, rssUrl, category);

    // Save to Netlify Blobs with category-specific key
    try {
      await quizStore.set(blobKey, JSON.stringify(newQuiz));
      console.log(`💾 New ${category} quiz saved to Netlify Blobs storage`);
    } catch (err) {
      console.error(`❌ Failed to save ${category} quiz to storage:`, err);
      // Continue anyway, we can still return the quiz
    }
    
    console.log(`✅ ${category} quiz generation completed successfully`);
    console.log(`📊 Generated ${newQuiz.questions.length} questions`);

    return new Response(JSON.stringify(newQuiz), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (err) {
    console.error("❌ Server error during quiz generation:", err);
    return new Response(JSON.stringify({ 
      error: "Failed to generate quiz",
      message: err.message,
      availableCategories: Object.keys(BBC_FEEDS)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}