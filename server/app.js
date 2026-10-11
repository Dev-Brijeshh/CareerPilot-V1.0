// app.js
// Express application setup. Kept separate from server.js so it can be
// imported directly by tests (supertest) without opening a real port
// or connecting to MongoDB.

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const sanitizeMiddleware = require("./middleware/sanitizeMiddleware");
const notFoundMiddleware = require("./middleware/notFoundMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const app = express();

// ---- Security & core middleware -----------------------------------------

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : "*",
    credentials: true,
  }),
);

app.use(compression());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Strips any keys starting with `$` or containing `.` from
// req.body/query/params to guard against NoSQL operator injection.
app.use(sanitizeMiddleware);

// A tighter limit specifically on auth endpoints slows down
// brute-force credential guessing without affecting normal browsing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts, please try again later",
  },
});

// ---- Routes ---------------------------------------------------------------

app.get("/", (_req, res) => {
  res.json({ message: "CareerPilot AI API" });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "CareerPilot AI API is running" });
});

// Kept for backwards compatibility with earlier frontend builds.
app.get("/api/test", (_req, res) => {
  res.json({ message: "CareerPilot AI API is running" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/resume/analyze", analysisRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/interviews", interviewRoutes);

// ---- Fallbacks --------------------------------------------------------------

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
