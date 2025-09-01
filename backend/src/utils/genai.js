// utils/genai.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Extracts structured question JSON from raw question text using Gemini
 * @param {string} rawQuestion - The text of the question
 * @returns {object} - Parsed question in JSON format
 */
const extractQuestionJSON = async (rawQuestion) => {
  const prompt = `
You are given a raw exam question. Extract structured details in JSON:

{
  "questionText": "...",
  "options": [{ "text": "...", "isCorrect": true/false }],
  "difficulty": "easy|medium|hard",
  "tags": ["..."],
  "year": "unknown or actual year",
  "source": "PYQ|Mock|Unknown",
  "answerKey": "correct option text",
  "solution": "step by step explanation with formulas where needed",
  "hint": "short guiding tip"
}

Return ONLY valid JSON, no extra text.
Question:
${rawQuestion}
  `;

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    });

    const text = result.response.text();
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ Error parsing question with Gemini:", err.message);
    throw err;
  }
};

module.exports = { extractQuestionJSON };
