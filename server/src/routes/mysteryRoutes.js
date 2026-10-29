import { Router } from 'express';
import { z } from 'zod';
import { postMystery, getCase, getSuspects, getEvidence, getEvidenceDetail, examineEvidence, createSession, getSessionProgress } from '../controllers/mysteryController.js';
import { createMysterySchema, examineSchema } from '../schemas/requestSchemas.js';
import { generationLimiter } from '../middleware/rateLimiter.js';

const router = Router();
const parse = schema => (req, _res, next) => { const result = schema.safeParse(req.body); if (!result.success) { const error = new Error(result.error.issues[0]?.message || 'Invalid request.'); error.status = 400; error.code = 'VALIDATION_ERROR'; return next(error); } req.body = result.data; next(); };
const id = (req, _res, next) => { const result = z.string().uuid().safeParse(req.params.caseId); if (!result.success) { const error = new Error('Invalid case ID.'); error.status=400; error.code='VALIDATION_ERROR'; return next(error); } next(); };
router.post('/', generationLimiter, parse(createMysterySchema), postMystery);
router.get('/:caseId', id, getCase);
router.get('/:caseId/suspects', id, getSuspects);
router.get('/:caseId/evidence', id, getEvidence);
router.get('/:caseId/evidence/:evidenceId', id, getEvidenceDetail);
router.post('/:caseId/sessions', id, createSession);
router.get('/:caseId/sessions/:sessionId', id, getSessionProgress);
router.post('/:caseId/sessions/:sessionId/examined', id, parse(examineSchema), examineEvidence);
export default router;
