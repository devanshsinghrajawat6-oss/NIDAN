const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    patientId: { type: String, required: true, unique: true },
    pseudonymizedId: { type: String, required: true },
    trialId: { type: String, required: true },
    consentStatus: { type: String, enum: ['Consented', 'Withdrawn', 'Pending', 'Expired'], default: 'Pending' },
    consentHash: { type: String },
    consentDate: { type: Date },
    consentExpiryDate: { type: Date },
    ageGroup: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    site: { type: String },
    enrollmentDate: { type: Date },
    status: { type: String, enum: ['Active', 'Completed', 'Withdrawn', 'Screened', 'Screen Failed'], default: 'Screened' },
    dosageLogs: [{
        dosage: String,
        herbBatchId: String,
        recordedBy: String,
        timestamp: { type: Date, default: Date.now },
    }],
    blockchainTxHash: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
