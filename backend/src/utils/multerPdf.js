const multer = require("multer");

// Store PDF in memory instead of saving to disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
