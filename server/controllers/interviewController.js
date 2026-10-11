const mongoose = require("mongoose");
const CareerRoadmap = require("../models/careerRoadmap");
const Interview = require("../models/interview");
const { evaluateInterviewAnswerWithAI, generateInterviewQuestionsWithAI, summarizeInterviewWithAI } = require("../services/aiService");
const asyncHandler = require("../middleware/asyncHandler");

const validLevels = ["entry", "junior", "mid", "senior"];

const generateInterview = async (req, res) => {
  try {
    const { roadmapId, targetRole, experienceLevel = "entry", questionCount = 8 } = req.body;
    if (!targetRole || !targetRole.trim()) return res.status(400).json({ success: false, message: "targetRole is required" });
    if (!validLevels.includes(experienceLevel)) return res.status(400).json({ success: false, message: "Invalid experienceLevel" });
    if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > 15) return res.status(400).json({ success: false, message: "questionCount must be an integer between 1 and 15" });

    let roadmap = null;
    if (roadmapId) {
      if (!mongoose.isValidObjectId(roadmapId)) return res.status(400).json({ success: false, message: "Invalid roadmapId" });
      roadmap = await CareerRoadmap.findOne({ _id: roadmapId, user: req.user._id });
      if (!roadmap) return res.status(404).json({ success: false, message: "Roadmap not found" });
    }

    const context = roadmap ? `Roadmap summary: ${roadmap.summary}\nCurrent skills: ${roadmap.currentSkills.join(", ")}\nSkills to improve: ${roadmap.missingSkills.join(", ")}` : "";
    const aiInterview = await generateInterviewQuestionsWithAI({ targetRole: targetRole.trim(), experienceLevel, context, questionCount });
    const interview = await Interview.create({ user: req.user._id, roadmap: roadmap ? roadmap._id : null, targetRole: targetRole.trim(), experienceLevel, questions: aiInterview.questions || [] });
    res.status(201).json({ success: true, message: "Mock interview generated successfully", data: interview });
  } catch (error) {
    console.error("Interview Generation Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to generate mock interview", error: error.message });
  }
};

const getMyInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ user: req.user._id }).select("targetRole experienceLevel status overallScore createdAt completedAt questions").sort({ createdAt: -1 });
  res.status(200).json({ success: true, message: "Interview history fetched successfully", data: interviews });
});

const getInterviewById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid interview ID" });
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id }).populate("roadmap", "targetRole summary");
  if (!interview) return res.status(404).json({ success: false, message: "Interview not found" });
  res.status(200).json({ success: true, message: "Interview fetched successfully", data: interview });
});

const answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer || !answer.trim()) return res.status(400).json({ success: false, message: "answer is required" });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid interview ID" });
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id, status: "in_progress" });
    if (!interview) return res.status(404).json({ success: false, message: "Active interview not found" });
    const question = interview.questions.id(req.params.questionId);
    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    const evaluation = await evaluateInterviewAnswerWithAI({ question: question.question, expectedFocus: question.expectedFocus, answer: answer.trim(), targetRole: interview.targetRole });
    question.answer = answer.trim();
    question.score = Math.max(0, Math.min(100, Math.round(evaluation.score || 0)));
    question.feedback = evaluation.feedback || "";
    question.strengths = evaluation.strengths || [];
    question.improvements = evaluation.improvements || [];
    question.answeredAt = new Date();
    await interview.save();
    res.status(200).json({ success: true, message: "Answer evaluated successfully", data: question });
  } catch (error) {
    console.error("Interview Evaluation Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to evaluate answer", error: error.message });
  }
};

const completeInterview = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid interview ID" });
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id, status: "in_progress" });
    if (!interview) return res.status(404).json({ success: false, message: "Active interview not found" });
    const answeredQuestions = interview.questions.filter((question) => question.score !== null);
    if (!answeredQuestions.length) return res.status(400).json({ success: false, message: "Answer at least one question before completing the interview" });

    const summary = await summarizeInterviewWithAI({ targetRole: interview.targetRole, questions: answeredQuestions });
    interview.overallScore = Math.round(answeredQuestions.reduce((total, question) => total + question.score, 0) / answeredQuestions.length);
    interview.summary = summary.summary || "";
    interview.overallStrengths = summary.strengths || [];
    interview.overallImprovements = summary.improvements || [];
    interview.status = "completed";
    interview.completedAt = new Date();
    await interview.save();
    res.status(200).json({ success: true, message: "Interview completed successfully", data: interview });
  } catch (error) {
    console.error("Interview Completion Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to complete interview", error: error.message });
  }
};

module.exports = { answerQuestion, completeInterview, generateInterview, getInterviewById, getMyInterviews };
