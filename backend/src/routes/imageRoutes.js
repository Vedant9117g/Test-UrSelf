// routes/imageRoutes.js
const express = require("express");
const upload = require("../utils/multer");
const { extractQuestionFromImage } = require("../utils/genaiVision");

const router = express.Router();

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const base64Image = req.file.buffer.toString("base64");
    const parsedQuestion = await extractQuestionFromImage(base64Image);

    res.json({ success: true, parsedQuestion });
  } catch (err) {
    console.error("❌ Image parse error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
