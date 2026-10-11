const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { answerQuestion, completeInterview, generateInterview, getInterviewById, getMyInterviews } = require("../controllers/interviewController");

const router = express.Router();
router.post("/generate", authMiddleware, generateInterview);
router.get("/", authMiddleware, getMyInterviews);
router.patch("/:id/questions/:questionId", authMiddleware, answerQuestion);
router.patch("/:id/complete", authMiddleware, completeInterview);
router.get("/:id", authMiddleware, getInterviewById);
module.exports = router;
