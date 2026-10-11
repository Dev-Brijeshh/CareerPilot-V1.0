const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  expectedFocus: { type: [String], default: [] },
  answer: { type: String, default: "" },
  feedback: { type: String, default: "" },
  strengths: { type: [String], default: [] },
  improvements: { type: [String], default: [] },
  score: { type: Number, min: 0, max: 100, default: null },
  answeredAt: { type: Date, default: null },
});
const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roadmap: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CareerRoadmap",
      default: null,
    },
    targetRole: { type: String, required: true, trim: true },
    experienceLevel: {
      type: String,
      enum: ["entry", "junior", "mid", "senior"],
      default: "entry",
    },
    questions: { type: [questionSchema], default: [] },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    overallScore: { type: Number, min: 0, max: 100, default: null },
    summary: { type: String, default: "" },
    overallStrengths: { type: [String], default: [] },
    overallImprovements: { type: [String], default: [] },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Interview", interviewSchema);
