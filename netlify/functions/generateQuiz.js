import OpenAI from "openai";
import { XMLParser } from "fast-xml-parser";
import { getStore } from "@netlify/blobs";

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
      model: "gpt-4o",
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
async function generateQuizJSON(n, rssUrl) {
  console.log(`🔄 Generating new quiz with ${n} questions from RSS feed...`);
  
  const articles = await fetchRSS(rssUrl);
  console.log(`📰 Fetched ${articles.length} articles from RSS feed`);
  
  const candidates = articles.slice(0, n+5);
  const quizPromises = candidates.map(article => tryGenerateQuestion(article));
  const results = await Promise.allSettled(quizPromises);
  const quiz = results
    .filter(r => r.status === "fulfilled" && r.value !== null)
    .map(r => r.value)
    .slice(0, n);
    
  console.log(`✅ Successfully generated ${quiz.length} questions out of ${n} requested`);
  
  return {
    date: getTodayDate(),
    questions: quiz
  };
}

// --- Netlify Function Handler ---
export default async function handler(event, context) {
  try {
    console.log("🚀 Quiz generation function called");
    
    const todayDate = getTodayDate();
    console.log(`📅 Today's date: ${todayDate}`);

    // Check if existing quiz exists in Netlify Blobs
    const quizStore = getStore("quiz");
    let existingQuiz = null;
    
    try {
      const storedQuizString = await quizStore.get("scheduled-quiz");
      if (storedQuizString) {
        existingQuiz = JSON.parse(storedQuizString);
        console.log(`📋 Found existing quiz with date: ${existingQuiz.date}`);
      } else {
        console.log("📋 No existing quiz found in storage");
      }
    } catch (err) {
      console.log("⚠️ Error retrieving existing quiz from storage:", err.message);
    }

    // Check if we need to generate a new quiz
    if (existingQuiz && existingQuiz.date === todayDate) {
      console.log("✅ Returning existing quiz from today");
      console.log(`📊 Quiz contains ${existingQuiz.questions.length} questions`);
      
      return new Response(JSON.stringify(existingQuiz), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Generate new quiz
    console.log("🔄 Existing quiz is outdated or doesn't exist, generating new quiz...");
    
    const n = 10;
    const rssUrl = "https://feeds.bbci.co.uk/news/world/rss.xml";
    const newQuiz = await generateQuizJSON(n, rssUrl);

    // Save to Netlify Blobs
    try {
      await quizStore.set("scheduled-quiz", JSON.stringify(newQuiz));
      console.log("💾 New quiz saved to Netlify Blobs storage");
    } catch (err) {
      console.error("❌ Failed to save quiz to storage:", err);
      // Continue anyway, we can still return the quiz
    }
    
    console.log("✅ Quiz generation completed successfully");
    console.log(`📊 Generated ${newQuiz.questions.length} questions`);

    return new Response(JSON.stringify(newQuiz), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error("❌ Server error during quiz generation:", err);
    return new Response(JSON.stringify({ 
      error: "Failed to generate quiz",
      message: err.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}