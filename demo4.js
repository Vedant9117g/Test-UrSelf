const { uploadMedia } = require("../utils/cloudinary");
const pdfParse = require("pdf-parse");
const Question = require("../models/Question");
const Exam = require("../models/Exam");
const Subject = require("../models/Subject");
const Topic = require("../models/Topic");
const { extractQuestionJSON } = require("../utils/genai");

exports.uploadPDF = async (req, res) => {
  try {
    // Upload PDF to Cloudinary
    const cloudinaryResponse = await uploadMedia(req.file.path);
    const pdfUrl = cloudinaryResponse.secure_url;

    // Parse PDF
    const pdfBuffer = req.file.buffer || req.file;
    const pdfText = (await pdfParse(pdfBuffer)).text;

    const rawQuestions = pdfText.split(/\n\n/);
    const parsedQuestions = [];

    for (let q of rawQuestions) {
      if (!q.trim()) continue;

      try {
        const parsed = await extractQuestionJSON(q);

        parsed.exam = await Exam.findOne({ name: parsed.exam })?._id;
        parsed.subject = await Subject.findOne({ name: parsed.subject })?._id;
        parsed.topic = await Topic.findOne({ name: parsed.topic })?._id;

        parsedQuestions.push(parsed);
      } catch (err) {
        console.log("Failed to parse question:", err);
      }
    }

    const result = await Question.insertMany(parsedQuestions);
    res.json({ inserted: result.length, pdfUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload PDF" });
  }
};
