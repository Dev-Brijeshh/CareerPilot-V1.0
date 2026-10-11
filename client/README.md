# CareerPilot AI — Client

React 18 + Vite frontend. See `/CareerPilot_AI_Technical_Documentation.pdf` at the repo root for
the full architecture — this file is just a quick reference.

## Setup

```bash
cp .env.example .env   # VITE_API_URL, defaults to /api (uses the dev proxy)
npm install
npm run dev              # http://localhost:5173
```

Requires the backend (`../server`) running on `http://localhost:5000` — Vite's dev-server proxy
forwards `/api/*` requests to it automatically (see `vite.config.js`).

## Scripts

```bash
npm run dev        # start the dev server
npm run build        # production build → dist/
npm run preview        # locally preview the production build
npm run lint             # ESLint
npm test                  # Vitest + React Testing Library
npm run test:watch          # same, in watch mode
npm run coverage              # test coverage report
```

## Structure

- `src/api/` — one thin wrapper module per backend resource, all built on a single configured
  axios instance (`src/api/axios.js`) that handles JWT attachment and 401 redirects
- `src/context/AuthContext.jsx` — global auth state
- `src/components/ui/` — design-system primitives (Button, Card, Modal, ScoreGauge, …)
- `src/components/layout/` — Navbar, Sidebar, Layout, route guards
- `src/pages/` — one folder per feature (auth, resumes, analysis, roadmaps, interviews, profile)
- `src/tests/` — Vitest + React Testing Library test suite
