const mongoose = require("mongoose");

const vectorStoreSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    embedding: { type: [Number], required: true }, // vector embedding
  },
  { timestamps: true }
);

vectorStoreSchema.index({ embedding: "vector" }); // for vector similarity search

module.exports = mongoose.model("VectorStore", vectorStoreSchema);
