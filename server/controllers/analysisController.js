const Resume = require("../models/resume");
const ResumeAnalysis = require("../models/resumeAnalysis");
const { analyzeResumeWithAI } = require("../services/aiService");
const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");

// ATS Calculation Logic
const calculateATSScore = (resumeText, aiAnalysis) => {
  let score = 0;

  // Make sure arrays exist
  const matchedSkills = Array.isArray(aiAnalysis.matchedSkills)
    ? aiAnalysis.matchedSkills
    : [];

  const strengths = Array.isArray(aiAnalysis.strengths)
    ? aiAnalysis.strengths
    : [];

  const weaknesses = Array.isArray(aiAnalysis.weaknesses)
    ? aiAnalysis.weaknesses
    : [];

  const suggestions = Array.isArray(aiAnalysis.suggestions)
    ? aiAnalysis.suggestions
    : [];

  // 1. Resume has meaningful content
  if (resumeText.length > 500) {
    score += 20;
  } else if (resumeText.length > 250) {
    score += 10;
  }

  // 2. Skills
  if (matchedSkills.length >= 5) {
    score += 20;
  } else if (matchedSkills.length >= 3) {
    score += 15;
  } else if (matchedSkills.length >= 1) {
    score += 10;
  }

  // 3. Strengths
  if (strengths.length >= 4) {
    score += 15;
  } else if (strengths.length >= 2) {
    score += 10;
  } else if (strengths.length >= 1) {
    score += 5;
  }

  // 4. Weaknesses
  if (weaknesses.length <= 2) {
    score += 15;
  } else if (weaknesses.length <= 4) {
    score += 10;
  } else {
    score += 5;
  }

  // 5. Suggestions / Completeness
  if (suggestions.length >= 5) {
    score += 15;
  } else if (suggestions.length >= 3) {
    score += 10;
  } else if (suggestions.length >= 1) {
    score += 5;
  }

  // 6. Professional Summary
  if (aiAnalysis.summary && aiAnalysis.summary.length > 100) {
    score += 15;
  } else if (aiAnalysis.summary) {
    score += 10;
  }

  return Math.min(score, 100);
};

// Analyze Resume
const analyzeResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { jobDescription } = req.body;

    if (!mongoose.isValidObjectId(resumeId)) {
      return res.status(400).json({ success: false, message: "Invalid resume ID" });
    }

    // Find resume belonging to logged-in user
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    // Make sure extracted text exists
    if (!resume.extractedText) {
      return res.status(400).json({
        success: false,
        message: "Resume text could not be extracted",
      });
    }

    // Send resume + job description to AI
    const aiAnalysis = await analyzeResumeWithAI(
      resume.extractedText,
      jobDescription,
    );

    // Calculate ATS score
    const atsScore = calculateATSScore(resume.extractedText, aiAnalysis);

    // Save analysis
    const analysis = await ResumeAnalysis.create({
      user: req.user._id,
      resume: resume._id,

      atsScore,

      summary: aiAnalysis.summary || "",

      strengths: aiAnalysis.strengths || [],

      weaknesses: aiAnalysis.weaknesses || [],

      matchedSkills: aiAnalysis.matchedSkills || [],

      missingSkills: aiAnalysis.missingSkills || [],

      suggestions: aiAnalysis.suggestions || [],
    });

    // Send response
    res.status(201).json({
      success: true,
      message: "Resume analyzed successfully",
      data: analysis,
    });
  } catch (error) {
    console.error("Resume Analysis Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to analyze resume",
      error: error.message,
    });
  }
};

const getAnalysisHistory = asyncHandler(async (req, res) => {
  const analyses = await ResumeAnalysis.find({ user: req.user._id })
    .populate("resume", "fileName skills")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: "Analysis history fetched successfully", data: analyses });
});

const getAnalysisById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.analysisId)) {
    return res.status(400).json({ success: false, message: "Invalid analysis ID" });
  }

  const analysis = await ResumeAnalysis.findOne({ _id: req.params.analysisId, user: req.user._id })
    .populate("resume", "fileName skills createdAt");
  if (!analysis) return res.status(404).json({ success: false, message: "Analysis not found" });

  res.status(200).json({ success: true, message: "Analysis fetched successfully", data: analysis });
});

module.exports = {
  analyzeResume,
  getAnalysisHistory,
  getAnalysisById,
};
