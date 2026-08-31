const mongoose = require('mongoose');

let cachedDb = null;

async function connectDB() {
    if (cachedDb && mongoose.connection.readyState === 1) {
        return cachedDb;
    }
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.warn("⚠️ MONGODB_URI not found. Please add it to your Vercel Environment Variables.");
        throw new Error("MONGODB_URI missing");
    }

    const conn = await mongoose.connect(uri);
    cachedDb = conn.connection;
    console.log(`✅ MongoDB Connected`);
    return cachedDb;
}

// ─── Models ────────────────────────────────────────────────────────
const TrialSchema = new mongoose.Schema({
    trialId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phase: String,
    status: { type: String, default: 'Active' },
    enrollmentCurrent: { type: Number, default: 0 },
    enrollmentTarget: { type: Number, default: 100 },
    complianceScore: { type: Number, default: 100 },
    principalInvestigator: String,
    site: String,
    herbFormulation: String,
    description: String,
    iecApprovalStatus: String,
    iecApprovalDate: String,
    iecExpiryDate: String,
    ctriRegistration: String,
    createdAt: { type: Date, default: Date.now }
});

const PatientSchema = new mongoose.Schema({
    patientId: { type: String, required: true, unique: true },
    pseudonymizedId: { type: String, required: true },
    trialId: { type: String, required: true },
    site: String,
    consentStatus: { type: String, default: 'Consented' },
    consentDate: { type: Date, default: Date.now },
    blockchainTxHash: String,
    createdAt: { type: Date, default: Date.now }
});

const Trial = mongoose.models.Trial || mongoose.model('Trial', TrialSchema);
const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);

module.exports = { connectDB, Trial, Patient };
