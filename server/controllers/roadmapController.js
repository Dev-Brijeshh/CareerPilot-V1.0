const mongoose = require("mongoose");
const ResumeAnalysis = require("../models/resumeAnalysis");
const CareerRoadmap = require("../models/careerRoadmap");
const { generateRoadmapWithAI } = require("../services/aiService");
const asyncHandler = require("../middleware/asyncHandler");

const generateRoadmap = async (req, res) => {
  try {
    const { analysisId, targetRole, currentSkills = [] } = req.body;
    if (!targetRole || !targetRole.trim()) return res.status(400).json({ success: false, message: "targetRole is required" });
    if (!analysisId || !mongoose.isValidObjectId(analysisId)) return res.status(400).json({ success: false, message: "A valid analysisId is required" });
    if (!Array.isArray(currentSkills)) return res.status(400).json({ success: false, message: "currentSkills must be an array" });

    const analysis = await ResumeAnalysis.findOne({ _id: analysisId, user: req.user._id });
    if (!analysis) return res.status(404).json({ success: false, message: "Resume analysis not found" });

    const aiRoadmap = await generateRoadmapWithAI({ targetRole: targetRole.trim(), currentSkills, analysis });
    const roadmap = await CareerRoadmap.create({
      user: req.user._id, resumeAnalysis: analysis._id, targetRole: targetRole.trim(), currentSkills,
      missingSkills: aiRoadmap.missingSkills || analysis.missingSkills || [], summary: aiRoadmap.summary || "",
      milestones: (aiRoadmap.milestones || []).map((milestone) => ({ ...milestone, estimatedWeeks: Math.max(1, Math.round(milestone.estimatedWeeks || 1)) })),
    });
    res.status(201).json({ success: true, message: "Career roadmap generated successfully", data: roadmap });
  } catch (error) {
    console.error("Roadmap Generation Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate career roadmap", error: error.message });
  }
};

const getMyRoadmaps = asyncHandler(async (req, res) => {
  const roadmaps = await CareerRoadmap.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, message: "Roadmaps fetched successfully", data: roadmaps });
});

const getRoadmapById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid roadmap ID" });
  }
  const roadmap = await CareerRoadmap.findOne({ _id: req.params.id, user: req.user._id }).populate("resumeAnalysis");
  if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found" });
  res.status(200).json({ success: true, message: "Roadmap fetched successfully", data: roadmap });
});

const updateMilestone = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["not_started", "in_progress", "completed"].includes(status)) return res.status(400).json({ success: false, message: "Invalid milestone status" });
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid roadmap ID" });
  }
  const roadmap = await CareerRoadmap.findOne({ _id: req.params.id, user: req.user._id });
  if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found" });
  const milestone = roadmap.milestones.id(req.params.milestoneId);
  if (!milestone) return res.status(404).json({ success: false, message: "Milestone not found" });
  milestone.status = status;
  milestone.completedAt = status === "completed" ? new Date() : null;
  await roadmap.save();
  res.status(200).json({ success: true, message: "Milestone updated successfully", data: roadmap });
});

module.exports = { generateRoadmap, getMyRoadmaps, getRoadmapById, updateMilestone };
