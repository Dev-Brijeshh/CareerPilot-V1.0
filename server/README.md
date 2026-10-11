# CareerPilot AI — Server

Express + MongoDB REST API. See `/CareerPilot_AI_Technical_Documentation.pdf` at the repo root for
the full architecture and API reference — this file is just a quick reference.

## Setup

```bash
cp .env.example .env   # fill in the required variables below
npm install
npm run dev              # nodemon, http://localhost:5000
```

| Variable | Required | Notes |
|---|---|---|
| `PORT` | No | defaults to 5000 |
| `MONGODB_URI` | **Yes** | local `mongod` or MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | long, random string |
| `JWT_EXPIRE` | No | defaults to `7d` |
| `CLIENT_URL` | No | comma-separated allowed frontend origin(s) |
| `GROQ_API_KEY` | Yes, for AI features | get one free at console.groq.com/keys |
| `GROQ_MODEL` | No | defaults to `openai/gpt-oss-20b` |

## Scripts

```bash
npm run dev          # nodemon (auto-restart)
npm start             # plain node, for production
npm test               # Jest + Supertest + mongodb-memory-server
npm run test:watch      # same, in watch mode
npm run check-models     # sanity-checks that all Mongoose models load correctly
```

## API resources

- `/api/auth` — register, login, me, logout
- `/api/users` — profile, change-password, delete account
- `/api/resumes` — upload, list, get, delete
- `/api/resume/analyze` — run an analysis, history, get one
- `/api/roadmaps` — generate, list, get, update a milestone
- `/api/interviews` — generate, list, get, answer a question, complete
- `/api/health` — liveness check

Full request/response shapes for every endpoint are documented in the PDF.
