const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadResume,
  getMyResumes,
  getResumeById,
  deleteResume,
} = require("../controllers/resumeControllers");

const router = express.Router();

// Upload Resume
router.post("/upload", authMiddleware, upload.single("resume"), uploadResume);

// Resume History
router.get("/", authMiddleware, getMyResumes);

// Get Single Resume
router.get("/:id", authMiddleware, getResumeById);

// Delete Resume
router.delete("/:id", authMiddleware, deleteResume);

module.exports = router;
