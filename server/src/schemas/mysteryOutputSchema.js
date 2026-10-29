const object = (properties, required = Object.keys(properties)) => ({
  type: 'object',
  properties,
  required,
  additionalProperties: false,
});
const string = { type: 'string' };
const strings = { type: 'array', items: string };
const nullableString = { type: ['string', 'null'] };
const idName = object({ id: string, name: string });
const message = object({ senderId: string, text: string, timestamp: string });
const cctvEvent = object({ timestamp: string, description: string });
const evidenceContent = object({
  participants: { type: 'array', items: idName },
  messages: { type: 'array', items: message },
  mediaStatus: { type: 'string', enum: ['placeholder', 'simulated', 'generated', 'unavailable'] },
  mediaUrl: nullableString,
  visualDescription: string,
  generationProvider: nullableString,
  altText: string,
  cameraId: string,
  location: string,
  startTime: string,
  endTime: string,
  events: { type: 'array', items: cctvEvent },
  documentType: string,
  body: string,
  statement: string,
  witness: string,
  fields: object({
    door: string, accessResult: string, authorizedBy: string, location: string,
    time: string, cardId: string, incidentId: string, status: string,
    result: string, recordId: string, subject: string,
  }, []),
}, []);
const suspect = object({
  id: string, name: string, role: string, age: { type: 'integer' }, background: string,
  motive: string, initialStatement: string, claimedAlibi: string,
  portrait: object({ description: string, mediaId: nullableString }),
  evidenceIds: strings,
});
const timelineItem = object({ id: string, timestamp: string, description: string, relatedSuspectIds: strings, evidenceIds: strings });
const evidenceItem = object({
  id: string,
  type: { type: 'string', enum: ['message', 'image', 'cctv', 'document', 'witness_statement', 'access_log', 'other'] },
  title: string, description: string, source: string, timestamp: string,
  content: evidenceContent, relatedSuspectIds: strings, relatedEvidenceIds: strings,
  timelineEventIds: strings, clueLevel: string,
});
const reasoningStep = object({ id: string, description: string, evidenceIds: strings });

export const mysteryOutputSchema = object({
  title: string,
  summary: string,
  genre: string,
  difficulty: string,
  setting: object({ location: string, date: nullableString }),
  incident: object({ type: string, description: string, discoveredAt: string }),
  suspects: { type: 'array', items: suspect },
  timeline: { type: 'array', items: timelineItem },
  evidence: { type: 'array', items: evidenceItem },
  solution: object({ culpritId: string, explanation: string, reasoningSteps: { type: 'array', items: reasoningStep }, supportingEvidenceIds: strings }),
});
