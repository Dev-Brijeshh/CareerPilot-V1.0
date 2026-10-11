const request = require("supertest");
const fs = require("fs");
const path = require("path");
const app = require("../app");
const Resume = require("../models/resume");

const SAMPLE_PDF = path.join(__dirname, "fixtures", "sample-resume.pdf");

const registerAndLogin = async () => {
  const res = await request(app).post("/api/auth/register").send({
    name: "Ada Lovelace",
    email: "resume-tester@example.com",
    password: "password123",
  });
  return res.body.data.token;
};

describe("Resumes: POST /api/resumes/upload", () => {
  let token;

  beforeEach(async () => {
    token = await registerAndLogin();
  });

  it("rejects an upload with no file", async () => {
    const res = await request(app)
      .post("/api/resumes/upload")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("rejects an unauthenticated upload", async () => {
    const res = await request(app)
      .post("/api/resumes/upload")
      .attach("resume", SAMPLE_PDF);
    expect(res.status).toBe(401);
  });

  it("rejects a non-PDF file", async () => {
    const textPath = path.join(__dirname, "fixtures", "not-a-pdf.txt");
    fs.writeFileSync(textPath, "this is not a pdf");

    const res = await request(app)
      .post("/api/resumes/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("resume", textPath);

    expect(res.status).toBe(400);
    fs.unlinkSync(textPath);
  });

  it("uploads a PDF, extracts text, and detects skills", async () => {
    const res = await request(app)
      .post("/api/resumes/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("resume", SAMPLE_PDF);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.skills).toEqual(
      expect.arrayContaining(["JavaScript", "React", "Node.js", "MongoDB", "Express"]),
    );

    const stored = await Resume.findById(res.body.data.id);
    expect(stored.extractedText.length).toBeGreaterThan(0);
    expect(fs.existsSync(stored.filePath)).toBe(true);
  });
});

describe("Resumes: history / detail / delete", () => {
  let token;
  let resumeId;

  beforeEach(async () => {
    token = await registerAndLogin();
    const uploadRes = await request(app)
      .post("/api/resumes/upload")
      .set("Authorization", `Bearer ${token}`)
      .attach("resume", SAMPLE_PDF);
    resumeId = uploadRes.body.data.id;
  });

  it("lists resumes without the extracted text field", async () => {
    const res = await request(app)
      .get("/api/resumes")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].extractedText).toBeUndefined();
  });

  it("fetches a single resume by id", async () => {
    const res = await request(app)
      .get(`/api/resumes/${resumeId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(resumeId);
  });

  it("returns 400 for a malformed id", async () => {
    const res = await request(app)
      .get("/api/resumes/not-an-id")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("returns 404 for another user's resume", async () => {
    const otherToken = await (async () => {
      const r = await request(app).post("/api/auth/register").send({
        name: "Other User",
        email: "other@example.com",
        password: "password123",
      });
      return r.body.data.token;
    })();

    const res = await request(app)
      .get(`/api/resumes/${resumeId}`)
      .set("Authorization", `Bearer ${otherToken}`);
    expect(res.status).toBe(404);
  });

  it("deletes a resume and its file from disk", async () => {
    const before = await Resume.findById(resumeId);
    const filePath = before.filePath;
    expect(fs.existsSync(filePath)).toBe(true);

    const res = await request(app)
      .delete(`/api/resumes/${resumeId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);

    const after = await Resume.findById(resumeId);
    expect(after).toBeNull();
    expect(fs.existsSync(filePath)).toBe(false);
  });
});
