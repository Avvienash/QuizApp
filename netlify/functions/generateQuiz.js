import { BBC_FEEDS } from "./config/bbcFeeds.js";
import { getTodayDate } from "./utils/helpers.js";
import { generateQuizJSON } from "./services/quizGenerator.js";
import { getExistingQuiz, saveQuiz } from "./services/storageService.js";

export default async function handler(event, context) {
  try {
    console.log("🚀 Quiz generation function called");

    let category = context.url.searchParams.get("category") || "world";
    
    console.log(`🔍 Requested category: ${category}`);

    // Validate category
    if (!BBC_FEEDS[category]) {
      console.log(`❌ Invalid category: ${category}, defaulting to world`);
      category = "world";
    }

    const todayDate = getTodayDate();
    const rssUrl = BBC_FEEDS[category];
    
    console.log(`📅 Today's date: ${todayDate}`);
    console.log(`📂 Category: ${category}`);
    console.log(`🔗 RSS URL: ${rssUrl}`);

    // Check if existing quiz exists
    const existingQuiz = await getExistingQuiz(category);
    
    if (existingQuiz) {
      console.log(`📋 Found existing ${category} quiz with date: ${existingQuiz.date}`);
    } else {
      console.log(`📋 No existing ${category} quiz found in storage`);
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

    // Save to storage
    await saveQuiz(category, newQuiz);
    
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