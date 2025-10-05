import { getStore } from "@netlify/blobs";

const quizStore = getStore("quiz");

export async function getExistingQuiz(category) {
  const blobKey = `quiz-${category}`;
  
  try {
    const storedQuizString = await quizStore.get(blobKey);
    if (storedQuizString) {
      return JSON.parse(storedQuizString);
    }
    return null;
  } catch (err) {
    console.log(`⚠️ Error retrieving existing ${category} quiz from storage:`, err.message);
    return null;
  }
}

export async function saveQuiz(category, quiz) {
  const blobKey = `quiz-${category}`;
  
  try {
    await quizStore.set(blobKey, JSON.stringify(quiz));
    console.log(`💾 New ${category} quiz saved to Netlify Blobs storage`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to save ${category} quiz to storage:`, err);
    return false;
  }
}