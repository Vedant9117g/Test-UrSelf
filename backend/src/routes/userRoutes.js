const express = require("express");
const { 
  register, 
  login, 
  logout, 
  getUserProfile, 
  updateProfile 
} = require("../controllers/userController");
const { protect, mentorOnly } = require("../middleware/isAuthenticated");
const upload = require("../utils/multer");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/profile", protect, getUserProfile);
router.put("/profile/update", protect, upload.single("avatar"), updateProfile);

module.exports = router;
