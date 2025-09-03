const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");

const userRoutes = require("./routes/userRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const imageRoutes = require("./routes/imageRoutes");
const multiqRoutes = require("./routes/multiQRoutes");

dotenv.config();

const app = express();


const allowedOrigins = [
  "http://localhost:5173", // Local development
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, 
  })
);

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
app.use("/api/pdfs", pdfRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/multiq", multiqRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ success: true, message: "API is running 🚀" });
});

// Error Handler Middleware
app.use(errorHandler);

module.exports = app;
