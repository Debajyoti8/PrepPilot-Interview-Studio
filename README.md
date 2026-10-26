# PrepPilot — Interview Studio

PrepPilot is a personalized interview-preparation workspace. It creates an AI-assisted interview plan from a job description and candidate profile, provides a question bank, and tracks completion of preparation tasks. This repository started from [ankurdotio/interview-ai-yt](https://github.com/ankurdotio/interview-ai-yt); review that repository’s license and retain attribution to the original author. The PrepPilot branding, dashboard, question bank UI, progress API, deployment configuration, tests, and other modifications in this version are additional work on top of that starting point.

## Features

- Responsive dashboard with plan history and aggregate match score.
- Interview-plan generation using a job description, optional PDF resume, and/or a self-description.
- Requested 3-, 7-, or 14-day preparation roadmap. The model is instructed to create that many days; always verify its output.
- AI-generated technical and behavioral questions plus a curated practice bank with category, search, and difficulty filters. Selecting a saved role adds its generated questions to the bank.
- Preparation task tracker. Completion is stored in MongoDB per authenticated user and interview report.
- Private report retrieval and ownership-checked PDF export.
- API health endpoint at `/api/health`.

## Technology

- Frontend: React, Vite, React Router, Axios, Sass.
- Backend: Node.js, Express, MongoDB/Mongoose, JWT cookies, Multer, PDF parsing, Google GenAI, Puppeteer.

## Requirements

- Node.js 20 or newer recommended.
- MongoDB local instance or MongoDB Atlas database.
- Google GenAI API key for AI report generation.

## Local setup

### 1. Backend

```bash
cd Backend
cp .env.example .env
# Edit .env with your own MongoDB URI, Google GenAI API key, and a long random JWT secret
npm ci
npm run dev
```

On Windows PowerShell, copy the example with `Copy-Item .env.example .env`. Never commit the real `.env` file. The API defaults to port 3000. `FRONTEND_ORIGIN` can be a comma-separated list of allowed frontend origins.

### 2. Frontend

In a second terminal:

```bash
cd Frontend
cp .env.example .env
npm ci
npm run dev
```

For PowerShell use `Copy-Item .env.example .env`. Set `VITE_API_BASE_URL=http://localhost:3000` for local development. Vite normally serves the app at `http://localhost:5173`.

### 3. Verify

- Open `http://localhost:5173`, register an account, and log in.
- Create a plan using a job description and either a text-based PDF resume or a self-description.
- Open the generated report and review technical questions, behavioral questions, skill gaps, and the roadmap.
- Return to the dashboard, open Question bank, select the saved role, and confirm its generated questions appear.
- Open Preparation tracker, select the plan, mark a task complete, refresh, and verify the completion persists.
- Confirm `/api/health` returns `{ "status": "ok" }` from the backend.

## Tests and build

Backend unit tests for preparation-task key validation: `cd Backend && npm test`.

Frontend production build: `cd Frontend && npm ci && npm run build`.

The automated tests currently cover task-key validation. They do not replace integration tests against a real MongoDB database, Google GenAI credentials, browser PDF rendering, or a deployed frontend/backend pair.

## Deployment outline

### Backend on Render

1. Push this repository to a Git host you control, after reviewing license and attribution obligations.
2. Create a Render web service using `render.yaml` (or configure manually with `Backend` as the root directory, `npm ci` as build command, and `npm start` as start command).
3. Configure `MONGO_URI`, `GOOGLE_GENAI_API_KEY`, and `FRONTEND_ORIGIN` in Render’s environment settings. Use the exact deployed frontend origin for `FRONTEND_ORIGIN`. Generate a unique `JWT_SECRET`. Do not place secrets in source code.
4. Confirm `/api/health` returns HTTP 200. Ensure MongoDB Atlas network access permits the deployed backend.

### Frontend on Vercel

1. Import the repository into Vercel and set the project root to `Frontend`.
2. Add `VITE_API_BASE_URL` using the deployed backend origin, without a trailing slash.
3. Deploy. The included `vercel.json` rewrites SPA routes to `index.html`.
4. Update Render’s `FRONTEND_ORIGIN` to the deployed Vercel URL and redeploy the backend. The backend uses secure, `SameSite=None` cookies in production, which require HTTPS.
5. Test registration/login, report generation, report ownership, progress persistence, and PDF export on the deployed pair.

## Security notes

- Do not commit `.env`, API keys, database credentials, JWT secrets, or real user resumes.
- Use a least-privilege database user and restrict MongoDB network access.
- Resume uploads are limited by the backend to PDF files up to 3 MB. PDF text extraction may not work on image-only scans.
- AI output can be inaccurate. Treat match scores and recommendations as coaching aids, not hiring predictions.
- The practice bank contains curated examples and report-specific AI questions; it does not predict a company’s actual interview.
- Review authentication, rate limits, abuse prevention, privacy disclosures, and deployment logs before making the service public.

## Attribution and project ownership

This project is a derivative/customized version of `ankurdotio/interview-ai-yt`. Do not represent the original repository’s code as wholly authored from scratch. In your resume, describe the features you personally implemented, tested, and can explain, and keep a clear attribution notice unless the original license says otherwise.
