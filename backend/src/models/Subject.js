const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
