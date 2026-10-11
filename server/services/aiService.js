const OpenAI = require("openai");

const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const stringArray = { type: "array", items: { type: "string" } };

const schemas = {
  resumeAnalysis: {
    type: "object",
    additionalProperties: false,
    required: [
      "summary",
      "strengths",
      "weaknesses",
      "matchedSkills",
      "missingSkills",
      "suggestions",
    ],
    properties: {
      summary: { type: "string" },
      strengths: stringArray,
      weaknesses: stringArray,
      matchedSkills: stringArray,
      missingSkills: stringArray,
      suggestions: stringArray,
    },
  },
  roadmap: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "missingSkills", "milestones"],
    properties: {
      summary: { type: "string" },
      missingSkills: stringArray,
      milestones: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "title",
            "description",
            "skills",
            "resources",
            "estimatedWeeks",
          ],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            skills: stringArray,
            resources: stringArray,
            estimatedWeeks: { type: "number" },
          },
        },
      },
    },
  },
  interviewQuestions: {
    type: "object",
    additionalProperties: false,
    required: ["questions"],
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["question", "category", "difficulty", "expectedFocus"],
          properties: {
            question: { type: "string" },
            category: { type: "string" },
            difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
            expectedFocus: stringArray,
          },
        },
      },
    },
  },
  answerEvaluation: {
    type: "object",
    additionalProperties: false,
    required: ["score", "feedback", "strengths", "improvements"],
    properties: {
      score: { type: "number" },
      feedback: { type: "string" },
      strengths: stringArray,
      improvements: stringArray,
    },
  },
  interviewSummary: {
    type: "object",
    additionalProperties: false,
    required: ["summary", "strengths", "improvements"],
    properties: {
      summary: { type: "string" },
      strengths: stringArray,
      improvements: stringArray,
    },
  },
};

const requestJson = async (name, schema, input) => {
  if (!process.env.GROQ_API_KEY)
    throw new Error("GROQ_API_KEY is not configured");
  const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
  const response = await openai.responses.create({
    model,
    input,
    text: { format: { type: "json_schema", name, strict: true, schema } },
  });
  if (!response.output_text) throw new Error("AI returned an empty response");
  try {
    return JSON.parse(response.output_text);
  } catch (_error) {
    throw new Error("AI returned an invalid structured response");
  }
};

const analyzeResumeWithAI = (resumeText, jobDescription = "") =>
  requestJson(
    "resume_analysis",
    schemas.resumeAnalysis,
    `You are an expert resume analyzer. Analyze only evidence in this resume. ${jobDescription ? `Compare it to this target job description:\n${jobDescription}` : "No target job description was provided; assess general resume quality."}\n\nReturn concise, actionable results. Do not invent skills or experience.\n\nRESUME:\n${resumeText}`,
  );
const generateRoadmapWithAI = ({ targetRole, currentSkills, analysis }) =>
  requestJson(
    "career_roadmap",
    schemas.roadmap,
    `You are a practical career coach. Create an ordered learning roadmap for the target role. Use the candidate data below; do not promise employment or invent qualifications. Create 3 to 8 realistic milestones, each with a positive whole-number estimate in weeks.\n\nTARGET ROLE: ${targetRole}\nCURRENT SKILLS: ${(currentSkills || []).join(", ") || "Not supplied"}\nANALYSIS SUMMARY: ${analysis.summary || "Not supplied"}\nMATCHED SKILLS: ${(analysis.matchedSkills || []).join(", ")}\nMISSING SKILLS: ${(analysis.missingSkills || []).join(", ")}\nSUGGESTIONS: ${(analysis.suggestions || []).join(" | ")}`,
  );
const generateInterviewQuestionsWithAI = ({
  targetRole,
  experienceLevel,
  context,
  questionCount,
}) =>
  requestJson(
    "interview_questions",
    schemas.interviewQuestions,
    `You are an interview coach. Generate exactly ${questionCount} job interview questions for a ${experienceLevel} ${targetRole} candidate. Mix relevant technical, behavioral, and situational questions. expectedFocus must be evaluation points, not model answers.\n\nCANDIDATE CONTEXT:\n${context || "No additional candidate context provided."}`,
  );
const evaluateInterviewAnswerWithAI = ({
  question,
  expectedFocus,
  answer,
  targetRole,
}) =>
  requestJson(
    "answer_evaluation",
    schemas.answerEvaluation,
    `You are an interview coach assessing a candidate for ${targetRole}. Score the answer from 0 to 100 using the question and expected evaluation points. Give constructive, specific feedback.\n\nQUESTION: ${question}\nEXPECTED FOCUS: ${(expectedFocus || []).join(", ")}\nCANDIDATE ANSWER: ${answer}`,
  );
const summarizeInterviewWithAI = ({ targetRole, questions }) =>
  requestJson(
    "interview_summary",
    schemas.interviewSummary,
    `You are an interview coach. Summarize this completed ${targetRole} mock interview using only the evaluations supplied. Be concise and actionable.\n\nRESULTS:\n${questions.map((question) => `Question: ${question.question}\nScore: ${question.score ?? "Not answered"}\nFeedback: ${question.feedback || "Not answered"}`).join("\n\n")}`,
  );

module.exports = {
  analyzeResumeWithAI,
  evaluateInterviewAnswerWithAI,
  generateInterviewQuestionsWithAI,
  generateRoadmapWithAI,
  summarizeInterviewWithAI,
};
