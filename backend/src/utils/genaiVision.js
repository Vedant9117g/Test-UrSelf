// utils/genaiVision.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Helper: remove triple-backticks and surrounding noise
function cleanModelText(text) {
  if (!text) return text;
  return text.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
}

// fallback: extract first balanced JSON object
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

// Try to extract numeric values from question text if model doesn't
function extractNumbersFromText(text) {
  const out = {};

  const rpmMatch = text.match(/(\d{3,5})\s*RPM/i) || text.match(/rotation speed of\s*(\d{3,5})/i);
  if (rpmMatch) out.rotationSpeed = parseFloat(rpmMatch[1]);

  const seekMatch = text.match(/seek time of\s*([\d.]+)\s*milliseconds/i) || text.match(/average seek time of\s*([\d.]+)\s*ms/i);
  if (seekMatch) out.avgSeekMs = parseFloat(seekMatch[1]);

  const sectorsPerTrackMatch = text.match(/(\d{1,4})\s*sectors\/track/i);
  if (sectorsPerTrackMatch) out.sectorsPerTrack = parseInt(sectorsPerTrackMatch[1]);

  const sectorSizeMatch = text.match(/(\d{2,6})-?byte\s*sectors/i) || text.match(/(\d{2,6})\s*bytes\/sector/i) || text.match(/(\d{2,6})\s*byte sectors/i);
  if (sectorSizeMatch) out.sectorSizeBytes = parseInt(sectorSizeMatch[1]);

  const totalSectorsMatch = text.match(/file has content stored in\s*(\d{1,6})\s*sectors/i) || text.match(/(\d{1,6})\s*sectors located/i);
  if (totalSectorsMatch) out.totalSectors = parseInt(totalSectorsMatch[1]);

  return out;
}

// Deterministic computation for disk read example (and similar)
function computeDiskTotalSeconds(parsed) {
  // prefer numeric fields from parsed, otherwise try to extract from questionText
  const q = parsed;
  const textNumbers = extractNumbersFromText(q.questionText || "");
  const rpm = q.rotationSpeed || textNumbers.rotationSpeed || q.numericFields?.rotationSpeed;
  const avgSeekMs = q.avgSeekMs || textNumbers.avgSeekMs || q.numericFields?.avgSeekMs;
  const sectorsPerTrack = q.sectorsPerTrack || textNumbers.sectorsPerTrack || q.numericFields?.sectorsPerTrack;
  const sectorSizeBytes = q.sectorSizeBytes || textNumbers.sectorSizeBytes || q.numericFields?.sectorSizeBytes;
  const totalSectors = q.totalSectors || textNumbers.totalSectors || q.numericFields?.totalSectors;

  if (!rpm || !avgSeekMs || !sectorsPerTrack || !sectorSizeBytes || !totalSectors) {
    return null; // insufficient data to compute
  }

  // compute
  const revsPerSec = rpm / 60.0;
  const revolutionTimeMs = 1000.0 / revsPerSec; // ms per revolution
  const avgRotationalLatencyMs = revolutionTimeMs / 2.0;
  const bytesPerRevolution = sectorsPerTrack * sectorSizeBytes;
  const bytesPerSecond = bytesPerRevolution * revsPerSec;
  const totalBytes = totalSectors * sectorSizeBytes;
  const transferTimeSec = totalBytes / (bytesPerSecond || 1); // seconds

  // per-sector transfer time in ms:
  const transferPerSectorMs = (sectorSizeBytes / (bytesPerSecond || 1)) * 1000.0;

  const perSectorMs = (avgSeekMs || 0) + (avgRotationalLatencyMs || 0) + transferPerSectorMs;
  const totalTimeMs = perSectorMs * totalSectors + (transferTimeSec * 1000 - transferPerSectorMs * totalSectors); 
  // the formula above avoids double counting transfer: we use perSectorMs except total transfer is transferTimeSec,
  // but perSectorMs includes transferPerSectorMs added totalSectors times; simpler: approximate as:
  // totalTimeMs ≈ totalSectors * (avgSeekMs + avgRotationalLatencyMs) + transferTimeSec*1000
  const approxTotalMs = (avgSeekMs + avgRotationalLatencyMs) * totalSectors + transferTimeSec * 1000.0;

  // Return both exact computed and approx
  return {
    rotationSpeedRPM: rpm,
    avgSeekMs,
    sectorsPerTrack,
    sectorSizeBytes,
    totalSectors,
    bytesPerSecond,
    totalBytes,
    transferTimeSec,
    approxTotalSeconds: Number((approxTotalMs / 1000.0).toFixed(2))
  };
}

