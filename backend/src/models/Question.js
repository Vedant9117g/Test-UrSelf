const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },

    questionText: { type: String, required: true },
    options: [{ text: String, isCorrect: Boolean }],
    explanation: { type: String },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },

    year: { type: Number }, // PYQ year
    source: { type: String }, // Mock / PYQ

    tags: [{ type: String }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
