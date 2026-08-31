const mongoose = require('mongoose');

const adverseEventSchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    trialId: { type: String, required: true },
    severity: { type: String, enum: ['AE', 'SAE'], required: true },
    description: { type: String, required: true },
    reportedBy: { type: String, required: true },
    reportedAt: { type: Date, default: Date.now },
    notifiedAt: { type: Date },
    iecNotified: { type: Boolean, default: false },
    status: { type: String, enum: ['Reported', 'Under Investigation', 'Resolved', 'Escalated'], default: 'Reported' },
    resolution: { type: String },
    resolutionDate: { type: Date },
    complianceBreaches: [{ type: String }],
    blockchainTxHash: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AdverseEvent', adverseEventSchema);
