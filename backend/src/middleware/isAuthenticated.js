const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized, user not found" });
    }

    req.user = user;

    // Ensure the user is either a "captain" or has a "both" role
    if (req.originalUrl.includes("/accept") || req.originalUrl.includes("/reject")) {
      if (user.role !== "captain" && user.role !== "both") {
        return res.status(403).json({ message: "Access denied. Only captains can accept/reject rides." });
      }
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Unauthorized, invalid token" });
  }
};

module.exports = isAuthenticated;