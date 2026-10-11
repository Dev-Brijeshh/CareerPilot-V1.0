jest.mock("../services/aiService", () => ({
  analyzeResumeWithAI: jest.fn(),
}));

const request = require("supertest");
const path = require("path");
const app = require("../app");
const { analyzeResumeWithAI } = require("../services/aiService");

const SAMPLE_PDF = path.join(__dirname, "fixtures", "sample-resume.pdf");

const mockAnalysis = {
  summary: "Strong full-stack candidate with solid MERN experience.",
  strengths: ["Clear ownership of production React apps", "Good CI/CD exposure", "Mentorship experience"],
  weaknesses: ["No mention of testing frameworks", "No cloud/deployment specifics"],
  matchedSkills: ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
  missingSkills: ["TypeScript", "Docker", "AWS"],
  suggestions: [
    "Add a testing section (Jest/RTL)",
    "Quantify impact with more metrics",
    "Mention cloud deployment experience",
    "List a link to a portfolio or GitHub",
    "Tailor summary to the target job description",
  ],
};

const setupUserWithResume = async () => {
  const registerRes = await request(app).post("/api/auth/register").send({
    name: "Ada Lovelace",
    email: "analysis-tester@example.com",
    password: "password123",
  });
  const token = registerRes.body.data.token;

  const uploadRes = await request(app)
    .post("/api/resumes/upload")
    .set("Authorization", `Bearer ${token}`)
    .attach("resume", SAMPLE_PDF);

  return { token, resumeId: uploadRes.body.data.id };
};

describe("Resume analysis: POST /api/resume/analyze/:resumeId", () => {
  beforeEach(() => {
    analyzeResumeWithAI.mockReset();
    analyzeResumeWithAI.mockResolvedValue(mockAnalysis);
  });

  it("analyzes a resume and computes an ATS score", async () => {
    const { token, resumeId } = await setupUserWithResume();

    const res = await request(app)
      .post(`/api/resume/analyze/${resumeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ jobDescription: "Looking for a MERN stack engineer" });

    expect(res.status).toBe(201);
    expect(res.body.data.atsScore).toBeGreaterThan(0);
    expect(res.body.data.atsScore).toBeLessThanOrEqual(100);
    expect(res.body.data.matchedSkills).toEqual(mockAnalysis.matchedSkills);
    expect(analyzeResumeWithAI).toHaveBeenCalledTimes(1);
  });

  it("returns 404 for a resume that does not belong to the user", async () => {
    const { resumeId } = await setupUserWithResume();
    const otherRes = await request(app).post("/api/auth/register").send({
      name: "Other",
      email: "other-analysis@example.com",
      password: "password123",
    });

    const res = await request(app)
      .post(`/api/resume/analyze/${resumeId}`)
      .set("Authorization", `Bearer ${otherRes.body.data.token}`)
      .send({});

    expect(res.status).toBe(404);
  });

  it("returns 500 with a clear message if the AI call fails", async () => {
    analyzeResumeWithAI.mockRejectedValueOnce(new Error("GROQ_API_KEY is not configured"));
    const { token, resumeId } = await setupUserWithResume();

    const res = await request(app)
      .post(`/api/resume/analyze/${resumeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe("Resume analysis: history & detail", () => {
  beforeEach(() => {
    analyzeResumeWithAI.mockReset();
    analyzeResumeWithAI.mockResolvedValue(mockAnalysis);
  });

  it("lists analysis history newest first", async () => {
    const { token, resumeId } = await setupUserWithResume();
    await request(app)
      .post(`/api/resume/analyze/${resumeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const res = await request(app)
      .get("/api/resume/analyze/history")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].resume.fileName).toBeDefined();
  });

  it("fetches a single analysis by id", async () => {
    const { token, resumeId } = await setupUserWithResume();
    const analyzeRes = await request(app)
      .post(`/api/resume/analyze/${resumeId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const res = await request(app)
      .get(`/api/resume/analyze/${analyzeRes.body.data._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.summary).toBe(mockAnalysis.summary);
  });
});
