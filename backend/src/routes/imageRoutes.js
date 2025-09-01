// routes/imageRoutes.js
const express = require("express");
const multer = require("multer");
const { extractQuestionFromImage } = require("../utils/genaiVision");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const parsedQuestion = await extractQuestionFromImage(req.file.buffer);

    res.json({ success: true, parsedQuestion });
  } catch (err) {
    console.error("❌ Image parse error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
