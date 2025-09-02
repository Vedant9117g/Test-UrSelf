// utils/genai.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Extract structured question JSON from raw question text
 * Includes answerKey, solution, hint
 */
async function extractQuestionJSON(rawQuestion) {
  const prompt = `
You are given a competitive exam question. 
Extract details and return ONLY valid JSON (no markdown, no extra text).

Fields:
- questionText: string
- options: array of { text: string, isCorrect: boolean }
- difficulty: "easy" | "medium" | "hard"
- tags: array of topic strings
- year: string (YYYY or "unknown")
- source: "PYQ" | "Mock" | "Unknown"
- answerKey: string (the correct option text)
- solution: string (step-by-step, structured explanation with formulas, written in simple language, include real-world analogies/examples)
- hint: string (a short guiding tip for solving)

Question:
${rawQuestion}
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json"
      }
    });

    const text = result.response.text();

    return JSON.parse(text);
  } catch (err) {
    console.error("❌ Gemini parse error:", err.message);
    throw new Error("Failed to parse Gemini response as JSON");
  }
}

module.exports = { extractQuestionJSON };
