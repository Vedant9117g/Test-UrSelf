const pdfParse = require("pdf-parse");
const { extractQuestionJSON } = require("../utils/genai");

let pdfQuestionsCache = [];

exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

    // ✅ Parse PDF buffer
    const data = await pdfParse(req.file.buffer);
    const pdfText = data.text || "";

    // Split into question blocks like Q. 1, Q. 2 ...
    const blocks = pdfText.match(/Q\.\s*\d+[\s\S]*?(?=Q\.\s*\d+|$)/g) || [];
    pdfQuestionsCache = blocks.map((b) =>
      b.replace(/^Q\.\s*\d+\s*/i, "").trim()
    );

    console.log("📄 Extracted Questions:", pdfQuestionsCache.length);

    res.json({
      success: true,
      totalQuestions: pdfQuestionsCache.length,
      message:
        "PDF uploaded. Use /api/pdfs/parse-batch to fetch parsed questions in chunks.",
    });
  } catch (err) {
    console.error("❌ PDF Upload Error:", err);
    res
      .status(500)
      .json({ error: "Failed to process PDF", details: err.message });
  }
};

// ✅ Parse batch endpoint
exports.parseBatch = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const batch = parseInt(req.query.batch) || 1;

    const start = (batch - 1) * limit;
    const end = start + limit;

    const selectedBlocks = pdfQuestionsCache.slice(start, end);
    if (!selectedBlocks.length) {
      return res.json({ success: true, parsedQuestions: [], hasMore: false });
    }

    const parsedQuestions = [];
    for (const q of selectedBlocks) {
      try {
        const parsed = await extractQuestionJSON(q);
        parsedQuestions.push(parsed);
      } catch (err) {
        console.warn("⚠️ Failed to parse block:", err.message);
      }
    }

    res.json({
      success: true,
      parsedQuestions,
      hasMore: end < pdfQuestionsCache.length,
    });
  } catch (err) {
    console.error("❌ Batch Parse Error:", err);
    res
      .status(500)
      .json({ error: "Failed to parse batch", details: err.message });
  }
};
