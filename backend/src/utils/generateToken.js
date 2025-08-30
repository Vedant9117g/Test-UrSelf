const jwt = require("jsonwebtoken");

const generateToken = (res, user, message) => {
  // Create token
  const token = jwt.sign(
    { id: user._id, role: user.role, examType: user.examType },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Remove sensitive and Mongoose metadata
  const { password, __v, createdAt, updatedAt, ...userData } = user.toObject();

  // Set cookie AND return token in JSON
  return res
    .status(201)
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json({
      message,
      user: userData,
      token,
    });
};

module.exports = generateToken;
