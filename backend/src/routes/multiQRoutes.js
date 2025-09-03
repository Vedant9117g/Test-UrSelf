const express = require("express");
const multer = require("multer");
const { parseMultiQ } = require("../controllers/multiQController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Single endpoint: parse multiple questions with answer key
router.post(
  "/parse-multiq",
  upload.fields([{ name: "questions" }, { name: "answerKey" }]),
  parseMultiQ
);

module.exports = router;
