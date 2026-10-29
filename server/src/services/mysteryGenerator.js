import { randomUUID } from 'node:crypto';
import { buildMysteryPrompt } from '../prompts/mysteryPrompt.js';
import { generateMystery } from './geminiService.js';
import { validateMystery } from './mysteryValidator.js';
import { Mystery } from '../models/Mystery.js';
import { InvestigationSession } from '../models/InvestigationSession.js';

export async function createMystery(input) {
  const count = input.preferences?.suspectCount || (input.difficulty === 'easy' ? 3 : input.difficulty === 'hard' ? 5 : 4);
  input = { ...input, suspectCount: count };
  let candidate; let issues = [];
  for (let attempt = 0; attempt <= 2; attempt += 1) {
    candidate = await generateMystery(buildMysteryPrompt(input, issues.length ? issues.join('; ') : ''));
    issues = validateMystery(candidate, count);
    if (!issues.length) break;
  }
  if (issues.length) throw Object.assign(new Error('The generated case did not pass consistency checks. Please try again.'), { code: 'GENERATION_INVALID', detail: issues });
  const caseId = randomUUID(); const sessionId = randomUUID();
  const doc = await Mystery.create({ ...candidate, caseId, scenario: input.scenario, genre: input.genre, difficulty: input.difficulty, status: 'ready' });
  await InvestigationSession.create({ sessionId, caseId });
  return { caseId, sessionId, title: doc.title, summary: doc.summary, difficulty: doc.difficulty, suspectCount: doc.suspects.length, evidenceCount: doc.evidence.length };
}
