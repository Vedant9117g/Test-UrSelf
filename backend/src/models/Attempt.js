const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },

    isCorrect: { type: Boolean },
    selectedOption: { type: Number }, // index of chosen option
    timeTaken: { type: Number }, // seconds
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attempt", attemptSchema);
