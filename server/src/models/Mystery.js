import mongoose from 'mongoose';

const mysterySchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true, index: true },
  scenario: { type: String, required: true }, genre: String, difficulty: String, status: { type: String, enum: ['generating', 'ready', 'failed'], default: 'ready' },
  title: String, summary: String, setting: mongoose.Schema.Types.Mixed, incident: mongoose.Schema.Types.Mixed,
  suspects: [mongoose.Schema.Types.Mixed], timeline: [mongoose.Schema.Types.Mixed], evidence: [mongoose.Schema.Types.Mixed],
  solution: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true, minimize: false });

export const Mystery = mongoose.model('Mystery', mysterySchema);
