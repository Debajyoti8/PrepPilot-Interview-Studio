# Release and end-to-end verification checklist

## Automated checks available in this repository

- `cd Backend && npm test`: validates accepted and rejected preparation-task keys.
- `cd Frontend && npm run build`: verifies the production frontend bundle.
- `GET /api/health`: backend liveness check.

## Manual end-to-end smoke test

1. Set up a disposable MongoDB database and valid Google GenAI API key.
2. Start the backend and frontend with the setup in the root README. Confirm `/api/health` returns `200` and `{ "status": "ok" }`.
3. Register a new test user; verify invalid registration and duplicate email/username show a visible error instead of navigating into the app.
4. Log in; refresh the page and verify the authenticated session is restored. Sign out and verify protected routes are no longer accessible.
5. Generate a plan using a role, job description, and self-description only. Confirm a report is saved and the chosen 3-, 7-, or 14-day timeline is reflected in the plan.
6. Repeat using a valid text-based PDF. Try a non-PDF, a PDF over 3 MB, an empty profile, and a blank job description; confirm validation feedback is shown.
7. Open a saved report. Check the technical and behavioral questions, match score, skill gaps, roadmap, and PDF export.
8. Create a second user and attempt to open the first user’s report ID and progress endpoint; requests must return `404` or `401`, never another user’s content.
9. In the Question bank, choose a saved role. Verify the report-generated questions appear, search/category/difficulty filters work, and notes persist for the browser session.
10. In Preparation tracker, check off a task, refresh the page, and verify the task remains complete. Uncheck it and confirm it persists as incomplete. Try a malformed task key and a task index that does not exist; API should reject both.
11. Download the PDF and inspect that it opens correctly. Test an AI response containing unusual HTML-like content.
12. Test responsive layout at mobile, tablet, and desktop widths. Check browser console and backend logs for errors.
13. Deploy backend and frontend, configure production environment variables and CORS origin, then repeat the login, report, progress, and PDF checks on the deployed URLs.

## Limitations of the automated test suite

The current automated suite is a small unit test for task-key validation. A complete live end-to-end run still requires MongoDB, a Google GenAI key, installed frontend dependencies, and a browser. Do not treat deployment as verified until the manual checklist has been completed against the actual environment.
