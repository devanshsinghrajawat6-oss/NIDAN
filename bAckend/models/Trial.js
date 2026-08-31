const mongoose = require('mongoose');

const trialSchema = new mongoose.Schema({
    trialId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phase: { type: String, enum: ['Phase I', 'Phase II', 'Phase III', 'Phase IV'], required: true },
    status: { type: String, enum: ['Active', 'Completed', 'Suspended', 'Pending', 'Terminated'], default: 'Pending' },
    therapeuticArea: { type: String, required: true },
    herbFormulation: { type: String },
    principalInvestigator: { type: String, required: true },
    site: { type: String, required: true },
    enrollmentTarget: { type: Number, default: 0 },
    enrollmentCurrent: { type: Number, default: 0 },
    ctriRegistration: { type: String },
    iecApprovalStatus: { type: String, enum: ['Approved', 'Pending', 'Rejected', 'Expired'], default: 'Pending' },
    iecApprovalDate: { type: Date },
    iecExpiryDate: { type: Date },
    complianceScore: { type: Number, min: 0, max: 100, default: 100 },
    startDate: { type: Date },
    expectedEndDate: { type: Date },
    description: { type: String },
    blockchainTxHash: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Trial', trialSchema);
