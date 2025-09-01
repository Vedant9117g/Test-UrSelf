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
const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    replies: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discussion", discussionSchema);
const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["JEE", "GATE"], required: true },
    description: { type: String },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);
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
const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 3 },

    role: {
      type: String,
      enum: ["student", "admin", "mentor"], // allowed roles
      required: true,
    },

    examType: {
      type: String,
      enum: ["JEE", "GATE"], // exam types
      required: true, // all roles must select one
    },

    exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    solvedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    discussionPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Discussion" }],

    // Gamification
    coins: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    badges: [{ type: String }],

    // Profile
    avatar: { type: String },
    bio: { type: String },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
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
