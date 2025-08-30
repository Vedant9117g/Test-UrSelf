const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}


app.use("/api/users", userRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ success: true, message: "API is running 🚀" });
});

// Error Handler Middleware
app.use(errorHandler);

module.exports = app;
