// utils/multer.js
const multer = require("multer");

const storage = multer.memoryStorage(); // store file in memory buffer
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"), false);
    }
  }
});

module.exports = upload;
