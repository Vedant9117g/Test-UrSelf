const express = require("express");
const router = express.Router();
const upload = require("../utils/multerPdf");
const { uploadPDF } = require("../controllers/pdfController");
const Question = require("../models/Question");
const { protect, mentorOnly } = require("../middleware/isAuthenticated");

// Step 1: Upload and parse PDF
router.post("/upload-pdf", protect, mentorOnly, upload.single("pdf"), uploadPDF);

// Step 2: Save approved questions
router.post("/save-approved", protect, mentorOnly, async (req, res) => {
  const { questions } = req.body;
  try {
    const result = await Question.insertMany(questions);
    res.json({ inserted: result.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save questions" });
  }
});

module.exports = router;  