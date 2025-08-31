// utils/genai.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genai = new GoogleGenerativeAI({
  apiKey: process.env.GENAI_API_KEY,
});

/**
 * Extracts structured question JSON from raw question text using Gemini
 * @param {string} rawQuestion - The text of the question
 * @returns {object} - Parsed question in JSON format
 */
const extractQuestionJSON = async (rawQuestion) => {
  // Prompt for the model
  const prompt = `
Extract question details in JSON format:
- questionText: the question text
- options: array of { text, isCorrect } objects
- difficulty: easy / medium / hard
- tags: relevant topics/keywords
- year: PYQ year
- source: Mock or PYQ
Please respond ONLY in valid JSON.
Question:
${rawQuestion}
`;

  try {
    const response = await genai.chat.completions.create({
      model: "chat-bison-001", // older model, works with free tier
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    // Parse and return JSON
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("Error parsing question with Gemini:", err);
    throw err;
  }
};

module.exports = { extractQuestionJSON };
