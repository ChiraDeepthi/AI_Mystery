import { randomUUID } from 'node:crypto';
import { Mystery } from '../models/Mystery.js';
import { InvestigationSession } from '../models/InvestigationSession.js';
import { createMystery } from '../services/mysteryGenerator.js';

const fail = (status, code, message) => Object.assign(new Error(message), { status, code });
const success = (res, data, status = 200) => res.status(status).json({ success: true, data, error: null });
const publicSuspect = ({ id, name, role, age, background, motive, initialStatement, claimedAlibi, portrait, evidenceIds }) => ({ id, name, role, age, background, motive, initialStatement, claimedAlibi, portrait, evidenceIds });
const publicEvidence = (item) => ({ id: item.id, type: item.type, title: item.title, description: item.description, source: item.source, timestamp: item.timestamp, content: item.content, relatedSuspectIds: item.relatedSuspectIds || [], relatedEvidenceIds: item.relatedEvidenceIds || [], timelineEventIds: item.timelineEventIds || [], clueLevel: item.clueLevel });

export async function postMystery(req, res, next) {
  try { const data = await createMystery(req.body); return success(res, data, 201); } catch (e) { return next(e); }
}

export async function getCase(req, res, next) {
  try {
    const m = await Mystery.findOne({ caseId: req.params.caseId }).lean();
    if (!m) throw fail(404, 'NOT_FOUND', 'This case file could not be found.');
    return success(res, { caseId: m.caseId, status: m.status, title: m.title, summary: m.summary, genre: m.genre, difficulty: m.difficulty, setting: m.setting, incident: m.incident, timeline: m.timeline, suspects: m.suspects.map(s => ({ id: s.id, name: s.name, role: s.role })), suspectCount: m.suspects.length, evidenceCount: m.evidence.length });
  } catch (e) { return next(e); }
}

export async function getSuspects(req, res, next) {
  try { const m = await Mystery.findOne({ caseId: req.params.caseId, status: 'ready' }).lean(); if (!m) throw fail(404, 'NOT_FOUND', 'This case file could not be found.'); return success(res, m.suspects.map(publicSuspect)); } catch(e) { return next(e); }
}

export async function getEvidence(req, res, next) {
  try {
    const m = await Mystery.findOne({ caseId: req.params.caseId, status: 'ready' }).lean(); if (!m) throw fail(404, 'NOT_FOUND', 'This case file could not be found.');
    const type = req.query.type; const search = String(req.query.search || '').toLowerCase(); const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 50));
    const filtered = m.evidence.filter(e => (!type || e.type === type) && (!search || `${e.title} ${e.description}`.toLowerCase().includes(search)));
    return success(res, { items: filtered.slice((page - 1) * limit, page * limit).map(publicEvidence), page, limit, total: filtered.length });
  } catch(e) { return next(e); }
}

export async function getEvidenceDetail(req, res, next) {
  try { const m = await Mystery.findOne({ caseId: req.params.caseId, status: 'ready' }).lean(); const item = m?.evidence.find(e => e.id === req.params.evidenceId); if (!item) throw fail(404, 'NOT_FOUND', 'This evidence file could not be found.'); return success(res, publicEvidence(item)); } catch(e) { return next(e); }
}

export async function examineEvidence(req, res, next) {
  try {
    const [m, session] = await Promise.all([Mystery.findOne({ caseId: req.params.caseId, status: 'ready' }), InvestigationSession.findOne({ sessionId: req.params.sessionId, caseId: req.params.caseId })]);
    if (!m || !session) throw fail(404, 'SESSION_NOT_FOUND', 'This investigation session could not be found.');
    if (!m.evidence.some(e => e.id === req.body.evidenceId)) throw fail(404, 'NOT_FOUND', 'This evidence file could not be found.');
    await InvestigationSession.updateOne({ _id: session._id }, { $addToSet: { examinedEvidenceIds: req.body.evidenceId } });
    return success(res, { examined: true, evidenceId: req.body.evidenceId });
  } catch(e) { return next(e); }
}

export async function createSession(req, res, next) {
  try { const exists = await Mystery.exists({ caseId: req.params.caseId, status: 'ready' }); if (!exists) throw fail(404, 'NOT_FOUND', 'This case file could not be found.'); const session = await InvestigationSession.create({ sessionId: randomUUID(), caseId: req.params.caseId }); return success(res, { sessionId: session.sessionId }, 201); } catch(e) { return next(e); }
}

export async function getSessionProgress(req, res, next) {
  try {
    const session = await InvestigationSession.findOne({ sessionId: req.params.sessionId, caseId: req.params.caseId }).lean();
    if (!session) throw fail(404, 'SESSION_NOT_FOUND', 'This investigation session could not be found.');
    return success(res, { sessionId: session.sessionId, status: session.status, examinedEvidenceIds: session.examinedEvidenceIds, solutionRevealed: session.solutionRevealed });
  } catch(e) { return next(e); }
}
