// utils/genai.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// IMPORTANT: Ensure .env has: GENAI_API_KEY=YOUR_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-1.5-flash for speed; you can switch to "gemini-1.5-pro" for higher quality
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Optional but very helpful schema: forces valid JSON shape
const responseSchema = {
  type: "object",
  properties: {
    questionText: { type: "string" },
    options: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          isCorrect: { type: "boolean" }
        },
        required: ["text", "isCorrect"]
      }
    },
    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
    tags: { type: "array", items: { type: "string" } },
    year: { type: ["integer", "string"] }, // "unknown" or a year
    source: { type: "string", enum: ["PYQ", "Mock", "Unknown"] }
  },
  required: ["questionText", "options"]
};

// Fallback: extract the first balanced {...} block if needed
function extractFirstJson(text) {
  const start = text.indexOf("{");
  if (start === -1) throw new Error("No JSON object start found");
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) { esc = false; }
      else if (ch === "\\") { esc = true; }
      else if (ch === '"') { inStr = false; }
    } else {
      if (ch === '"') inStr = true;
      else if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return text.slice(start, i + 1);
      }
    }
  }
  throw new Error("No balanced JSON object found");
}

/**
 * Extract structured question JSON from raw question text
 */
async function extractQuestionJSON(rawQuestion) {
  const prompt = `
You are given a competitive exam question. Extract the details and return ONLY JSON.

Return JSON with fields:
- questionText: string
- options: array of { text: string, isCorrect: boolean }
- difficulty: one of "easy", "medium", "hard" (guess if needed)
- tags: array of topic strings
- year: YYYY or "unknown"
- source: "PYQ", "Mock", or "Unknown"

Question:
${rawQuestion}
`;

  try {
    // Ask for JSON-only output
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema // comment this line out if your SDK version doesn't support schema
      }
    });

    const text = result.response.text(); // should be pure JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      // Fallback if something slipped through (e.g., leading notes)
      const repaired = extractFirstJson(text);
      return JSON.parse(repaired.replace(/,\s*([}\]])/g, "$1")); // drop trailing commas if any
    }
  } catch (err) {
    // Surface a clean message to your controller
    const msg = (err && err.message) || String(err);
    console.error("❌ Gemini parse error:", msg);
    throw new Error(msg);
  }
}

module.exports = { extractQuestionJSON };
