const mongoose = require("mongoose");

const mockTestAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mockTest: { type: mongoose.Schema.Types.ObjectId, ref: "MockTest", required: true },

    score: { type: Number },
    correctAnswers: { type: Number },
    wrongAnswers: { type: Number },
    timeTaken: { type: Number }, // in minutes

    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MockTestAttempt", mockTestAttemptSchema);
