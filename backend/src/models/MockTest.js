const mongoose = require("mongoose");

const mockTestSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    title: { type: String, required: true },
    description: { type: String },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    duration: { type: Number, required: true }, // minutes
    totalMarks: { type: Number },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MockTest", mockTestSchema);
