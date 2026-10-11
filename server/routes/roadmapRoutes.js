const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { generateRoadmap, getMyRoadmaps, getRoadmapById, updateMilestone } = require("../controllers/roadmapController");

const router = express.Router();
router.post("/generate", authMiddleware, generateRoadmap);
router.get("/", authMiddleware, getMyRoadmaps);
router.get("/:id", authMiddleware, getRoadmapById);
router.patch("/:id/milestones/:milestoneId", authMiddleware, updateMilestone);
module.exports = router;
