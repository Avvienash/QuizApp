import { getStore } from "@netlify/blobs";

// --- Netlify Function Handler to clear all saved quizzes ---
export default async function handler(event, context) {
  try {
    console.log("🗑️ Clear all quizzes function called");

    const quizStore = getStore("quiz");
    
    // Get all blobs in the store
    const { blobs } = await quizStore.list();
    console.log(`📋 Found ${blobs.length} quiz blobs to clear`);
    
    if (blobs.length === 0) {
      console.log("ℹ️ No quizzes found to clear");
      return new Response(JSON.stringify({
        message: "No quizzes found to clear",
        summary: {
          totalBlobs: 0,
          successfullyCleared: 0,
          errors: 0
        },
        details: []
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    
    // Clear each blob
    const clearPromises = blobs.map(async (blob) => {
      try {
        await quizStore.delete(blob.key);
        console.log(`✅ Cleared blob with key: ${blob.key}`);
        return { key: blob.key, status: 'cleared' };
      } catch (err) {
        console.error(`❌ Failed to clear blob ${blob.key}:`, err.message);
        return { key: blob.key, status: 'error', error: err.message };
      }
    });

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
        totalBlobs: blobs.length,
        successfullyCleared: successCount,
        errors: errorCount
      },
      details: clearedQuizzes
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
