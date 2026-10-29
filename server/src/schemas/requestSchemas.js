import { z } from 'zod';
import { env } from '../config/env.js';

export const createMysterySchema = z.object({
  scenario: z.string().trim().min(env.minScenario, `Scenario must be at least ${env.minScenario} characters.`).max(env.maxScenario),
  genre: z.enum(['crime', 'murder mystery', 'missing person', 'theft', 'espionage', 'suspense', 'supernatural mystery', 'mixed genre']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  preferences: z.object({ suspectCount: z.number().int().min(3).max(6).optional(), setting: z.string().trim().max(120).optional() }).optional(),
}).superRefine((data, ctx) => {
  const count = data.preferences?.suspectCount;
  const allowed = data.difficulty === 'easy' ? [3, 4] : data.difficulty === 'hard' ? [4, 5, 6] : [3, 4, 5];
  if (count && !allowed.includes(count)) ctx.addIssue({ code: 'custom', path: ['preferences', 'suspectCount'], message: `Suspect count is invalid for ${data.difficulty} difficulty.` });
});

export const uuidSchema = z.string().uuid();
export const verdictSchema = z.object({ sessionId: uuidSchema, suspectId: z.string().min(1).max(100), explanation: z.string().max(1000).optional() });
export const revealSchema = z.object({ sessionId: uuidSchema });
export const examineSchema = z.object({ evidenceId: z.string().min(1).max(100) });
