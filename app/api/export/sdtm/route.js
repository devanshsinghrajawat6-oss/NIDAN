import { NextResponse } from 'next/server';
import { connectDB, Trial, Patient, AdverseEvent, Visit } from '@/lib/db';

// CDISC SDTM Domain Generators

function generateDM(patients, trials) {
  return patients.map(p => {
    const trial = trials.find(t => t.trialId === p.trialId) || {};
    return {
      STUDYID: p.trialId,
      DOMAIN: 'DM',
      USUBJID: p.pseudonymizedId,
      SUBJID: p.patientId,
      RFSTDTC: p.enrolmentDate?.toISOString?.() || '',
      RFENDTC: p.completionDate?.toISOString?.() || p.withdrawalDate?.toISOString?.() || '',
      SITEID: p.site || '',
      ARM: p.armAssigned || '',
      ARMCD: p.armAssigned || '',
      ACTARM: p.armAssigned || '',
      COUNTRY: 'IN',
      DTHFL: '',
      AGE: '', // Not collected to minimise PII in SDTM
      SEX: p.gender === 'Male' ? 'M' : p.gender === 'Female' ? 'F' : 'U',
      RACE: '',
      ETHNIC: '',
    };
  });
}

function generateAE(events) {
  return events.map(e => ({
    STUDYID: e.trialId,
    DOMAIN: 'AE',
    USUBJID: e.patientId,
    AESEQ: 1,
    AETERM: e.description || e.medDraPreferredTerm || '',
    AEDECOD: e.medDraPreferredTerm || '',
    AEHLT: e.medDraHighLevelTerm || '',
    AESOC: e.medDraSystemOrganClass || '',
    AEBODSYS: e.medDraSystemOrganClass || '',
    AESEV: e.severity || '',
    AESER: ['SAE', 'SUSAR'].includes(e.eventType) ? 'Y' : 'N',
    AEREL: e.causality ? e.causality.toUpperCase() : '',
    AEOUT: e.outcome || '',
    AESTDTC: e.dateOccurred?.toISOString?.() || '',
    AEENDTC: '',
    AEMEDDRA: e.medDraCode || '',
    AEBCNSNM: e.whoDrugName || '',
  }));
}

function generateDS(patients) {
  const records = [];
  for (const p of patients) {
    if (p.enrolmentDate) {
      records.push({ STUDYID: p.trialId, DOMAIN: 'DS', USUBJID: p.pseudonymizedId, DSSEQ: 1, DSDECOD: 'ENROLLED', DSSTDTC: p.enrolmentDate.toISOString() });
    }
    if (p.randomizationDate) {
      records.push({ STUDYID: p.trialId, DOMAIN: 'DS', USUBJID: p.pseudonymizedId, DSSEQ: 2, DSDECOD: 'RANDOMIZED', DSSTDTC: p.randomizationDate.toISOString() });
    }
    if (p.withdrawalDate) {
      records.push({ STUDYID: p.trialId, DOMAIN: 'DS', USUBJID: p.pseudonymizedId, DSSEQ: 3, DSDECOD: 'WITHDRAWN', DSTERM: p.withdrawalReason || '', DSSTDTC: p.withdrawalDate.toISOString() });
    }
    if (p.completionDate) {
      records.push({ STUDYID: p.trialId, DOMAIN: 'DS', USUBJID: p.pseudonymizedId, DSSEQ: 3, DSDECOD: 'COMPLETED', DSSTDTC: p.completionDate.toISOString() });
    }
  }
  return records;
}

function generateSV(visits) {
  return visits.map((v, i) => ({
    STUDYID: v.trialId,
    DOMAIN: 'SV',
    USUBJID: v.patientId,
    VISITNUM: v.visitNumber || i + 1,
    VISIT: v.visitType,
    SVSTDTC: v.actualDate?.toISOString?.() || v.scheduledDate?.toISOString?.() || '',
    SVENDTC: v.actualDate?.toISOString?.() || '',
    SVUPDES: v.status === 'Missed' ? 'MISSED' : '',
  }));
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const trialId = searchParams.get('trialId');
    const domain = searchParams.get('domain') || 'ALL';

    const query = trialId ? { trialId } : {};
    const [trials, patients, events, visits] = await Promise.all([
      Trial.find(trialId ? { trialId } : {}),
      Patient.find(query),
      AdverseEvent.find(query),
      Visit.find(query)
    ]);

    const datasets = {};
    if (domain === 'ALL' || domain === 'DM') datasets.DM = generateDM(patients, trials);
    if (domain === 'ALL' || domain === 'AE') datasets.AE = generateAE(events);
    if (domain === 'ALL' || domain === 'DS') datasets.DS = generateDS(patients);
    if (domain === 'ALL' || domain === 'SV') datasets.SV = generateSV(visits);

    return NextResponse.json({
      success: true,
      metadata: {
        standard: 'CDISC SDTM v3.3',
        generatedAt: new Date().toISOString(),
        trialId: trialId || 'ALL',
        domains: Object.keys(datasets)
      },
      datasets
    }, {
      headers: { 'Content-Disposition': `attachment; filename="sdtm_${trialId || 'all'}_${Date.now()}.json"` }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
