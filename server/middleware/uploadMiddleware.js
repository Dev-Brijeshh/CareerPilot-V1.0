const fs = require("fs");
const multer = require("multer");
const path = require("path");

// Resolve to an absolute path so uploads always land in the same
// place regardless of which directory the process was started from
// (important for nodemon, PM2, Docker, etc.).
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "resumes");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// Allow only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    const error = new Error("Only PDF files are allowed");
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

module.exports = upload;
module.exports.UPLOAD_DIR = UPLOAD_DIR;
