# CareerPilot AI

AI-powered resume analysis, career roadmaps, and mock interviews — a full-stack MERN
application.

## What's in this repo

```
CareerPilot/
├── server/     Express + MongoDB REST API (see server/README.md)
├── client/     React + Vite frontend (see client/README.md)
└── CareerPilot_AI_Technical_Documentation.pdf   Full architecture & API reference
```

## Quick start

**1. Backend**
```bash
cd server
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, GROQ_API_KEY
npm install
npm run dev             # http://localhost:5000
```

**2. Frontend** (in a second terminal)
```bash
cd client
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

Open `http://localhost:5173` — the dev server proxies `/api/*` straight through to the backend,
so no extra CORS setup is needed locally.

## Running the tests

```bash
cd server && npm install && npm test    # Jest + Supertest + in-memory MongoDB
cd client && npm install && npm test    # Vitest + React Testing Library
```

> **Note:** these test suites were written and carefully hand-verified in a sandboxed environment
> without package-registry network access, so `npm install`/`npm test` could not be executed as
> part of producing this deliverable. Every backend file passed `node --check`, and the entire
> frontend module graph (every `@/` import and named export) was verified by resolving it with
> esbuild. Run the commands above on your own machine to execute the suites for real.

## Read the full documentation

`CareerPilot_AI_Technical_Documentation.pdf` covers, in depth: system architecture, REST API
conventions, JWT authentication internals, MongoDB/Mongoose patterns, file upload & PDF parsing,
the AI integration pattern, every single API endpoint with request/response examples, database
schemas, the frontend architecture, how the two apps communicate, testing strategy, and full setup
& deployment instructions.

## Features

- **Auth** — JWT-based register/login, profile management, password change, account deletion
- **Resumes** — upload a PDF, extract its text, detect skills
- **AI Resume Analysis** — ATS score, matched/missing skills, strengths/weaknesses, suggestions —
  optionally targeted at a specific job description
- **Career Roadmaps** — AI-generated, milestone-by-milestone plans to close skill gaps for a
  target role, with progress tracking
- **Mock Interviews** — AI-generated, role-specific interview questions with per-answer feedback
  and an overall performance summary
