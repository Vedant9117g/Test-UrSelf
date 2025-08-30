const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },

    solvedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    weakTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
    accuracy: { type: Number, default: 0 }, // %
    streak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProgress", userProgressSchema);
