const express = require("express");
const router = express.Router();
const upload = require("../utils/multerPdf");
const { uploadPDF, parseBatch } = require("../controllers/pdfController");
const { protect, mentorOnly } = require("../middleware/isAuthenticated");

// Step 1: Upload PDF
router.post("/upload-pdf", protect, mentorOnly, upload.single("pdf"), uploadPDF);

// Step 2: Parse batch
router.get("/parse-batch", protect, mentorOnly, parseBatch);

module.exports = router;
