# API reference

All endpoints use `/api/v1` and JSON envelopes: `{ "success": true, "data": ..., "error": null }` or `{ "success": false, "data": null, "error": { "code", "message" } }`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | API and database readiness |
| POST | `/mysteries` | Generate, validate, and persist a mystery; returns `caseId` and `sessionId` |
| GET | `/mysteries/:caseId` | Sanitized case overview |
| GET | `/mysteries/:caseId/suspects` | Public suspect profiles |
| GET | `/mysteries/:caseId/evidence` | Evidence list; supports `type`, `search`, `page`, `limit` |
| GET | `/mysteries/:caseId/evidence/:evidenceId` | One evidence item |
| POST | `/mysteries/:caseId/sessions` | Create an anonymous investigation session |
| POST | `/mysteries/:caseId/sessions/:sessionId/examined` | Record evidence examination; body `{ "evidenceId" }` |
| GET | `/mysteries/:caseId/sessions/:sessionId` | Restore anonymous session progress |
| POST | `/mysteries/:caseId/verdict` | Evaluate and record a guess; body `{ "sessionId", "suspectId", "explanation?" }` |
| POST | `/mysteries/:caseId/reveal` | Explicit solution reveal; body `{ "sessionId" }` |

Case creation is synchronous and rate-limited. It validates Gemini output and permits an initial generation plus at most two repair attempts. A case is saved only after passing validation.
