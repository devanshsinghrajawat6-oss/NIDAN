import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI not found. Please add it to your Environment Variables.");
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log(`✅ MongoDB Connected`);
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// ─── Schemas ────────────────────────────────────────────────────────

const TrialSchema = new mongoose.Schema({
    trialId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phase: String,
    status: { type: String, default: 'Active', enum: ['Active', 'Completed', 'Suspended', 'Terminated', 'Planned'] },
    enrollmentCurrent: { type: Number, default: 0 },
    enrollmentTarget: { type: Number, default: 100 },
    complianceScore: { type: Number, default: 100 },
    principalInvestigator: String,
    site: String,
    herbFormulation: String,
    description: String,
    primaryObjective: String,
    secondaryObjectives: [String],
    studyDesign: String,
    blindingType: { type: String, enum: ['Open-label', 'Single-blind', 'Double-blind', 'Triple-blind'], default: 'Open-label' },
    randomizationMethod: String,
    multiCentre: { type: Boolean, default: false },
    sites: [String],
    protocolVersion: { type: String, default: '1.0' },
    // Regulatory
    iecApprovalStatus: { type: String, default: 'Pending', enum: ['Pending', 'Approved', 'Rejected', 'Renewal Required'] },
    iecApprovalNumber: String,
    iecApprovalDate: Date,
    iecExpiryDate: Date,
    ctriRegistration: String,
    ctriLastUpdated: Date,
    nextCTRIUpdateDue: Date,
    // Dates
    siteActivationDate: Date,
    firstPatientEnrolledDate: Date,
    lastPatientEnrolledDate: Date,
    interimAnalysisDate: Date,
    studyCloseOutDate: Date,
    nextMonitoringVisitDate: Date,
    lastMonitoringVisitDate: Date,
    // Quality
    protocolDeviations: { type: Number, default: 0 },
    openDataQueries: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const PatientSchema = new mongoose.Schema({
    patientId: { type: String, required: true, unique: true },
    pseudonymizedId: { type: String, required: true },
    // Mutable PII (MongoDB)
    fullName: { type: String },
    address: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    contactNumber: { type: String },
    abhaId: { type: String },
    // Clinical (blockchain-anchored)
    dosage: { type: String },
    armAssigned: { type: String },
    randomizationNumber: { type: String },
    // Trial assignment
    trialId: { type: String, required: true },
    site: String,
    // Consent
    consentStatus: { type: String, default: 'Consented', enum: ['Consented', 'Withdrawn', 'Re-consent Required', 'Declined'] },
    consentDate: { type: Date, default: Date.now },
    consentVersion: { type: String, default: '1.0' },
    // Timeline
    screeningDate: Date,
    enrolmentDate: Date,
    randomizationDate: Date,
    withdrawalDate: Date,
    withdrawalReason: String,
    completionDate: Date,
    // Blockchain
    blockchainTxHash: String,
    consentBlockchainHash: String,
    createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'Investigator', enum: ['Admin', 'Investigator', 'Coordinator', 'Monitor', 'Pharmacovigilance', 'Regulator', 'Ethics Committee'] },
    organization: { type: String, default: 'All India Institute of Ayurveda (AIIA)' },
    department: { type: String, default: 'Clinical Research & Pharmacovigilance' },
    phone: { type: String, default: '+91 98765 43210' },
    bio: { type: String, default: 'Clinical Trial Administrator supervising Ayurvedic drug research and compliance.' },
    notificationPreferences: {
        saeAlerts: { type: Boolean, default: true },
        complianceAlerts: { type: Boolean, default: true },
        protocolDeviations: { type: Boolean, default: true },
        eConsentSignoffs: { type: Boolean, default: true },
        regulatoryDeadlines: { type: Boolean, default: true },
        digestFrequency: { type: String, default: 'Instant', enum: ['Instant', 'Daily', 'Weekly'] }
    },
    assignedTrials: [String],
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String },
    lastLogin: Date,
    sessionTimeout: { type: Number, default: 15 },
    createdAt: { type: Date, default: Date.now }
});

const ApiKeySchema = new mongoose.Schema({
    keyId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    userEmail: { type: String, required: true },
    maskedToken: { type: String, required: true },
    tokenHash: { type: String, required: true },
    scopes: [{ type: String }],
    expiresAt: Date,
    lastUsed: Date,
    createdAt: { type: Date, default: Date.now }
});

const AdverseEventSchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true },
    trialId: { type: String, required: true },
    patientId: { type: String, required: true },
    eventType: { type: String, enum: ['AE', 'SAE', 'ADR', 'SUSAR'], required: true },
    description: String,
    // MedDRA Coding
    medDraCode: String,
    medDraPreferredTerm: String,
    medDraHighLevelTerm: String,
    medDraSystemOrganClass: String,
    // WHODrug
    whoDrugName: String,
    whoDrugAtcCode: String,
    // Clinical details
    severity: { type: String, enum: ['Mild', 'Moderate', 'Severe', 'Life-threatening', 'Death'], required: true },
    causality: { type: String, enum: ['Certain', 'Probable', 'Possible', 'Unlikely', 'Unclassifiable', 'Not assessable'] },
    outcome: { type: String, enum: ['Resolved', 'Resolving', 'Not resolved', 'Fatal', 'Unknown'] },
    actionTaken: { type: String, enum: ['Drug withdrawn', 'Dose reduced', 'Drug interrupted', 'None', 'Not applicable'] },
    seriousnessReasons: [String],
    // Reporting timeline
    status: { type: String, default: 'Reported', enum: ['Reported', 'Under Review', 'Submitted to Regulator', 'Closed'] },
    dateOccurred: Date,
    dateReported: { type: Date, default: Date.now },
    regulatoryDeadline: Date,
    regulatorySubmittedAt: Date,
    timelyReport: { type: Boolean },
    // Blockchain
    blockchainTxHash: String,
    eSignature: String,
    reportedBy: String,
    createdAt: { type: Date, default: Date.now }
});

// Auto-compute regulatory deadline
AdverseEventSchema.pre('save', function(next) {
    if (this.isNew && this.dateReported) {
        const d = new Date(this.dateReported);
        if (this.eventType === 'SAE' || this.eventType === 'SUSAR') {
            d.setHours(d.getHours() + 24);
        } else {
            d.setDate(d.getDate() + 7);
        }
        this.regulatoryDeadline = d;
    }
    next();
});

const VisitSchema = new mongoose.Schema({
    visitId: { type: String, required: true, unique: true },
    trialId: { type: String, required: true },
    patientId: { type: String, required: true },
    visitNumber: Number,
    visitType: { type: String, enum: ['Screening', 'Baseline', 'Follow-up', 'End-of-study', 'Unscheduled'], default: 'Follow-up' },
    scheduledDate: Date,
    actualDate: Date,
    status: { type: String, enum: ['Scheduled', 'Completed', 'Missed', 'Rescheduled'], default: 'Scheduled' },
    visitWindowDays: { early: Number, late: Number },
    deviationFlag: { type: Boolean, default: false },
    dataComplete: { type: Boolean, default: false },
    openQueries: { type: Number, default: 0 },
    notes: String,
    completedBy: String,
    createdAt: { type: Date, default: Date.now }
});

const ProtocolDeviationSchema = new mongoose.Schema({
    deviationId: { type: String, required: true, unique: true },
    trialId: { type: String, required: true },
    patientId: String,
    visitId: String,
    deviationType: { type: String, enum: ['Major', 'Minor', 'Protocol Waiver'], required: true },
    category: String,
    description: { type: String, required: true },
    impact: { type: String, enum: ['None', 'Low', 'Medium', 'High', 'Patient Safety'] },
    status: { type: String, enum: ['Open', 'Under Review', 'Closed', 'CAPA Initiated'], default: 'Open' },
    detectedBy: String,
    detectedDate: Date,
    resolvedDate: Date,
    capaAction: String,
    approvedBy: String,
    blockchainTxHash: String,
    createdAt: { type: Date, default: Date.now }
});

