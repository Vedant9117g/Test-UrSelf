const fs = require("fs");
const { uploadMedia } = require("../utils/cloudinary");
const pdfParse = require("pdf-parse");
const { extractQuestionJSON } = require("../utils/genai");

exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded" });
    }

    // 1️⃣ Upload PDF to Cloudinary
    const cloudinaryResponse = await uploadMedia(req.file.path);
    const pdfUrl = cloudinaryResponse.secure_url;

    // 2️⃣ Read file from disk into buffer
    const pdfBuffer = fs.readFileSync(req.file.path);

    // 3️⃣ Parse PDF text
    const pdfText = (await pdfParse(pdfBuffer)).text;

    // 4️⃣ Split into raw questions
    const rawQuestions = pdfText.split(/\n\n/);
    const parsedQuestions = [];

    for (let q of rawQuestions) {
      if (!q.trim()) continue;
      try {
        const parsed = await extractQuestionJSON(q);
        parsedQuestions.push(parsed);
      } catch (err) {
        console.error("❌ Failed to parse question:", q, err.message);
      }
    }

    // 5️⃣ Return questions for frontend preview
    res.json({ pdfUrl, parsedQuestions });
  } catch (err) {
    console.error("❌ PDF Upload Error:", err);
    res.status(500).json({ error: "Failed to upload PDF", details: err.message });
  }
};
