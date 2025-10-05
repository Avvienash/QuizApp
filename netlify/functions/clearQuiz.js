import { getStore } from "@netlify/blobs";
import { BBC_FEEDS } from "./lib/config.js";

// --- Netlify Function Handler to clear all saved quizzes ---
export default async function handler(event, context) {
  try {
    console.log("🗑️ Clear all quizzes function called");

    const quizStore = getStore("quiz");
    
    // Get all available categories from BBC_FEEDS
    const categories = Object.keys(BBC_FEEDS);
    console.log(`📋 Found ${categories.length} quiz categories to clear`);
    
    // Clear each category-specific quiz
    const clearPromises = categories.map(async (category) => {
      const blobKey = `quiz-${category}`;
      try {
        await quizStore.delete(blobKey);
        console.log(`✅ Cleared ${category} quiz from storage`);
        return { category, status: 'cleared' };
      } catch (err) {
        console.error(`❌ Failed to clear ${category} quiz:`, err.message);
        return { category, status: 'error', error: err.message };
      }
    });

    // Also clear the old legacy quiz key if it exists
    try {
      await quizStore.delete("scheduled-quiz");
      console.log("✅ Cleared legacy quiz from storage");
    } catch (err) {
      console.log("ℹ️ No legacy quiz found to clear");
    }

    // Wait for all clear operations to complete
    const results = await Promise.allSettled(clearPromises);
    const clearedQuizzes = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    const successCount = clearedQuizzes.filter(q => q.status === 'cleared').length;
    const errorCount = clearedQuizzes.filter(q => q.status === 'error').length;

    console.log(`✅ Clear operation completed: ${successCount} cleared, ${errorCount} errors`);

    return new Response(JSON.stringify({
      message: "Quiz clearing operation completed",
      summary: {
        totalCategories: categories.length,
        successfullyCleared: successCount,
        errors: errorCount
      },
      details: clearedQuizzes,
      availableCategories: categories
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (err) {
    console.error("❌ Failed to clear quizzes:", err);
    return new Response(JSON.stringify({
      error: "Failed to clear quizzes",
      message: err.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
}
