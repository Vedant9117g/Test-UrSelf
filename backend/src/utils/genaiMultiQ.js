const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function cleanModelText(text) {
  return text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
}

function extractFirstJsonArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("No JSON array found");
  return text.slice(start, end + 1);
}

/** 🔹 Parse multiple questions image (supports 2-column layout + blanks) */
async function extractQuestionsFromImage(imageBuffer) {
  const prompt = `
You are given an image of multiple exam questions from a book. 
The page may be in TWO COLUMNS, so some questions may start in one column and their options continue in the second column. 
Reconstruct the full question + options properly.

Return ONLY a valid JSON array like:

[
  {
    "questionNumber": 48,
    "questionText": "What is the minimum number of page colours ...",
    "options": ["A) 2", "B) 4", "C) 8", "D) 16"]
  },
  {
    "questionNumber": 55,
    "questionText": "A computer system implements a 40-bit virtual address ... The minimum length of the TLB tag in bits is ____.",
    "options": []   // empty if no multiple choice, keep blank for numeric answers
  }
]

Rules:
- Merge both columns into a single sequence (question → options). 
- If a question is incomplete in column 1, continue it from column 2 before moving to the next question.
- For fill-in-the-blank or numeric questions with no A/B/C/D options, set "options": [] and include "____" in the questionText.
- Never skip a question. Preserve the questionNumber.
`.trim();

  const base64 = imageBuffer.toString("base64");

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/png", data: base64 } }
        ]
      }
    ],
    generationConfig: { temperature: 0, responseMimeType: "application/json" }
  });

  let text = cleanModelText(result.response.text());
  try {
    return JSON.parse(text);
  } catch {
    return JSON.parse(extractFirstJsonArray(text));
  }
}

/** 🔹 Parse answer key image (supports MCQ, MSQ, Numeric) */
async function extractAnswerKeyFromImage(imageBuffer) {
  const prompt = `
You are given an image of an answer key table.
Return ONLY a valid JSON array like:

[
  { "questionNumber": 49, "correctOption": "C" },
  { "questionNumber": 50, "correctOption": "B" },
  { "questionNumber": 55, "correctOption": "122" },
  { "questionNumber": 73, "correctOption": "B,C,D" }
]

Rules:
- For single correct MCQ → "A", "B", "C", or "D".
- For multiple correct (MSQ) → join letters with commas (e.g., "A,C,D").
- For numeric answers → return the number or string exactly as shown (e.g., "154.5", "4096").
- No explanations or extra text.
- Output ONLY JSON array.
`.trim();

  const base64 = imageBuffer.toString("base64");

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/png", data: base64 } }
        ]
      }
    ],
    generationConfig: { temperature: 0, responseMimeType: "application/json" }
  });

  let text = cleanModelText(result.response.text());
  try {
    return JSON.parse(text);
  } catch {
    return JSON.parse(extractFirstJsonArray(text));
  }
}

/** 🔹 Merge questions + answer keys (supports MCQ/MSQ/Numeric) */
function mergeQuestionsAndKeys(questions, keys) {
  const keyMap = new Map(keys.map(k => [k.questionNumber, k.correctOption]));

  return questions.map(q => {
    const correctOption = keyMap.get(q.questionNumber) || null;

    let updatedOptions = q.options || [];

    if (correctOption && updatedOptions.length > 0) {
      const correctList = correctOption.split(",").map(x => x.trim().toUpperCase());

      updatedOptions = updatedOptions.map(opt => {
        const optLetter = opt.trim().charAt(0).toUpperCase(); // "A", "B", "C", "D"
        return correctList.includes(optLetter)
          ? `${opt} ✅`
          : opt;
      });
    }

    return {
      ...q,
      correctOption,
      options: updatedOptions
    };
  });
}

module.exports = {
  extractQuestionsFromImage,
  extractAnswerKeyFromImage,
  mergeQuestionsAndKeys
};
