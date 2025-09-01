// utils/genaiVision.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function extractQuestionFromImage(base64Image) {
  const prompt = `
You are given a screenshot of a competitive exam MCQ.
Extract it as JSON only, with this structure:

{
  "questionText": "...",
  "options": [
    { "text": "...", "isCorrect": false },
    { "text": "...", "isCorrect": true }
  ],
  "difficulty": "easy|medium|hard",
  "tags": ["topic1", "topic2"],
  "year": "YYYY or unknown",
  "source": "PYQ or Mock or Unknown"
}
`;

  const result = await model.generateContent([
    { inlineData: { data: base64Image, mimeType: "image/png" } },
    { text: prompt }
  ]);

  let text = result.response.text();

  // 🔥 Strip ```json fences if present
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ Still not valid JSON:", text);
    throw new Error("Failed to parse Gemini response as JSON");
  }
}

module.exports = { extractQuestionFromImage };
