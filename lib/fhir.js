import crypto from 'crypto';

/**
 * HL7 FHIR R4 resource transformers.
 * Converts MongoDB documents to FHIR R4 resources for interoperability
 * with EDC systems and ABDM (Ayushman Bharat Digital Mission).
 */

export function trialToFHIRResearchStudy(trial) {
  return {
    resourceType: 'ResearchStudy',
    id: trial.trialId,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/ResearchStudy'],
      lastUpdated: new Date().toISOString()
    },
    identifier: [
      { system: 'https://ctri.nic.in', value: trial.ctriRegistration || trial.trialId },
      { system: 'https://aiia.gov.in/trials', value: trial.trialId }
    ],
    title: trial.name,
    status: mapTrialStatusToFHIR(trial.status),
    phase: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/research-study-phase',
        code: mapPhaseToFHIR(trial.phase),
        display: trial.phase
      }]
    },
    category: [{
      coding: [{
        system: 'http://snomed.info/sct',
        code: '110465008',
        display: 'Ayurvedic Clinical Trial'
      }]
    }],
    description: trial.description || '',
    enrollment: [{
      reference: `Group/${trial.trialId}-enrollment`
    }],
    period: {
      start: trial.siteActivationDate,
      end: trial.studyCloseOutDate
    },
    principalInvestigator: trial.principalInvestigator
      ? { display: trial.principalInvestigator }
      : undefined,
    site: trial.sites?.map(s => ({ display: s })) || [{ display: trial.site }],
    arm: trial.armAssigned
      ? [{ name: trial.armAssigned, type: { text: trial.herbFormulation } }]
      : undefined,
    extension: [
      {
        url: 'https://aiia.gov.in/fhir/StructureDefinition/herb-formulation',
        valueString: trial.herbFormulation
      },
      {
        url: 'https://aiia.gov.in/fhir/StructureDefinition/iec-approval-number',
        valueString: trial.iecApprovalNumber
      }
    ]
  };
}

export function patientToFHIRResearchSubject(patient) {
  return {
    resourceType: 'ResearchSubject',
    id: patient.pseudonymizedId,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/ResearchSubject']
    },
    identifier: [{
      system: 'https://aiia.gov.in/subjects',
      value: patient.pseudonymizedId
    }],
    status: mapConsentStatusToFHIR(patient.consentStatus),
    study: { reference: `ResearchStudy/${patient.trialId}` },
    individual: { reference: `Patient/${patient.pseudonymizedId}` },
    assignedArm: patient.armAssigned,
    period: {
      start: patient.screeningDate || patient.enrolmentDate,
      end: patient.completionDate || patient.withdrawalDate
    }
  };
}

export function adverseEventToFHIR(event) {
  return {
    resourceType: 'AdverseEvent',
    id: event.eventId,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/AdverseEvent']
    },
    identifier: [{ system: 'https://aiia.gov.in/ae', value: event.eventId }],
    actuality: event.eventType === 'ADR' ? 'actual' : 'actual',
    category: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/adverse-event-category',
        code: event.eventType === 'SAE' ? 'serious-adverse-event' : 'adverse-event'
      }]
    }],
    event: event.medDraCode
      ? { coding: [{ system: 'http://www.meddra.org', code: event.medDraCode, display: event.medDraPreferredTerm }] }
      : { text: event.description },
    subject: { reference: `Patient/${event.patientId}` },
    study: [{ reference: `ResearchStudy/${event.trialId}` }],
    date: event.dateOccurred || event.dateReported,
    seriousness: event.eventType === 'SAE' ? {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/adverse-event-seriousness', code: 'Serious' }]
    } : undefined,
    severity: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/adverse-event-severity',
        code: event.severity?.toLowerCase(),
        display: event.severity
      }]
    },
    outcome: event.outcome ? { coding: [{ display: event.outcome }] } : undefined
  };
}

export function consentToFHIRConsent(consent, patient) {
  return {
    resourceType: 'Consent',
    id: consent.consentId,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Consent']
    },
    status: consent.status === 'Active' ? 'active' : 'rejected',
    scope: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/consentscope',
        code: 'research'
      }]
    },
    category: [{
      coding: [{
        system: 'http://loinc.org',
        code: '57016-8',
        display: 'Privacy policy acknowledgement Document'
      }]
    }],
    patient: { reference: `Patient/${consent.patientId}` },
    dateTime: consent.consentDate,
    performer: consent.investigatorName ? [{ display: consent.investigatorName }] : undefined,
    organization: [{ display: 'All India Institute of Ayurveda' }],
    sourceAttachment: {
      contentType: 'application/pdf',
      hash: consent.informedConsentFormHash,
      title: `Informed Consent v${consent.consentVersion}`
    },
    extension: [
      {
        url: 'https://aiia.gov.in/fhir/StructureDefinition/consent-version',
        valueString: consent.consentVersion
      },
      {
        url: 'https://aiia.gov.in/fhir/StructureDefinition/blockchain-tx-hash',
        valueString: consent.blockchainTxHash
      }
    ]
  };
}

// ── Helpers ────────────────────────────────────────────────────────

function mapTrialStatusToFHIR(status) {
  const map = {
    'Active': 'active',
    'Completed': 'completed',
    'Suspended': 'temporarily-closed-to-accrual',
    'Terminated': 'withdrawn',
    'Planned': 'in-review'
  };
  return map[status] || 'active';
}

function mapPhaseToFHIR(phase) {
  const map = {
    'Phase 1': 'phase-1',
    'Phase 2': 'phase-2',
    'Phase 3': 'phase-3',
    'Phase 4': 'phase-4',
    'Observational': 'n-a'
  };
  return map[phase] || 'n-a';
}

function mapConsentStatusToFHIR(status) {
  const map = {
    'Consented': 'on-study',
    'Withdrawn': 'withdrawn',
    'Re-consent Required': 'on-study',
    'Declined': 'off-study'
  };
  return map[status] || 'candidate';
}
