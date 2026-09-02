import { NextResponse } from 'next/server';
import { 
  connectDB, Trial, Patient, User, AdverseEvent, 
  Visit, ProtocolDeviation, Milestone, DataQuery, 
  AuditLog, Consent, Notification, HerbBatch,
  DosageRecord, PatientAdministration 
} from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await connectDB();

    // Clear existing collections
    await Trial.deleteMany({});
    await Patient.deleteMany({});
    await User.deleteMany({});
    await AdverseEvent.deleteMany({});
    await Visit.deleteMany({});
    await ProtocolDeviation.deleteMany({});
    await Milestone.deleteMany({});
    await DataQuery.deleteMany({});
    await AuditLog.deleteMany({});
    await Consent.deleteMany({});
    await Notification.deleteMany({});
    await HerbBatch.deleteMany({});
    await DosageRecord.deleteMany({});
    await PatientAdministration.deleteMany({});

    // 1. Seed Users
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    const usersData = [
      {
        email: 'admin@aiia.gov.in',
        password: hashedPassword,
        name: 'Dr. Rajesh Sharma',
        role: 'Admin',
        organization: 'All India Institute of Ayurveda (AIIA)',
        department: 'Central Clinical Trial Oversight',
        phone: '+91 98765 11001',
        bio: 'Lead System Administrator & Oversight Officer for Ministry of Ayush clinical trials.',
        assignedTrials: ['TR-2025-AYU-001', 'TR-2025-AYU-002', 'TR-2025-AYU-003', 'TR-2025-AYU-004']
      },
      {
        email: 'investigator@aiia.gov.in',
        password: hashedPassword,
        name: 'Prof. Ananya Sen',
        role: 'Investigator',
        organization: 'AIIA New Delhi',
        department: 'Department of Kayachikitsa',
        phone: '+91 98765 22002',
        bio: 'Principal Investigator specializing in Standardization of Ayurvedic Formulations and Neuro-psychiatric trials.',
        assignedTrials: ['TR-2025-AYU-001', 'TR-2025-AYU-003']
      },
      {
        email: 'pv@aiia.gov.in',
        password: hashedPassword,
        name: 'Dr. Vikramaditya Rao',
        role: 'Pharmacovigilance',
        organization: 'National Pharmacovigilance Coordination Centre (NPvCC)',
        department: 'Ayush Safety & ADR Monitoring',
        phone: '+91 98765 33003',
        bio: 'Senior Pharmacovigilance Specialist evaluating herbal ADR reports and WHO-ART/MedDRA coding.',
        assignedTrials: ['TR-2025-AYU-001', 'TR-2025-AYU-002', 'TR-2025-AYU-004']
      },
      {
        email: 'regulator@ayush.gov.in',
        password: hashedPassword,
        name: 'Dr. Sunita Deshmukh',
        role: 'Regulator',
        organization: 'Ministry of Ayush / CDSCO',
        department: 'Ayurveda Regulatory Division',
        phone: '+91 98765 44004',
        bio: 'Regulatory Inspector reviewing CTRI compliance, GCP-Ayurveda adherence, and safety dossiers.',
        assignedTrials: ['TR-2025-AYU-001', 'TR-2025-AYU-002', 'TR-2025-AYU-003', 'TR-2025-AYU-004']
      },
      {
        email: 'ec@aiia.gov.in',
        password: hashedPassword,
        name: 'Dr. Hitesh Varma',
        role: 'Ethics Committee',
        organization: 'Institutional Ethics Committee (IEC-AIIA)',
        department: 'Bioethics & Patient Advocacy',
        phone: '+91 98765 55005',
        bio: 'Member Secretary, Institutional Ethics Committee. Responsible for e-Consent and Protocol approval.',
        assignedTrials: ['TR-2025-AYU-001', 'TR-2025-AYU-002']
      },
      {
        email: 'monitor@aiia.gov.in',
        password: hashedPassword,
        name: 'Priya Nambiar',
        role: 'Monitor',
        organization: 'Clinical Research Organization (CRO)',
        department: 'Quality Assurance & Site Monitoring',
        phone: '+91 98765 66006',
        bio: 'Clinical Research Associate (CRA) performing site audits, source data verification, and queries.',
        assignedTrials: ['TR-2025-AYU-001', 'TR-2025-AYU-002']
      }
    ];
    await User.insertMany(usersData);

    // 2. Seed Trials
    const trialsData = [
      {
        trialId: 'TR-2025-AYU-001',
        name: 'Efficacy of Ashwagandha (Withania somnifera) Extract in Mild-to-Moderate Generalized Anxiety Disorder',
        phase: 'Phase II',
        status: 'Active',
        enrollmentCurrent: 84,
        enrollmentTarget: 120,
        complianceScore: 94.5,
        principalInvestigator: 'Prof. Ananya Sen',
        site: 'AIIA New Delhi',
        herbFormulation: 'Ashwagandha Hydro-Ethanolic Extract (500mg capsules)',
        description: 'A multi-center, randomized, double-blind, placebo-controlled clinical trial evaluating the therapeutic effect of standardized Withania somnifera extract on HAM-A scale and serum cortisol levels.',
        primaryObjective: 'To measure change in Hamilton Anxiety Rating Scale (HAM-A) score at Week 8 compared to baseline.',
        secondaryObjectives: [
          'Assessment of serum salivary cortisol levels',
          'Evaluation of Sleep Quality Index (PSQI)',
          'Safety and tolerability monitoring over 12 weeks'
        ],
        studyDesign: 'Randomized, Double-Blind, Placebo-Controlled Trial',
        blindingType: 'Double-blind',
        randomizationMethod: 'Permuted Block Randomization (1:1 Ratio)',
        multiCentre: true,
        sites: ['AIIA New Delhi', 'IPGT&RA Jamnagar', 'National Institute of Ayurveda Jaipur'],
        protocolVersion: '2.1',
        iecApprovalStatus: 'Approved',
        iecApprovalNumber: 'IEC/AIIA/2024/APP-092',
        iecApprovalDate: new Date('2024-03-15'),
        iecExpiryDate: new Date('2026-03-14'),
        ctriRegistration: 'CTRI/2024/04/065123',
        ctriLastUpdated: new Date('2025-01-10'),
        nextCTRIUpdateDue: new Date('2025-07-10'),
        siteActivationDate: new Date('2024-04-01'),
        firstPatientEnrolledDate: new Date('2024-04-12'),
        nextMonitoringVisitDate: new Date('2025-09-20'),
        lastMonitoringVisitDate: new Date('2025-06-15'),
        protocolDeviations: 2,
        openDataQueries: 3
      },
      {
        trialId: 'TR-2025-AYU-002',
        name: 'Evaluation of Curcumin-Piperine Synergistic Formulation in Knee Osteoarthritis (Sandhigata Vata)',
        phase: 'Phase III',
        status: 'Active',
        enrollmentCurrent: 160,
        enrollmentTarget: 200,
        complianceScore: 98.0,
        principalInvestigator: 'Dr. Ramesh Chandra',
        site: 'IPGT&RA Jamnagar',
        herbFormulation: 'Curcumin 95% Extract (500mg) + Piperine 95% (5mg)',
        description: 'Phase III clinical investigation comparing standardized Ayurvedic Curcumin formulation against standard NSAID therapy for pain mitigation and joint mobility in Sandhigata Vata patients.',
        primaryObjective: 'Reduction in WOMAC Osteoarthritis Index score at 12 weeks.',
        secondaryObjectives: [
          'Measurement of hs-CRP and TNF-alpha inflammatory markers',
          'Rescue medication consumption frequency'
        ],
        studyDesign: 'Active-Controlled Parallel Group Trial',
        blindingType: 'Single-blind',
        randomizationMethod: 'Computer-generated Stratified Randomization',
        multiCentre: true,
        sites: ['IPGT&RA Jamnagar', 'AIIA New Delhi'],
        protocolVersion: '1.4',
        iecApprovalStatus: 'Approved',
        iecApprovalNumber: 'IEC/IPGTRA/2024/412',
        iecApprovalDate: new Date('2024-01-20'),
        iecExpiryDate: new Date('2026-01-19'),
        ctriRegistration: 'CTRI/2024/02/059881',
        ctriLastUpdated: new Date('2025-02-01'),
        nextCTRIUpdateDue: new Date('2025-08-01'),
        siteActivationDate: new Date('2024-02-15'),
        firstPatientEnrolledDate: new Date('2024-03-01'),
        nextMonitoringVisitDate: new Date('2025-10-05'),
        lastMonitoringVisitDate: new Date('2025-05-18'),
        protocolDeviations: 1,
        openDataQueries: 1
      },
      {
        trialId: 'TR-2025-AYU-003',
        name: 'Clinical Evaluation of Aqueous Guduchi (Tinospora cordifolia) Extract in Dengue Thrombocytopenia Recovery',
        phase: 'Phase II',
        status: 'Completed',
        enrollmentCurrent: 100,
        enrollmentTarget: 100,
        complianceScore: 100.0,
        principalInvestigator: 'Prof. Ananya Sen',
        site: 'AIIA New Delhi',
        herbFormulation: 'Guduchi Ghana Vati (500mg tid)',
        description: 'Completed exploratory phase II study evaluating time to platelet count recovery (>100,000/mm³) in febrile patients diagnosed with acute dengue infection.',
        primaryObjective: 'Time in hours to reach platelet threshold of 100,000/mm³ post-initiation.',
        secondaryObjectives: ['Duration of hospital stay', 'Incidence of hemorrhagic complications'],
        studyDesign: 'Open-label Randomized Controlled Trial',
        blindingType: 'Open-label',
        randomizationMethod: 'Simple Randomization',
        multiCentre: false,
        sites: ['AIIA New Delhi'],
        protocolVersion: '1.0',
        iecApprovalStatus: 'Approved',
        iecApprovalNumber: 'IEC/AIIA/2023/APP-140',
        iecApprovalDate: new Date('2023-09-10'),
        iecExpiryDate: new Date('2025-09-09'),
        ctriRegistration: 'CTRI/2023/10/048920',
        ctriLastUpdated: new Date('2024-12-15'),
        nextCTRIUpdateDue: new Date('2025-12-15'),
        siteActivationDate: new Date('2023-10-01'),
        firstPatientEnrolledDate: new Date('2023-10-15'),
        studyCloseOutDate: new Date('2024-11-30'),
        protocolDeviations: 0,
        openDataQueries: 0
      },
      {
        trialId: 'TR-2025-AYU-004',
        name: 'Triphala Extract Powder in Metabolic Syndrome and Hyperlipidemia Management',
        phase: 'Phase I/II',
        status: 'Planned',
        enrollmentCurrent: 0,
        enrollmentTarget: 60,
        complianceScore: 100.0,
        principalInvestigator: 'Dr. Sunita Deshmukh',
        site: 'National Institute of Ayurveda Jaipur',
        herbFormulation: 'Standardized Triphala Churna Tablet (1000mg bid)',
        description: 'Upcoming pilot study to evaluate lipid profile modulation and fasting insulin sensitivity in metabolic syndrome subjects.',
        primaryObjective: 'Mean percentage change in LDL-C and triglycerides at Week 16.',
        secondaryObjectives: ['Change in HbA1c and BMI'],
        studyDesign: 'Double-blind Placebo Controlled Study',
        blindingType: 'Double-blind',
        randomizationMethod: 'Block Randomization',
        multiCentre: false,
        sites: ['National Institute of Ayurveda Jaipur'],
        protocolVersion: '1.0',
        iecApprovalStatus: 'Approved',
        iecApprovalNumber: 'IEC/NIA/2025/APP-014',
        iecApprovalDate: new Date('2025-02-10'),
        iecExpiryDate: new Date('2027-02-09'),
        ctriRegistration: 'CTRI/2025/03/071002',
        ctriLastUpdated: new Date('2025-03-01'),
        nextCTRIUpdateDue: new Date('2025-09-01'),
        siteActivationDate: new Date('2025-09-15'),
        protocolDeviations: 0,
        openDataQueries: 0
      }
    ];
    await Trial.insertMany(trialsData);

    // 3. Seed Patients
    const patientsData = [
      {
        patientId: 'PT-1001',
        pseudonymizedId: 'AYU-ASH-001-A',
        fullName: 'Rahul Sharma',
        address: 'Sector 14, Dwarka, New Delhi',
        dateOfBirth: new Date('1988-06-14'),
        gender: 'Male',
        contactNumber: '+91 98112 34567',
        abhaId: '91-4521-8890-1234',
        dosage: '500mg twice daily with warm water post meals',
        armAssigned: 'Ashwagandha Extract Arm (500mg bid)',
        randomizationNumber: 'RND-ASH-001',
        trialId: 'TR-2025-AYU-001',
        site: 'AIIA New Delhi',
        consentStatus: 'Consented',
        consentDate: new Date('2024-04-15'),
        screeningDate: new Date('2024-04-12'),
        enrolmentDate: new Date('2024-04-15'),
        randomizationDate: new Date('2024-04-16'),
        blockchainTxHash: '0x8f3c7b2a9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
        consentBlockchainHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
      },
      {
        patientId: 'PT-1002',
        pseudonymizedId: 'AYU-ASH-002-B',
        fullName: 'Meena Kumari',
        address: 'Vasant Kunj, New Delhi',
        dateOfBirth: new Date('1992-11-20'),
        gender: 'Female',
        contactNumber: '+91 98711 98765',
        abhaId: '91-3322-9900-5544',
        dosage: 'Placebo capsule twice daily',
        armAssigned: 'Placebo Control Arm',
        randomizationNumber: 'RND-ASH-002',
        trialId: 'TR-2025-AYU-001',
        site: 'AIIA New Delhi',
        consentStatus: 'Consented',
        consentDate: new Date('2024-04-18'),
        screeningDate: new Date('2024-04-16'),
        enrolmentDate: new Date('2024-04-18'),
        randomizationDate: new Date('2024-04-19'),
        blockchainTxHash: '0x3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c',
        consentBlockchainHash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b'
      },
      {
        patientId: 'PT-1003',
        pseudonymizedId: 'AYU-ASH-003-C',
        fullName: 'Suresh Patel',
        address: 'Navrangpura, Ahmedabad',
        dateOfBirth: new Date('1975-03-05'),
        gender: 'Male',
        contactNumber: '+91 94260 11223',
        abhaId: '91-1122-3344-5566',
        dosage: '500mg twice daily with warm water post meals',
        armAssigned: 'Ashwagandha Extract Arm (500mg bid)',
        randomizationNumber: 'RND-ASH-003',
        trialId: 'TR-2025-AYU-001',
        site: 'IPGT&RA Jamnagar',
        consentStatus: 'Consented',
        consentDate: new Date('2024-05-02'),
        screeningDate: new Date('2024-04-28'),
        enrolmentDate: new Date('2024-05-02'),
        randomizationDate: new Date('2024-05-03'),
        blockchainTxHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
        consentBlockchainHash: '0x4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c'
      },
      {
        patientId: 'PT-2001',
        pseudonymizedId: 'AYU-CUR-001-A',
        fullName: 'Vikram Singh',
        address: 'GIDC Colony, Jamnagar, Gujarat',
        dateOfBirth: new Date('1965-08-12'),
        gender: 'Male',
        contactNumber: '+91 98251 44332',
        abhaId: '91-7788-9900-1122',
        dosage: 'Curcumin 500mg + Piperine 5mg capsule bid',
        armAssigned: 'Curcumin Active Formulation Arm',
        randomizationNumber: 'RND-CUR-001',
        trialId: 'TR-2025-AYU-002',
        site: 'IPGT&RA Jamnagar',
        consentStatus: 'Consented',
        consentDate: new Date('2024-03-05'),
        screeningDate: new Date('2024-03-01'),
        enrolmentDate: new Date('2024-03-05'),
        randomizationDate: new Date('2024-03-06'),
        blockchainTxHash: '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
        consentBlockchainHash: '0x5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e'
      },
      {
        patientId: 'PT-2002',
        pseudonymizedId: 'AYU-CUR-002-B',
        fullName: 'Sunita Rao',
        address: 'Rajaji Nagar, Bengaluru',
        dateOfBirth: new Date('1970-12-04'),
        gender: 'Female',
        contactNumber: '+91 99001 22334',
        abhaId: '91-5566-7788-9900',
        dosage: 'Aceclofenac 100mg bid (Active Comparator)',
        armAssigned: 'Standard NSAID Control Arm',
        randomizationNumber: 'RND-CUR-002',
        trialId: 'TR-2025-AYU-002',
        site: 'IPGT&RA Jamnagar',
        consentStatus: 'Consented',
        consentDate: new Date('2024-03-10'),
        screeningDate: new Date('2024-03-08'),
        enrolmentDate: new Date('2024-03-10'),
        randomizationDate: new Date('2024-03-11'),
        blockchainTxHash: '0x6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f',
        consentBlockchainHash: '0x8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b'
      },
      {
        patientId: 'PT-3001',
        pseudonymizedId: 'AYU-GUD-001-A',
        fullName: 'Kavita Joshi',
        address: 'Lajpat Nagar, New Delhi',
        dateOfBirth: new Date('1995-04-18'),
        gender: 'Female',
        contactNumber: '+91 98109 87654',
        abhaId: '91-9988-7766-5544',
        dosage: 'Guduchi Ghana Vati 500mg tid',
        armAssigned: 'Guduchi Ghana Vati Arm',
        randomizationNumber: 'RND-GUD-001',
        trialId: 'TR-2025-AYU-003',
        site: 'AIIA New Delhi',
        consentStatus: 'Consented',
        consentDate: new Date('2023-10-20'),
        screeningDate: new Date('2023-10-19'),
        enrolmentDate: new Date('2023-10-20'),
        randomizationDate: new Date('2023-10-20'),
        completionDate: new Date('2023-11-05'),
        blockchainTxHash: '0x9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
        consentBlockchainHash: '0x0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d'
      }
    ];
    await Patient.insertMany(patientsData);

    // 4. Seed Adverse Events
    const adverseEventsData = [
      {
        eventId: 'AE-2025-001',
        trialId: 'TR-2025-AYU-001',
        patientId: 'PT-1001',
        eventType: 'AE',
        description: 'Patient reported mild epigastric burning and abdominal fullness 30 minutes after morning dose.',
        medDraCode: '10017954',
        medDraPreferredTerm: 'Dyspepsia / Gastric Discomfort',
        medDraHighLevelTerm: 'Dyspeptic signs and symptoms',
        medDraSystemOrganClass: 'Gastrointestinal disorders',
        whoDrugName: 'Withania somnifera (Ashwagandha)',
        whoDrugAtcCode: 'A13A',
        severity: 'Mild',
        causality: 'Possible',
        outcome: 'Resolved',
        actionTaken: 'None',
        seriousnessReasons: [],
        status: 'Closed',
        dateOccurred: new Date('2024-05-10'),
        dateReported: new Date('2024-05-11'),
        regulatoryDeadline: new Date('2024-05-18'),
        timelyReport: true,
        reportedBy: 'Prof. Ananya Sen',
        blockchainTxHash: '0xae10010020030040050060070080090010011012013014015016017018019020'
      },
      {
        eventId: 'SAE-2025-002',
        trialId: 'TR-2025-AYU-001',
        patientId: 'PT-1002',
        eventType: 'SAE',
        description: 'Acute allergic urticaria with transient facial edema requiring emergency antihistamine administration.',
        medDraCode: '10046735',
        medDraPreferredTerm: 'Urticaria and Angioedema',
        medDraHighLevelTerm: 'Allergic conditions NEC',
        medDraSystemOrganClass: 'Skin and subcutaneous tissue disorders',
        whoDrugName: 'Placebo Vehicle / Excipients',
        whoDrugAtcCode: 'V07A',
        severity: 'Severe',
        causality: 'Unlikely',
        outcome: 'Resolved',
        actionTaken: 'Drug withdrawn',
        seriousnessReasons: ['Required Emergency Medical Intervention / Hospitalization'],
        status: 'Submitted to Regulator',
        dateOccurred: new Date('2024-06-02'),
        dateReported: new Date('2024-06-02T14:30:00'),
        regulatoryDeadline: new Date('2024-06-03T14:30:00'),
        regulatorySubmittedAt: new Date('2024-06-03T10:15:00'),
        timelyReport: true,
        reportedBy: 'Prof. Ananya Sen',
        blockchainTxHash: '0xsae20020030040050060070080090010011012013014015016017018019020021'
      },
      {
        eventId: 'AE-2025-003',
        trialId: 'TR-2025-AYU-002',
        patientId: 'PT-2002',
        eventType: 'ADR',
        description: 'Mild heartburn and epigastric acidity following NSAID comparator administration.',
        medDraCode: '10018249',
        medDraPreferredTerm: 'Gastroesophageal Reflux',
        medDraHighLevelTerm: 'Acid-related GI disorders',
        medDraSystemOrganClass: 'Gastrointestinal disorders',
        whoDrugName: 'Aceclofenac 100mg',
        whoDrugAtcCode: 'M01AB16',
        severity: 'Moderate',
        causality: 'Probable',
        outcome: 'Resolving',
        actionTaken: 'Dose reduced',
        seriousnessReasons: [],
        status: 'Under Review',
        dateOccurred: new Date('2024-04-12'),
        dateReported: new Date('2024-04-13'),
        regulatoryDeadline: new Date('2024-04-20'),
        timelyReport: true,
        reportedBy: 'Dr. Ramesh Chandra',
        blockchainTxHash: '0xadr30030040050060070080090010011012013014015016017018019020021022'
      }
    ];
    await AdverseEvent.insertMany(adverseEventsData);

    // 5. Seed Visits
    const visitsData = [
      {
        visitId: 'VST-1001-V1',
        trialId: 'TR-2025-AYU-001',
        patientId: 'PT-1001',
        visitNumber: 1,
        visitType: 'Screening',
        scheduledDate: new Date('2024-04-12'),
        actualDate: new Date('2024-04-12'),
        status: 'Completed',
        visitWindowDays: { early: 0, late: 0 },
        deviationFlag: false,
        dataComplete: true,
        openQueries: 0,
        notes: 'Screening parameters met. Blood biochemistry and HAM-A baseline recorded.',
        completedBy: 'Prof. Ananya Sen'
      },
      {
        visitId: 'VST-1001-V2',
        trialId: 'TR-2025-AYU-001',
        patientId: 'PT-1001',
        visitNumber: 2,
        visitType: 'Baseline',
        scheduledDate: new Date('2024-04-15'),
        actualDate: new Date('2024-04-15'),
        status: 'Completed',
        visitWindowDays: { early: 1, late: 1 },
        deviationFlag: false,
        dataComplete: true,
        openQueries: 0,
        notes: 'Randomization assigned: Arm A. 4-week investigational drug batch kit delivered.',
        completedBy: 'Prof. Ananya Sen'
      },
      {
        visitId: 'VST-1001-V3',
        trialId: 'TR-2025-AYU-001',
        patientId: 'PT-1001',
        visitNumber: 3,
        visitType: 'Follow-up',
        scheduledDate: new Date('2024-05-13'),
        actualDate: new Date('2024-05-17'),
        status: 'Completed',
        visitWindowDays: { early: 2, late: 2 },
        deviationFlag: true,
        dataComplete: true,
        openQueries: 1,
        notes: 'Follow-up delayed by patient travel. Recorded minor protocol deviation PD-2025-001.',
        completedBy: 'Prof. Ananya Sen'
      },
      {
        visitId: 'VST-2001-V1',
        trialId: 'TR-2025-AYU-002',
        patientId: 'PT-2001',
        visitNumber: 1,
        visitType: 'Screening',
        scheduledDate: new Date('2024-03-01'),
        actualDate: new Date('2024-03-01'),
        status: 'Completed',
        visitWindowDays: { early: 0, late: 0 },
        deviationFlag: false,
        dataComplete: true,
        openQueries: 0,
        notes: 'X-ray knee osteoarthritis grade II confirmed on Kellgren-Lawrence scale.',
        completedBy: 'Dr. Ramesh Chandra'
      },
      {
        visitId: 'VST-2001-V2',
        trialId: 'TR-2025-AYU-002',
        patientId: 'PT-2001',
        visitNumber: 2,
        visitType: 'Baseline',
        scheduledDate: new Date('2024-03-05'),
        actualDate: new Date('2024-03-05'),
        status: 'Completed',
        visitWindowDays: { early: 1, late: 1 },
        deviationFlag: false,
        dataComplete: true,
        openQueries: 0,
        notes: 'WOMAC index baseline scored 64/96. Patient initiated on Curcumin-Piperine formulation.',
        completedBy: 'Dr. Ramesh Chandra'
      }
    ];
    await Visit.insertMany(visitsData);

    // 6. Seed Protocol Deviations
    const deviationsData = [
      {
        deviationId: 'PD-2025-001',
        trialId: 'TR-2025-AYU-001',
        patientId: 'PT-1001',
        visitId: 'VST-1001-V3',
        deviationType: 'Minor',
        category: 'Visit Window Exceeded',
        description: 'Follow-up Visit #3 scheduled for 13-May-2024 was conducted on 17-May-2024 (+4 days, exceeding protocol allowance of ±2 days).',
        impact: 'Low',
        status: 'Closed',
        detectedBy: 'Priya Nambiar (Monitor)',
        detectedDate: new Date('2024-05-18'),
        resolvedDate: new Date('2024-05-22'),
        capaAction: 'Re-scheduled subsequent follow-up visits with automated SMS reminders sent 3 days prior.',
        approvedBy: 'Prof. Ananya Sen',
        blockchainTxHash: '0xpd0010020030040050060070080090010011012013014015016017018019020'
      },
      {
        deviationId: 'PD-2025-002',
        trialId: 'TR-2025-AYU-001',
        patientId: 'PT-1002',
        visitId: 'VST-1002-V2',
        deviationType: 'Major',
        category: 'Informed Consent Process',
        description: 'e-Consent version 2.0 re-consent missing signature timestamp from Principal Investigator prior to dosage kit distribution.',
        impact: 'Medium',
        status: 'CAPA Initiated',
        detectedBy: 'Dr. Vikramaditya Rao (PV)',
        detectedDate: new Date('2024-06-03'),
        capaAction: 'Mandatory re-verification of e-Consent cryptographic signatures in CTMS portal before pharmacy dispenses study medication.',
        approvedBy: 'Dr. Hitesh Varma (IEC)',
        blockchainTxHash: '0xpd0020030040050060070080090010011012013014015016017018019020021'
      }
    ];
    await ProtocolDeviation.insertMany(deviationsData);

    // 7. Seed Milestones
    const milestonesData = [
      {
        milestoneId: 'MS-1001-01',
        trialId: 'TR-2025-AYU-001',
        name: 'Institutional Ethics Committee Approval',
        category: 'Regulatory',
        plannedDate: new Date('2024-03-15'),
        actualDate: new Date('2024-03-15'),
        status: 'Completed',
        alertThresholdDays: 30,
        notes: 'Full protocol and ICF v2.0 approved by IEC-AIIA.'
      },
      {
        milestoneId: 'MS-1001-02',
        trialId: 'TR-2025-AYU-001',
        name: 'Clinical Trials Registry India (CTRI) Registration',
        category: 'Regulatory',
        plannedDate: new Date('2024-04-01'),
        actualDate: new Date('2024-04-02'),
        status: 'Completed',
        alertThresholdDays: 15,
        notes: 'CTRI ID CTRI/2024/04/065123 generated.'
      },
      {
        milestoneId: 'MS-1001-03',
        trialId: 'TR-2025-AYU-001',
        name: 'First Patient Enrolled (FPI)',
        category: 'Enrolment',
        plannedDate: new Date('2024-04-15'),
        actualDate: new Date('2024-04-12'),
        status: 'Completed',
        alertThresholdDays: 10,
        notes: 'Patient PT-1001 screened and enrolled.'
      },
      {
        milestoneId: 'MS-1001-04',
        trialId: 'TR-2025-AYU-001',
        name: '50% Enrolment Target (60 Patients)',
        category: 'Enrolment',
        plannedDate: new Date('2024-09-30'),
        actualDate: new Date('2024-09-25'),
        status: 'Completed',
        alertThresholdDays: 15,
        notes: 'Target achieved across 3 site locations.'
      },
      {
        milestoneId: 'MS-1001-05',
        trialId: 'TR-2025-AYU-001',
        name: 'Interim Safety Analysis & DSMB Review',
        category: 'Analysis',
        plannedDate: new Date('2025-04-15'),
        status: 'In Progress',
        alertThresholdDays: 30,
        notes: 'Unblinded interim safety review by independent Data Safety Monitoring Board.'
      },
      {
        milestoneId: 'MS-2001-01',
        trialId: 'TR-2025-AYU-002',
        name: '80% Enrolment Completion',
        category: 'Enrolment',
        plannedDate: new Date('2025-05-30'),
        actualDate: new Date('2025-05-15'),
        status: 'Completed',
        alertThresholdDays: 20,
        notes: '160 patients actively enrolled out of 200 target.'
      }
    ];
    await Milestone.insertMany(milestonesData);

    // 8. Seed Data Queries
    const dataQueriesData = [
      {
        queryId: 'DQ-2025-001',
        trialId: 'TR-2025-AYU-001',
        patientId: 'PT-1001',
        visitId: 'VST-1001-V3',
        fieldName: 'Serum Cortisol Baseline (mcg/dL)',
        queryText: 'Baseline lab report attached shows value 14.2 mcg/dL but eCRF entry states 12.4 mcg/dL. Please verify and resolve discrepancy.',
        raisedBy: 'Priya Nambiar (Monitor)',
        raisedAt: new Date('2024-05-20'),
        status: 'Closed',
        response: 'eCRF value corrected to match certified central lab transcript (14.2 mcg/dL). Corrected entry signed on ledger.',
        respondedBy: 'Prof. Ananya Sen',
        respondedAt: new Date('2024-05-22'),
        closedAt: new Date('2024-05-22')
      },
      {
        queryId: 'DQ-2025-002',
        trialId: 'TR-2025-AYU-001',
        patientId: 'PT-1002',
        visitId: 'VST-1002-V2',
        fieldName: 'Concomitant Medication - Antihistamine',
        queryText: 'Confirm dosage and emergency treatment duration post SAE notification on 02-June-2024.',
        raisedBy: 'Dr. Vikramaditya Rao (PV)',
        raisedAt: new Date('2024-06-03'),
        status: 'Open'
      }
    ];
    await DataQuery.insertMany(dataQueriesData);

    // 9. Seed Consents
    const consentsData = [
      {
        consentId: 'CNS-1001-01',
        patientId: 'PT-1001',
        trialId: 'TR-2025-AYU-001',
        consentVersion: 'v2.1',
        consentType: 'Initial',
        consentDate: new Date('2024-04-15'),
        witnessName: 'Rajiv Malhotra',
        investigatorName: 'Prof. Ananya Sen',
        informedConsentFormHash: '0x4f8c9b2a1e3d5f7a9b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a',
        eSignature: 'eSIG-AIIA-PT1001-20240415-SECURE-ECDSA',
        blockchainTxHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        status: 'Active'
      },
      {
        consentId: 'CNS-1002-01',
        patientId: 'PT-1002',
        trialId: 'TR-2025-AYU-001',
        consentVersion: 'v2.1',
        consentType: 'Initial',
        consentDate: new Date('2024-04-18'),
        witnessName: 'Sanjay Gupta',
        investigatorName: 'Prof. Ananya Sen',
        informedConsentFormHash: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f',
        eSignature: 'eSIG-AIIA-PT1002-20240418-SECURE-ECDSA',
        blockchainTxHash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        status: 'Active'
      }
    ];
    await Consent.insertMany(consentsData);

    // 10. Seed Notifications
    const notificationsData = [
      {
        type: 'SAE_DEADLINE',
        severity: 'critical',
        title: 'Mandatory 24h SAE Regulatory Filing Due',
        message: 'Serious Adverse Event SAE-2025-002 reported for patient PT-1002 requires mandatory sign-off to CDSCO.',
        trialId: 'TR-2025-AYU-001',
        patientId: 'PT-1002',
        targetRoles: ['Admin', 'Investigator', 'Pharmacovigilance'],
        isRead: false,
        actionUrl: '/dashboard/safety'
      },
      {
        type: 'CTRI_UPDATE',
        severity: 'warning',
        title: 'Bi-annual CTRI Progress Update Due',
        message: 'Trial TR-2025-AYU-001 progress status update to CTRI portal is due within 14 days.',
        trialId: 'TR-2025-AYU-001',
        targetRoles: ['Admin', 'Investigator'],
        isRead: false,
        actionUrl: '/dashboard/trials'
      },
      {
        type: 'MONITORING_VISIT',
        severity: 'info',
        title: 'Upcoming Quality Assurance Audit',
        message: 'Site Audit scheduled for AIIA New Delhi on 20-Sep-2025 by Lead CRA Priya Nambiar.',
        trialId: 'TR-2025-AYU-001',
        targetRoles: ['Investigator', 'Coordinator', 'Monitor'],
        isRead: true,
        actionUrl: '/dashboard/visits'
      }
    ];
    await Notification.insertMany(notificationsData);

    // 11. Seed Audit Logs
    const auditLogsData = [
      {
        action: 'TRIAL_REGISTERED',
        resource: 'Trial',
        resourceId: 'TR-2025-AYU-001',
        userId: 'admin@aiia.gov.in',
        userEmail: 'admin@aiia.gov.in',
        userRole: 'Admin',
        newValue: { trialId: 'TR-2025-AYU-001', name: 'Ashwagandha Anxiety Trial Phase II' },
        ipAddress: '127.0.0.1',
        blockchainTxHash: '0xtrialreg0010020030040050060070080090010011012013014015016017018019',
        timestamp: new Date('2024-04-01')
      },
      {
        action: 'PATIENT_ENROLLED',
        resource: 'Patient',
        resourceId: 'PT-1001',
        userId: 'investigator@aiia.gov.in',
        userEmail: 'investigator@aiia.gov.in',
        userRole: 'Investigator',
        newValue: { patientId: 'PT-1001', pseudonymizedId: 'AYU-ASH-001-A' },
        ipAddress: '127.0.0.1',
        blockchainTxHash: '0xpatientenr0010020030040050060070080090010011012013014015016017018',
        timestamp: new Date('2024-04-15')
      },
      {
        action: 'SAE_REPORTED',
        resource: 'AdverseEvent',
        resourceId: 'SAE-2025-002',
        userId: 'investigator@aiia.gov.in',
        userEmail: 'investigator@aiia.gov.in',
        userRole: 'Investigator',
        newValue: { eventId: 'SAE-2025-002', severity: 'Severe', eventType: 'SAE' },
        ipAddress: '127.0.0.1',
        blockchainTxHash: '0xsaelog0010020030040050060070080090010011012013014015016017018019020',
        timestamp: new Date('2024-06-02')
      }
    ];
    await AuditLog.insertMany(auditLogsData);

    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully!',
      stats: {
        users: usersData.length,
        trials: trialsData.length,
        patients: patientsData.length,
        adverseEvents: adverseEventsData.length,
        visits: visitsData.length,
        deviations: deviationsData.length,
        milestones: milestonesData.length,
        dataQueries: dataQueriesData.length,
        consents: consentsData.length,
        notifications: notificationsData.length,
        auditLogs: auditLogsData.length
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Seed Route Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
