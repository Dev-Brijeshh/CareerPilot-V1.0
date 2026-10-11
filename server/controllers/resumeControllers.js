const { PDFParse } = require("pdf-parse");
const fs = require("fs");
const mongoose = require("mongoose");
const Resume = require("../models/resume");
const ResumeAnalysis = require("../models/resumeAnalysis");
const extractSkills = require("../utils/skillExtractor");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Upload a PDF resume, extract its text, and detect skills
// @route   POST /api/resumes/upload
// @access  Private
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload a PDF resume",
    });
  }

  try {
    const pdfBuffer = fs.readFileSync(req.file.path);

    const parser = new PDFParse({ data: pdfBuffer });
    const pdfData = await parser.getText();
    await parser.destroy();

    const extractedText = pdfData.text || "";

    if (!extractedText.trim()) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message:
          "Could not extract any text from this PDF. It may be a scanned image — please upload a text-based PDF.",
      });
    }

    const skills = extractSkills(extractedText);

    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      extractedText,
      skills,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded and parsed successfully",
      data: {
        id: resume._id,
        fileName: resume.fileName,
        skills: resume.skills,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    // Don't leave an orphaned file on disk if parsing/saving failed.
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw error;
  }
});

// @desc    List the logged-in user's uploaded resumes
// @route   GET /api/resumes
// @access  Private
const getMyResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id })
    .select("-extractedText")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Resume history fetched successfully",
    data: resumes,
  });
});

// @desc    Get a single resume (including its extracted text)
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid resume ID" });
  }

  const resume = await Resume.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: "Resume not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Resume fetched successfully",
    data: resume,
  });
});

// @desc    Delete a resume and its analyses/file
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid resume ID" });
  }

  const resume = await Resume.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!resume) {
    return res.status(404).json({
      success: false,
      message: "Resume not found",
    });
  }

  await Resume.findByIdAndDelete(resume._id);
  await ResumeAnalysis.deleteMany({ user: req.user._id, resume: resume._id });

  if (resume.filePath && fs.existsSync(resume.filePath)) {
    fs.unlinkSync(resume.filePath);
  }

  res.status(200).json({
    success: true,
    message: "Resume deleted successfully",
  });
});

module.exports = {
  uploadResume,
  getMyResumes,
  getResumeById,
  deleteResume,
};
