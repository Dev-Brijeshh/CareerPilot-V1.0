const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  skills: { type: [String], default: [] },
  resources: { type: [String], default: [] },
  estimatedWeeks: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ["not_started", "in_progress", "completed"],
    default: "not_started",
  },
  completedAt: { type: Date, default: null },
});
const careerRoadmapSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    resumeAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ResumeAnalysis",
      default: null,
    },
    targetRole: { type: String, required: true, trim: true },
    currentSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    summary: { type: String, default: "" },
    milestones: { type: [milestoneSchema], default: [] },
  },
  { timestamps: true },
);
module.exports = mongoose.model("CareerRoadmap", careerRoadmapSchema);
