import { getStore } from "@netlify/blobs";

export async function handler(event, context) {
  try {
    // Get quiz data from Netlify Blobs
    const quizStore = getStore("quiz");
    const quizData = await quizStore.get("scheduled-quiz");
    
    // Check if the quiz exists
    if (!quizData) {
      return {
        statusCode: 404,
        body: JSON.stringify({ 
          error: "Quiz not found. Please try again later." 
        }),
      };
    }
    
    // Parse and return the quiz
    const quiz = JSON.parse(quizData);
    
    return {
      statusCode: 200,
      body: JSON.stringify(quiz)
    };

  } catch (err) {
    console.error("❌ Error reading daily quiz:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Failed to load quiz data" 
      }),
    };
  }
}