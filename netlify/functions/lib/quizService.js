import { fetchRSS } from "./rssParser.js";
import { tryGenerateQuestion } from "./quizGenerator.js";
import { getTodayDate } from "./utils.js";

export async function generateQuizJSON(n, rssUrl, category) {
  console.log(`🔄 Generating new ${category} quiz with ${n} questions from RSS feed...`);
  
  const articles = await fetchRSS(rssUrl);
  console.log(`📰 Fetched ${articles.length} articles from RSS feed`);
  
  const candidates = articles.slice(0, n + 5);
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