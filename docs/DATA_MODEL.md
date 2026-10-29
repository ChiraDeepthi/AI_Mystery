# Data model

`Mystery` stores the complete validated case: scenario, genre, difficulty, setting, incident, suspects, timeline, evidence, and canonical solution. `caseId` is a unique UUID. The solution field is excluded by every player-facing serializer.

`InvestigationSession` stores a UUID session ID, case ID, examined evidence IDs, verdict attempts, reveal state, and investigation status. Sessions are anonymous and contain no account or identity data.

Canonical evidence is immutable during play. Examination progress is stored in the session document. Image records contain a visual brief and labeled placeholder metadata; CCTV records contain a simulated timeline.
