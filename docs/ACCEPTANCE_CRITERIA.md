# Acceptance criteria map

- Mystery creation validates scenario length, genre, difficulty, suspect count, and preferences on the server.
- Gemini generation stays on the server; generated cases pass structural/reference checks before persistence.
- Player APIs return case summaries, suspects, and evidence without the canonical solution.
- Evidence and suspect views support investigation; examination progress is recorded per session.
- Verdicts are evaluated deterministically by the backend and incorrect responses do not name the culprit.
- The solution is returned only by the explicit reveal endpoint for a matching case session.
- The client includes landing, creation, case overview, investigation, verdict, and result routes, including responsive layouts and loading/error states.
- Visual briefs and simulated CCTV are explicitly labeled.
