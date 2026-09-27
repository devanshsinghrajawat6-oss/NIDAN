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
    age: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    contactNumber: { type: String },
    abhaId: { type: String },
    hospitalRegNumber: { type: String }, // GCP Section C #4
    // Clinical & Assignment
    dosage: { type: String },
    armAssigned: { type: String },
    randomizationNumber: { type: String },
    trialId: { type: String, required: true },
    site: String,
    stage: { type: String, enum: ['Screening', 'Enrolled', 'In-Treatment', 'Follow-up', 'Completed', 'Withdrawn', 'Dropped Out'], default: 'Enrolled' },
    // Consent & GCP Checklist (Section IV.B & B.1)
    consentStatus: { type: String, default: 'Consented', enum: ['Consented', 'Withdrawn', 'Re-consent Required', 'Declined', 'Audio-Visual Recorded'] },
    consentDate: { type: Date, default: Date.now },
    consentVersion: { type: String, default: '1.0' },
    witnessName: String, // GCP IV.B #4 Impartial witness
    administeredByName: String, // GCP IV.B #7
    medicallyQualifiedPerson: { type: Boolean, default: true }, // GCP IV.B #8-9
    audioVisualRecordingDone: { type: Boolean, default: false }, // GCP IV.B.1 (vulnerable pop, NCEs, HIV, Leprosy)
    reConsentDone: { type: Boolean, default: false }, // GCP IV.B #11
    reConsentDate: Date,
    // Baseline Screening & Health Data (GCP IV.A & C)
    inclusionCriteriaMet: { type: Boolean, default: true },
    exclusionCriteriaMet: { type: Boolean, default: false },
    inclusionExclusionNotes: String,
    baselineVitals: {
        bloodPressureSystolic: Number,
        bloodPressureDiastolic: Number,
        pulseRate: Number,
        temperature: Number,
        weight: Number,
        height: Number,
        bmi: Number,
    },
    baselineLabData: {
        haemoglobin: Number,
        wbcCount: Number,
        plateletCount: Number,
        sgot: Number,
        sgpt: Number,
        serumCreatinine: Number,
        fastingBloodSugar: Number,
        urineAnalysisSummary: String,
    },
    diagnosticEvaluations: String, // GCP IV.A #3.3 (X-Ray, MRI, ECG, USG summary)
    // Timeline & Milestones (GCP II & C)
    screeningDate: Date,
    enrolmentDate: Date,
    randomizationDate: Date,
    withdrawalDate: Date,
    withdrawalReason: String, // GCP C #6-7
    lastFollowUpDate: Date, // GCP II #10 (LPLFU)
    completionDate: Date,
    sourceDataVerified: { type: Boolean, default: false }, // GCP C #5
    // Safety & Statutory Compensation (Compensation Formula & GCP C #8-11)
    saeOccurred: { type: Boolean, default: false },
    diseaseRiskFactor: { type: Number, enum: [0.5, 1.0, 2.0, 3.0, 4.0], default: 4.0 }, // F2 scale: 0.5 (Terminal), 1.0 (High), 2.0 (Mod), 3.0 (Mild), 4.0 (Healthy)
    expectedMortality30Days90Percent: { type: Boolean, default: false }, // Fixed Rs 2 Lacs exception
    calculatedCompensation: Number, // Computed B * F * R / 99.37
    concomitantMedications: String, // F7 Concomitant medication
    subjectDiaryMaintained: { type: Boolean, default: true }, // GCP C #1
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

const GcpChecklistSchema = new mongoose.Schema({
    checklistId: { type: String, required: true, unique: true },
    trialId: { type: String, required: true },
    siteName: { type: String, required: true },
    inspectionDate: { type: Date, default: Date.now },
    inspectionTeam: [String],
    personnelPresent: [String],
    investigatorDetails: String,
    sponsorDetails: String,
    stageOfStudy: { type: String, enum: ['Before Trial Commencement', 'During Conduct of trial', 'After Completion of Trial'], default: 'During Conduct of trial' },
    typeOfInspection: { type: String, enum: ['Surveillance', 'For Cause'], default: 'Surveillance' },
    checklistItems: [{
        section: String,
        itemNumber: String,
        description: String,
        status: { type: String, enum: ['Yes', 'No', 'NA'], default: 'Yes' },
        remark: String
    }],
    overallScore: Number,
    auditedBy: String,
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
export const GcpChecklist = mongoose.models.GcpChecklist || mongoose.model('GcpChecklist', GcpChecklistSchema);


