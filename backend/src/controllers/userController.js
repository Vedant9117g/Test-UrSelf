const { uploadMedia, deleteMediaFromCloudinary } = require("../utils/cloudinary");
const User = require("../models/User");
const Exam = require("../models/Exam");
const Question = require("../models/Question"); 
const Discussion = require("../models/Discussion");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// REGISTER
const register = async (req, res) => {
    try {
        const { name, email, password, phone, role, examType } = req.body;

        if (!name || !email || !password || !phone || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (role === "student" && !examType) {
            return res.status(400).json({ message: "Exam type is required for students" });
        }

        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: "User already exists" });

        const user = await User.create({
            name,
            email,
            phone,
            password,
            role,
            examType: role === "student" ? examType : null,
        });

        return generateToken(res, user, "User registered successfully");
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Email and password are required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) return res.status(401).json({ message: "Invalid credentials" });

        return generateToken(res, user, "Login successful");
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

// LOGOUT
const logout = (req, res) => {
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
    res.json({ message: "User logged out successfully" });
};

// GET USER PROFILE
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("exams") // populate the exam details
            .populate("bookmarks")
            .populate("solvedQuestions")
            .populate("discussionPosts");

        if (!user) return res.status(404).json({ message: "User not found", success: false });

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({ success: false, message: "Failed to load user profile" });
    }
};

// UPDATE PROFILE
// UPDATE PROFILE
const updateProfile = async (req, res) => {
    try {
        // Find user
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Destructure fields from body
        const { name, phone, role, examType, bio, isPremium } = req.body;

        // Update basic fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (bio) user.bio = bio;
        if (typeof isPremium !== "undefined") user.isPremium = isPremium;

        // Update role and examType
        if (role) {
            user.role = role;

            if (role === "student") {
                if (examType) user.examType = examType;
            } else {
                user.examType = null;
            }
        }

        // Handle avatar upload (if file exists)
        if (req.file) {
            // Delete old avatar from Cloudinary
            if (user.avatar) {
                const publicId = user.avatar.split("/").pop().split(".")[0];
                try {
                    await deleteMediaFromCloudinary(publicId);
                } catch (err) {
                    console.error("Failed to delete old avatar:", err);
                }
            }

            // Upload new avatar
            const cloudResponse = await uploadMedia(req.file.path);
            user.avatar = cloudResponse.secure_url;
        }

        // Save updates
        await user.save();

        // Return updated user
        res.json({
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};



module.exports = { register, login, logout, getUserProfile, updateProfile };

