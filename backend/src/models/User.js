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
