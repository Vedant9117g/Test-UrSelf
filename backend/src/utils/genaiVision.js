// utils/genaiVision.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Extract structured question data (with answer key, solution, hint)
 * from a question screenshot using Gemini Vision API
 */
async function extractQuestionFromImage(imageBuffer) {
  const prompt = `
You are given a screenshot of a competitive exam question.
Extract the details in strict JSON format.

Fields:
- questionText: string
- options: array of { text: string, isCorrect: boolean }
- difficulty: "easy" | "medium" | "hard"
- tags: array of strings
- year: string or "unknown"
- source: "PYQ" | "Mock" | "Unknown"
- answerKey: string (correct option text)
- solution: string (step by step explanation)
- hint: string (short guiding tip)

Return ONLY valid JSON, no markdown, no extra text.
`;

  const base64Image = imageBuffer.toString("base64");

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/png", data: base64Image } }
          ]
        }
      ],
      generationConfig: { responseMimeType: "application/json" }
    });

    const text = result.response.text();
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ Image parse error:", err.message);
    throw new Error("Failed to parse Gemini response as JSON");
  }
}

module.exports = { extractQuestionFromImage };
