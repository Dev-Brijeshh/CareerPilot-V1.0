jest.mock("../services/aiService", () => ({
  generateInterviewQuestionsWithAI: jest.fn(),
  evaluateInterviewAnswerWithAI: jest.fn(),
  summarizeInterviewWithAI: jest.fn(),
}));

const request = require("supertest");
const app = require("../app");
const {
  generateInterviewQuestionsWithAI,
  evaluateInterviewAnswerWithAI,
  summarizeInterviewWithAI,
} = require("../services/aiService");

const mockQuestions = {
  questions: [
    {
      question: "Tell me about a time you optimized a slow React component.",
      category: "Technical",
      difficulty: "medium",
      expectedFocus: ["Profiling", "Memoization", "Measured impact"],
    },
    {
      question: "How do you handle disagreements with a teammate on code review?",
      category: "Behavioral",
      difficulty: "easy",
      expectedFocus: ["Communication", "Empathy", "Resolution"],
    },
  ],
};

const registerAndLogin = async (email = "interview-tester@example.com") => {
  const res = await request(app).post("/api/auth/register").send({
    name: "Ada Lovelace",
    email,
    password: "password123",
  });
  return res.body.data.token;
};

describe("Interviews: POST /api/interviews/generate", () => {
  beforeEach(() => {
    generateInterviewQuestionsWithAI.mockReset();
    generateInterviewQuestionsWithAI.mockResolvedValue(mockQuestions);
  });

  it("requires a targetRole", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/interviews/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("rejects an invalid experienceLevel", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/interviews/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetRole: "Frontend Engineer", experienceLevel: "guru" });
    expect(res.status).toBe(400);
  });

  it("rejects a questionCount outside 1-15", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/interviews/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetRole: "Frontend Engineer", questionCount: 50 });
    expect(res.status).toBe(400);
  });

  it("generates an interview with questions", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/interviews/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetRole: "Frontend Engineer", experienceLevel: "junior", questionCount: 2 });

    expect(res.status).toBe(201);
    expect(res.body.data.questions).toHaveLength(2);
    expect(res.body.data.status).toBe("in_progress");
  });
});

describe("Interviews: answering & completing", () => {
  let token;
  let interviewId;
  let questionIds;

  beforeEach(async () => {
    generateInterviewQuestionsWithAI.mockReset();
    generateInterviewQuestionsWithAI.mockResolvedValue(mockQuestions);
    evaluateInterviewAnswerWithAI.mockReset();
    summarizeInterviewWithAI.mockReset();

    token = await registerAndLogin();
    const genRes = await request(app)
      .post("/api/interviews/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({ targetRole: "Frontend Engineer" });

    interviewId = genRes.body.data._id;
    questionIds = genRes.body.data.questions.map((q) => q._id);
  });

  it("evaluates an answer and stores the score/feedback", async () => {
    evaluateInterviewAnswerWithAI.mockResolvedValue({
      score: 82,
      feedback: "Good structure, could be more specific about metrics.",
      strengths: ["Clear STAR structure"],
      improvements: ["Add measurable impact"],
    });

    const res = await request(app)
      .patch(`/api/interviews/${interviewId}/questions/${questionIds[0]}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ answer: "I profiled the component with React DevTools and memoized expensive calculations." });

    expect(res.status).toBe(200);
    expect(res.body.data.score).toBe(82);
    expect(res.body.data.answeredAt).not.toBeNull();
  });

  it("rejects an empty answer", async () => {
    const res = await request(app)
      .patch(`/api/interviews/${interviewId}/questions/${questionIds[0]}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ answer: "   " });
    expect(res.status).toBe(400);
  });

  it("refuses to complete an interview with zero answered questions", async () => {
    const res = await request(app)
      .patch(`/api/interviews/${interviewId}/complete`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("completes an interview and computes the overall score", async () => {
    evaluateInterviewAnswerWithAI.mockResolvedValueOnce({
      score: 80,
      feedback: "Solid.",
      strengths: [],
      improvements: [],
    });
    evaluateInterviewAnswerWithAI.mockResolvedValueOnce({
      score: 60,
      feedback: "Needs more depth.",
      strengths: [],
      improvements: [],
    });

    await request(app)
      .patch(`/api/interviews/${interviewId}/questions/${questionIds[0]}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ answer: "Answer one." });
    await request(app)
      .patch(`/api/interviews/${interviewId}/questions/${questionIds[1]}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ answer: "Answer two." });

    summarizeInterviewWithAI.mockResolvedValue({
      summary: "Solid overall performance with room to grow on depth.",
      strengths: ["Communicates clearly"],
      improvements: ["Provide more technical depth"],
    });

    const res = await request(app)
      .patch(`/api/interviews/${interviewId}/complete`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("completed");
    expect(res.body.data.overallScore).toBe(70); // average of 80 and 60
  });

  it("lists interview history", async () => {
    const res = await request(app)
      .get("/api/interviews")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});
