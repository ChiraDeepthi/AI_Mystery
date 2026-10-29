import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true }, caseId: { type: String, required: true, index: true },
  status: { type: String, enum: ['investigating', 'solved', 'abandoned'], default: 'investigating' },
  examinedEvidenceIds: { type: [String], default: [] }, verdictAttempts: { type: [mongoose.Schema.Types.Mixed], default: [] }, solutionRevealed: { type: Boolean, default: false },
}, { timestamps: true });

export const InvestigationSession = mongoose.model('InvestigationSession', sessionSchema);