/**
 * Extract structured question JSON from an image (buffer)
 * Returns object with fields: questionText, options, difficulty, tags, year, source,
 * answerKey, formulas(array), solution { steps:[], explanation }, hint, numericFields (optional),
 * computed (optional) with computed results.
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
      generationConfig: { temperature: 0, responseMimeType: "application/json" }
    });

    let text = result.response.text();
    text = cleanModelText(text);

    // Try parse JSON, fallback to first JSON block
    try {
      const parsed = JSON.parse(text);

      // If numericFields missing, try to extract from questionText
      if ((!parsed.numericFields || Object.keys(parsed.numericFields).length === 0) && parsed.questionText) {
        parsed.numericFields = extractNumbersFromText(parsed.questionText);
      }

      // If model didn't give computed, try to compute locally
      if (!parsed.computed) {
        const comp = computeDiskTotalSeconds({ ...parsed, ...parsed.numericFields });
        if (comp) {
          parsed.computed = {
            computedAnswerDescription: `Estimated total time to read file (assuming random sectors)`,
            computedAnswerSeconds: comp.approxTotalSeconds
          };
        } else {
          parsed.computed = null;
        }
      }

      // If options were present but no answerKey, and computedAnswerSeconds is numeric,
      // try match to closest numeric option (if options contain numeric value or seconds)
      if ((!parsed.answerKey || parsed.answerKey === null) && parsed.options && parsed.computed && parsed.computed.computedAnswerSeconds) {
        const cs = parsed.computed.computedAnswerSeconds;
        // try to parse numeric from options (if options are numbers or times)
        let bestIdx = -1; let bestDiff = Infinity;
        parsed.options.forEach((opt, idx) => {
          const numMatch = String(opt.text).match(/([0-9]+(\.[0-9]+)?)/);
          if (numMatch) {
            const num = parseFloat(numMatch[1]);
            const diff = Math.abs(num - cs);
            if (diff < bestDiff) { bestDiff = diff; bestIdx = idx; }
          }
        });
        if (bestIdx !== -1) {
          parsed.answerKey = parsed.options[bestIdx].text;
          parsed.options[bestIdx].isCorrect = true;
        }
      }

      return parsed;
    } catch (e) {
      // fallback: extract first JSON block and try parse
      const repaired = extractFirstJson(text);
      const cleaned = repaired.replace(/,\s*([}\]])/g, "$1"); // remove trailing commas
      const parsed = JSON.parse(cleaned);
      // same local numeric fallback as above
      if ((!parsed.numericFields || Object.keys(parsed.numericFields).length === 0) && parsed.questionText) {
        parsed.numericFields = extractNumbersFromText(parsed.questionText);
      }
      if (!parsed.computed) {
        const comp = computeDiskTotalSeconds({ ...parsed, ...parsed.numericFields });
        if (comp) parsed.computed = { computedAnswerDescription: `Estimated total time to read file`, computedAnswerSeconds: comp.approxTotalSeconds};
        else parsed.computed = null;
      }
      return parsed;
    }
  } catch (err) {
    console.error("❌ Image parse error (genaiVision):", err.message || err);
    throw err;
  }
}

module.exports = { extractQuestionFromImage };
