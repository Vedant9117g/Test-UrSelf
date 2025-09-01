// controllers/pdfController.js
const pdfParse = require("pdf-parse");
const { extractQuestionJSON } = require("../utils/genai");

exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    // Extract text from memory (multer.memoryStorage())
    const data = await pdfParse(req.file.buffer);
    const pdfText = data.text || "";

    // Split by question blocks like "Q.1", "Q.2", etc.
    // Captures a question header and content until the next "Q.N" or end of file.
    const blocks = pdfText.match(/Q\.\s*\d+[\s\S]*?(?=Q\.\s*\d+|$)/g) || [];

    const parsedQuestions = [];
    for (const block of blocks) {
      const q = block.replace(/^Q\.\s*\d+\s*/i, "").trim(); // remove the "Q.n" prefix
      if (!q) continue;

      try {
        const parsed = await extractQuestionJSON(q);
        parsedQuestions.push(parsed);
      } catch (err) {
        console.warn("⚠️ Failed to parse one block (continuing):", err.message);
      }
    }

    res.json({
      success: true,
      totalExtracted: parsedQuestions.length,
      parsedQuestions
    });
  } catch (err) {
    console.error("❌ PDF Upload Error:", err);
    res.status(500).json({ error: "Failed to process PDF", details: err.message });
  }
};