const MilestoneSchema = new mongoose.Schema({
    milestoneId: { type: String, required: true, unique: true },
    trialId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, enum: ['Regulatory', 'Enrolment', 'Analysis', 'Safety', 'Operational'] },
    plannedDate: Date,
    actualDate: Date,
    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed', 'Delayed', 'At Risk'], default: 'Not Started' },
    alertThresholdDays: { type: Number, default: 30 },
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

const DataQuerySchema = new mongoose.Schema({
    queryId: { type: String, required: true, unique: true },
    trialId: { type: String, required: true },
    patientId: String,
    visitId: String,
    fieldName: String,
    queryText: { type: String, required: true },
    raisedBy: String,
    raisedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Open', 'Answered', 'Closed', 'Cancelled'], default: 'Open' },
    response: String,
    respondedBy: String,
    respondedAt: Date,
    closedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

const AuditLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: String,
    userId: String,
    userEmail: String,
    userRole: String,
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    blockchainTxHash: String,
    timestamp: { type: Date, default: Date.now }
});

const ConsentSchema = new mongoose.Schema({
    consentId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    trialId: { type: String, required: true },
    consentVersion: { type: String, required: true },
    consentType: { type: String, enum: ['Initial', 'Re-consent', 'Amendment', 'Withdrawal'], default: 'Initial' },
    consentDate: { type: Date, default: Date.now },
    witnessName: String,
    investigatorName: String,
    informedConsentFormHash: String,
    eSignature: String,
    blockchainTxHash: String,
    status: { type: String, enum: ['Active', 'Withdrawn', 'Superseded'], default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

const NotificationSchema = new mongoose.Schema({
    type: { type: String, enum: ['SAE_DEADLINE', 'IEC_EXPIRY', 'CTRI_UPDATE', 'MONITORING_VISIT', 'RECONSENT', 'DATA_QUERY', 'ENROLMENT_LAG'], required: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    title: String,
    message: String,
    trialId: String,
    patientId: String,
    targetRoles: [String],
    isRead: { type: Boolean, default: false },
    actionUrl: String,
    createdAt: { type: Date, default: Date.now }
});

const HerbBatchSchema = new mongoose.Schema({
    batchId: { type: String, required: true, unique: true },
    supplierId: { type: String, required: true },
    supplierName: { type: String, required: true },
    herbName: { type: String, required: true },
    harvestDate: Date,
    certificationDetails: {
        gmpCertNumber: String,
        purityTestResults: String,
        pesticideScreeningStatus: { type: String, enum: ['Passed', 'Failed', 'Pending'], default: 'Passed' },
        heavyMetalScreeningStatus: { type: String, enum: ['Passed', 'Failed', 'Pending'], default: 'Passed' },
        certifyingAuthority: String
    },
    status: { type: String, enum: ['Certified', 'In Review', 'Recalled', 'Expired'], default: 'Certified' },
    expiryDate: Date,
    batchHash: String,
    createdAt: { type: Date, default: Date.now }
});

const DosageRecordSchema = new mongoose.Schema({
    dosageId: { type: String, required: true, unique: true },
    trialId: { type: String, required: true },
    herbBatchIds: [{ type: String, required: true }],
    formulationName: { type: String, required: true },
    formulationDate: { type: Date, default: Date.now },
    quantity: String,
    manufacturerDetails: String,
    status: { type: String, enum: ['Active', 'Quarantined', 'Recalled'], default: 'Active' },
    blockchainTxHash: String,
    createdAt: { type: Date, default: Date.now }
});

const PatientAdministrationSchema = new mongoose.Schema({
    administrationId: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    dosageId: { type: String, required: true },
    trialId: { type: String, required: true },
    site: { type: String, required: true },
    administeredAt: { type: Date, default: Date.now },
    administeredBy: String,
    dosageAmount: String,
    notes: String,
    blockchainTxHash: String,
    createdAt: { type: Date, default: Date.now }
});

export const Trial = mongoose.models.Trial || mongoose.model('Trial', TrialSchema);
export const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const AdverseEvent = mongoose.models.AdverseEvent || mongoose.model('AdverseEvent', AdverseEventSchema);
export const Visit = mongoose.models.Visit || mongoose.model('Visit', VisitSchema);
export const ProtocolDeviation = mongoose.models.ProtocolDeviation || mongoose.model('ProtocolDeviation', ProtocolDeviationSchema);
export const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', MilestoneSchema);
export const DataQuery = mongoose.models.DataQuery || mongoose.model('DataQuery', DataQuerySchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export const Consent = mongoose.models.Consent || mongoose.model('Consent', ConsentSchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const ApiKey = mongoose.models.ApiKey || mongoose.model('ApiKey', ApiKeySchema);
export const HerbBatch = mongoose.models.HerbBatch || mongoose.model('HerbBatch', HerbBatchSchema);
export const DosageRecord = mongoose.models.DosageRecord || mongoose.model('DosageRecord', DosageRecordSchema);
export const PatientAdministration = mongoose.models.PatientAdministration || mongoose.model('PatientAdministration', PatientAdministrationSchema);

