const evidenceTypes = new Set(['message', 'image', 'cctv', 'document', 'witness_statement', 'access_log', 'other']);
const isDate = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value));
const unique = (items) => new Set(items).size === items.length;

export function validateMystery(m, expectedSuspectCount) {
  const errors = [];
  if (!m || typeof m !== 'object') return ['Output must be a JSON object'];
  for (const key of ['title', 'summary', 'genre', 'difficulty']) if (typeof m[key] !== 'string' || !m[key].trim()) errors.push(`Missing ${key}`);
  for (const key of ['setting', 'incident', 'solution']) if (!m[key] || typeof m[key] !== 'object') errors.push(`Missing ${key}`);
  if (!Array.isArray(m.suspects) || m.suspects.length < 3 || m.suspects.length > 6) errors.push('Suspects must contain 3 to 6 records');
  if (expectedSuspectCount && m.suspects?.length !== expectedSuspectCount) errors.push(`Exactly ${expectedSuspectCount} suspects are required`);
  if (!Array.isArray(m.evidence) || m.evidence.length < 4) errors.push('At least four evidence records are required');
  if (!Array.isArray(m.timeline) || !m.timeline.length) errors.push('Timeline must contain events');
  const suspects = m.suspects || []; const evidence = m.evidence || []; const timeline = m.timeline || [];
  const suspectIds = suspects.map(x => x?.id); const evidenceIds = evidence.map(x => x?.id); const eventIds = timeline.map(x => x?.id);
  if (suspectIds.some(x => typeof x !== 'string' || !x) || !unique(suspectIds)) errors.push('Suspect IDs must be present and unique');
  if (evidenceIds.some(x => typeof x !== 'string' || !x) || !unique(evidenceIds)) errors.push('Evidence IDs must be present and unique');
  if (eventIds.some(x => typeof x !== 'string' || !x) || !unique(eventIds)) errors.push('Timeline event IDs must be present and unique');
  const suspectSet = new Set(suspectIds); const evidenceSet = new Set(evidenceIds); const eventSet = new Set(eventIds);
  if (!suspectSet.has(m.solution?.culpritId)) errors.push('Canonical culprit must match a suspect ID');
  if (typeof m.solution?.explanation !== 'string' || !m.solution.explanation.trim()) errors.push('Solution explanation is required');
  const support = m.solution?.supportingEvidenceIds || [];
  if (!Array.isArray(support) || support.length < 2 || support.some(id => !evidenceSet.has(id))) errors.push('Solution must cite at least two valid supporting evidence IDs');
  for (const s of suspects) {
    for (const f of ['name', 'role', 'background', 'motive', 'initialStatement', 'claimedAlibi']) if (typeof s?.[f] !== 'string' || !s[f].trim()) errors.push(`Suspect ${s?.id || '(unknown)'} is missing ${f}`);
    for (const id of s?.evidenceIds || []) if (!evidenceSet.has(id)) errors.push(`Suspect ${s.id} references missing evidence ${id}`);
  }
  for (const e of evidence) {
    if (!evidenceTypes.has(e?.type)) errors.push(`Evidence ${e?.id} has unsupported type`);
    for (const f of ['title', 'description', 'source']) if (typeof e?.[f] !== 'string' || !e[f].trim()) errors.push(`Evidence ${e?.id || '(unknown)'} is missing ${f}`);
    if (e.timestamp && !isDate(e.timestamp)) errors.push(`Evidence ${e.id} has invalid timestamp`);
    for (const id of e.relatedSuspectIds || []) if (!suspectSet.has(id)) errors.push(`Evidence ${e.id} references missing suspect ${id}`);
    for (const id of e.relatedEvidenceIds || []) if (!evidenceSet.has(id)) errors.push(`Evidence ${e.id} references missing evidence ${id}`);
    for (const id of e.timelineEventIds || []) if (!eventSet.has(id)) errors.push(`Evidence ${e.id} references missing timeline event ${id}`);
    if (e.type === 'image' && (!e.content?.visualDescription || !e.content?.altText || e.content.mediaUrl)) errors.push(`Image ${e.id} must be a labeled visual brief without an invented URL`);
    if (e.type === 'cctv' && (!Array.isArray(e.content?.events) || !e.content?.startTime || !e.content?.endTime)) errors.push(`CCTV ${e.id} requires a simulated sequence and time range`);
    if (e.type === 'message' && (!Array.isArray(e.content?.participants) || !Array.isArray(e.content?.messages))) errors.push(`Message ${e.id} needs participants and messages`);
  }
  for (const event of timeline) {
    if (!isDate(event.timestamp)) errors.push(`Timeline event ${event.id} has invalid timestamp`);
    for (const id of event.relatedSuspectIds || []) if (!suspectSet.has(id)) errors.push(`Timeline event ${event.id} references missing suspect ${id}`);
    for (const id of event.evidenceIds || []) if (!evidenceSet.has(id)) errors.push(`Timeline event ${event.id} references missing evidence ${id}`);
  }
  for (const step of m.solution?.reasoningSteps || []) for (const id of step.evidenceIds || []) if (!evidenceSet.has(id)) errors.push(`Solution step ${step.id} references missing evidence ${id}`);
  for (const id of m.solution?.supportingEvidenceIds || []) if (!evidenceSet.has(id)) errors.push(`Solution references missing evidence ${id}`);
  if (!Array.isArray(m.solution?.reasoningSteps) || !m.solution.reasoningSteps.length) errors.push('Solution reasoning steps are required');
  const ordered = timeline.filter(x => isDate(x.timestamp)).map(x => Date.parse(x.timestamp));
  if (ordered.some((t, i) => i > 0 && t < ordered[i-1])) errors.push('Timeline entries must be chronologically ordered');
  return [...new Set(errors)];
}
