import { Router } from 'express';
import { submitVerdict, revealSolution } from '../controllers/verdictController.js';
import { revealSchema, verdictSchema } from '../schemas/requestSchemas.js';
const router = Router();
const parse = schema => (req, _res, next) => { const result = schema.safeParse(req.body); if (!result.success) { const error = new Error(result.error.issues[0]?.message || 'Invalid request.'); error.status=400; error.code='VALIDATION_ERROR'; return next(error); } req.body=result.data; next(); };
router.post('/:caseId/verdict', parse(verdictSchema), submitVerdict);
router.post('/:caseId/reveal', parse(revealSchema), revealSolution);
export default router;
