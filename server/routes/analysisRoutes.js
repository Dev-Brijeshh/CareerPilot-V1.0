const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { analyzeResume, getAnalysisHistory, getAnalysisById } = require("../controllers/analysisController");

router.get("/history", authMiddleware, getAnalysisHistory);
router.get("/:analysisId", authMiddleware, getAnalysisById);
router.post("/:resumeId", authMiddleware, analyzeResume);

module.exports = router;
