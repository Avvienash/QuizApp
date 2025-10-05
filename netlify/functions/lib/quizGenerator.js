import OpenAI from "openai";
import { containsInappropriateContent } from "./contentFilter.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateQuestionForArticle(article) {
  const prompt = `
    You are a quiz generator. 
    Create **one multiple-choice question** (4 options) based on the following news article:

    Title: ${article.title}
    Description: ${article.description}

    GUIDELINES:
    - The question must be **self-contained** and make full sense without referencing "this article" or "the news".
    - Avoid **obvious or tautological questions** (e.g., "Where did the Australian Cup take place?" → "Australia").
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

    return quizItem;
  } catch (err) {
    console.error("❌ Error generating question:", err);
    return null;
  }
}

export async function tryGenerateQuestion(article, attempts = 2) {
  for (let i = 0; i < attempts; i++) {
    const question = await generateQuestionForArticle(article);
    if (question) return question;
  }
  return null;
}