// utils/genaiVision.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/** Infer mime type from buffer (basic PNG/JPEG detection) */
function detectMimeType(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 4) return "image/png";
  const png = buf.slice(0, 8).equals(Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]));
  const jpg = buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
  if (png) return "image/png";
  if (jpg) return "image/jpeg";
  return "image/png";
}

/** Remove markdown fencing if model returns code blocks */
function cleanModelText(text) {
  if (!text) return text;
  return text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
}

/** Fallback: extract first balanced JSON object from arbitrary text */
function extractFirstJson(text) {
  const start = text.indexOf("{");
  if (start === -1) throw new Error("No JSON object start found");
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
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

/** Very generic quantity extractor: numbers + optional units */
function extractQuantitiesFromText(text) {
  if (!text) return [];
  const quantities = [];
  // e.g., 5400 RPM, 10 ms, 2.5 s, 4 KB, 512 bytes, 3.3 V, 2 A, 50 Ω, 2.4 GHz, 10%, 5 km/h, 20 m/s
  const regex = /(\d+(?:\.\d+)?)\s*(rpm|rps|ms|s|sec|seconds|minutes|min|hrs|hours|kb|mb|gb|tb|bytes|byte|b|v|a|w|ohm|Ω|hz|khz|mhz|ghz|%|km\/h|m\/s|m|cm|mm|km)?\b/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const value = parseFloat(match[1]);
    const unit = (match[2] || "").toLowerCase();
    // Skip lone integers that look like question numbers if right next to "q" or "question"
    const ctx = text.slice(Math.max(0, match.index - 6), match.index + (match[0]?.length || 0) + 6).toLowerCase();
    if (/q\.?\s*$|question\s*$/i.test(ctx)) continue;
    quantities.push({ value, unit: unit || null, span: match[0] });
  }
  return quantities;
}

/**
 * Extract structured question JSON from an image (buffer).
 * Returns:
 * {
 *   questionText: string,
 *   options: [{ text: string, isCorrect: boolean|null }],
 *   difficulty: "easy"|"medium"|"hard"|"unknown",
 *   tags: string[],
 *   year: string|"unknown",
 *   source: "PYQ"|"Mock"|"Unknown",
 *   answerKey: string|null,
 *   formulas: [{ description, expression }],
 *   solution: { steps: string[], explanation: string },
 *   hint: string,
 *   quantities: [{ value:number, unit:string|null, span:string }],
 *   computed: null
 * }
 */
async function extractQuestionFromImage(imageBuffer) {
  const prompt = `
You are given a screenshot of a competitive exam question (single MCQ or numeric).
Return ONLY valid JSON (no markdown, no commentary) with fields:

- questionText: string
- options: array of { text: string, isCorrect: boolean }  // if model can't mark correctness, set isCorrect=null
- difficulty: "easy" | "medium" | "hard" | "unknown"
- tags: array of strings
- year: string or "unknown"
- source: "PYQ" | "Mock" | "Unknown"
- answerKey: string (the correct option text or letter) OR null
- formulas: array of { description: string, expression: string } // expression in LaTeX if possible, else plain text
- solution: {
    steps: array of short strings (each step),
    explanation: string (easy language with any relevant real-world analogy)
  }
- hint: string
- numericFields: { rotationSpeed: number, avgSeekMs: number, sectorsPerTrack: number, sectorSizeBytes: number, totalSectors: number } OR null
- computed: { computedAnswerDescription: string, computedAnswerSeconds: number } OR null

If the question contains numeric parameters (like rotation speed, seek time, sectors/track, sector size, number of sectors), extract them into numericFields. If possible, compute the deterministic numeric answer (for disk-reading time etc.) and put it under computed.

IMPORTANT: Respond with one single valid JSON object only.
`.trim();

  const base64Image = imageBuffer.toString("base64");
  const mimeType = detectMimeType(imageBuffer);

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Image } }
          ]
        }
      ],
      generationConfig: { temperature: 0, responseMimeType: "application/json" }
    });

    let text = result.response.text();
    text = cleanModelText(text);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const repaired = extractFirstJson(text).replace(/,\s*([}\]])/g, "$1");
      parsed = JSON.parse(repaired);
    }

    // If model returns an array, pick the first object
    if (Array.isArray(parsed)) parsed = parsed[0] || {};

    // Normalize shape & defaults
    parsed.questionText = parsed.questionText || "";
    parsed.options = Array.isArray(parsed.options) ? parsed.options.map(o => ({
      text: typeof o?.text === "string" ? o.text : String(o ?? ""),
      isCorrect: typeof o?.isCorrect === "boolean" ? o.isCorrect : null
    })) : [];
    parsed.difficulty = parsed.difficulty || "unknown";
    parsed.tags = Array.isArray(parsed.tags) ? parsed.tags : [];
    parsed.year = parsed.year || "unknown";
    parsed.source = parsed.source || "Unknown";
    parsed.answerKey = typeof parsed.answerKey === "string" ? parsed.answerKey : null;
    parsed.formulas = Array.isArray(parsed.formulas) ? parsed.formulas : [];
    parsed.solution = parsed.solution && typeof parsed.solution === "object"
      ? {
          steps: Array.isArray(parsed.solution.steps) ? parsed.solution.steps : [],
          explanation: typeof parsed.solution.explanation === "string" ? parsed.solution.explanation : ""
        }
      : { steps: [], explanation: "" };
    parsed.hint = parsed.hint || "";

    // Generic numeric scrape (domain-agnostic)
    parsed.quantities = extractQuantitiesFromText(parsed.questionText);

    // No domain-specific auto-computation (kept generic)
    parsed.computed = null;

    return parsed;
  } catch (err) {
    console.error("❌ Image parse error (genaiVision):", err?.message || err);
    throw err;
  }
}

module.exports = { extractQuestionFromImage };
