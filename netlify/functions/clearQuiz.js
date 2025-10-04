import { getStore } from "@netlify/blobs";

// --- Netlify Function Handler to clear saved quiz ---
export default async function handler(event, context) {
  try {
    console.log("🗑️ Clear quiz function called");

    const quizStore = getStore("quiz");

    await quizStore.delete("scheduled-quiz");
    console.log("✅ Saved quiz cleared from storage");

    return new Response(JSON.stringify({
      message: "Saved quiz cleared successfully"
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("❌ Failed to clear quiz:", err);
    return new Response(JSON.stringify({
      error: "Failed to clear quiz",
      message: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
