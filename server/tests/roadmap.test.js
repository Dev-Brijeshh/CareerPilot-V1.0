jest.mock("../services/aiService", () => ({
  analyzeResumeWithAI: jest.fn(),
  generateRoadmapWithAI: jest.fn(),
}));

const request = require("supertest");
const path = require("path");
const app = require("../app");
const { analyzeResumeWithAI, generateRoadmapWithAI } = require("../services/aiService");

const SAMPLE_PDF = path.join(__dirname, "fixtures", "sample-resume.pdf");

const mockAnalysis = {
  summary: "Solid MERN generalist.",
  strengths: ["React fluency"],
  weaknesses: ["Limited DevOps exposure"],
  matchedSkills: ["JavaScript", "React", "Node.js"],
  missingSkills: ["Docker", "AWS", "TypeScript"],
  suggestions: ["Learn containerization", "Add cloud experience"],
};

const mockRoadmap = {
  summary: "A 3-month plan to become job-ready for a Senior Frontend role.",
  missingSkills: ["TypeScript", "Testing", "Docker"],
  milestones: [
    {
      title: "Learn TypeScript fundamentals",
      description: "Convert an existing React project to TypeScript.",
      skills: ["TypeScript"],
      resources: ["TypeScript Handbook"],
      estimatedWeeks: 3,
    },
    {
      title: "Add automated testing",
      description: "Write unit and integration tests with Jest and RTL.",
      skills: ["Jest", "React Testing Library"],
      resources: ["Testing Library docs"],
      estimatedWeeks: 2.4, // intentionally fractional to test rounding
    },
  ],
};

const setupUserWithAnalysis = async () => {
  const registerRes = await request(app).post("/api/auth/register").send({
    name: "Ada Lovelace",
    email: "roadmap-tester@example.com",
    password: "password123",
  });
  const token = registerRes.body.data.token;

  const uploadRes = await request(app)
    .post("/api/resumes/upload")
    .set("Authorization", `Bearer ${token}`)
    .attach("resume", SAMPLE_PDF);

  analyzeResumeWithAI.mockResolvedValue(mockAnalysis);
  const analyzeRes = await request(app)
    .post(`/api/resume/analyze/${uploadRes.body.data.id}`)
    .set("Authorization", `Bearer ${token}`)
    .send({});

  return { token, analysisId: analyzeRes.body.data._id };
};

describe("Roadmaps: POST /api/roadmaps/generate", () => {
  beforeEach(() => {
    generateRoadmapWithAI.mockReset();
    generateRoadmapWithAI.mockResolvedValue(mockRoadmap);
  });

  it("requires a targetRole", async () => {
    const { token, analysisId } = await setupUserWithAnalysis();
    const res = await request(app)
      .post("/api/roadmaps/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ analysisId });
    expect(res.status).toBe(400);
  });

  it("requires a valid analysisId", async () => {
    const { token } = await setupUserWithAnalysis();
    const res = await request(app)
      .post("/api/roadmaps/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetRole: "Senior Frontend Engineer", analysisId: "not-an-id" });
    expect(res.status).toBe(400);
  });

  it("generates a roadmap and rounds fractional milestone weeks", async () => {
    const { token, analysisId } = await setupUserWithAnalysis();
    const res = await request(app)
      .post("/api/roadmaps/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetRole: "Senior Frontend Engineer", analysisId, currentSkills: ["React"] });

    expect(res.status).toBe(201);
    expect(res.body.data.milestones).toHaveLength(2);
    expect(res.body.data.milestones[1].estimatedWeeks).toBe(2); // rounded from 2.4
    expect(res.body.data.milestones[0].status).toBe("not_started");
  });
});

describe("Roadmaps: milestones & listing", () => {
  let token;
  let roadmapId;
  let milestoneId;

  beforeEach(async () => {
    generateRoadmapWithAI.mockReset();
    generateRoadmapWithAI.mockResolvedValue(mockRoadmap);
    const setup = await setupUserWithAnalysis();
    token = setup.token;

    const genRes = await request(app)
      .post("/api/roadmaps/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetRole: "Senior Frontend Engineer", analysisId: setup.analysisId });

    roadmapId = genRes.body.data._id;
    milestoneId = genRes.body.data.milestones[0]._id;
  });

  it("lists the user's roadmaps", async () => {
    const res = await request(app)
      .get("/api/roadmaps")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("fetches a roadmap by id with the resume analysis populated", async () => {
    const res = await request(app)
      .get(`/api/roadmaps/${roadmapId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.resumeAnalysis).toBeTruthy();
  });

  it("updates a milestone's status to completed", async () => {
    const res = await request(app)
      .patch(`/api/roadmaps/${roadmapId}/milestones/${milestoneId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "completed" });

    expect(res.status).toBe(200);
    const updated = res.body.data.milestones.find((m) => m._id === milestoneId);
    expect(updated.status).toBe("completed");
    expect(updated.completedAt).not.toBeNull();
  });

  it("rejects an invalid milestone status", async () => {
    const res = await request(app)
      .patch(`/api/roadmaps/${roadmapId}/milestones/${milestoneId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "almost_done" });
    expect(res.status).toBe(400);
  });
});
