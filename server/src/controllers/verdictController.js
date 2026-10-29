import { Mystery } from '../models/Mystery.js';
import { InvestigationSession } from '../models/InvestigationSession.js';
import { evaluateVerdict } from '../services/verdictService.js';

const fail = (status, code, message) => Object.assign(new Error(message), { status, code });
const success = (res, data) => res.json({ success: true, data, error: null });

export async function submitVerdict(req, res, next) {
  try {
    const [m, session] = await Promise.all([Mystery.findOne({ caseId: req.params.caseId, status: 'ready' }), InvestigationSession.findOne({ sessionId: req.body.sessionId, caseId: req.params.caseId })]);
    if (!m || !session) throw fail(404, 'SESSION_NOT_FOUND', 'This investigation session could not be found.');
    if (!m.suspects.some(s => s.id === req.body.suspectId)) throw fail(400, 'INVALID_SUSPECT', 'Select a person from this case.');
    const correct = evaluateVerdict(m, req.body.suspectId);
    session.verdictAttempts.push({ suspectId: req.body.suspectId, correct, submittedAt: new Date(), explanation: req.body.explanation || '' });
    if (correct) session.status = 'solved';
    await session.save();
    return success(res, { correct, message: correct ? 'You identified the culprit.' : 'That conclusion does not match the evidence.', allowRetry: !correct });
  } catch(e) { return next(e); }
}

export async function revealSolution(req, res, next) {
  try {
    const [m, session] = await Promise.all([Mystery.findOne({ caseId: req.params.caseId, status: 'ready' }), InvestigationSession.findOne({ sessionId: req.body.sessionId, caseId: req.params.caseId })]);
    if (!m || !session) throw fail(404, 'SESSION_NOT_FOUND', 'This investigation session could not be found.');
    session.solutionRevealed = true; session.status = session.status === 'solved' ? 'solved' : 'abandoned'; await session.save();
    const culprit = m.suspects.find(s => s.id === m.solution.culpritId);
    const supportingEvidence = m.evidence.filter(e => m.solution.supportingEvidenceIds.includes(e.id)).map(e => ({ id: e.id, title: e.title, description: e.description, type: e.type }));
    const timelineReconstruction = m.timeline.filter(event => event.evidenceIds?.some(id => m.solution.supportingEvidenceIds.includes(id)) || event.relatedSuspectIds?.includes(culprit.id));
    return success(res, { culpritId: m.solution.culpritId, culpritName: culprit.name, explanation: m.solution.explanation, supportingEvidence, reasoningSteps: m.solution.reasoningSteps, timelineReconstruction });
  } catch(e) { return next(e); }
}
