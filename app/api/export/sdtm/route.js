import { NextResponse } from 'next/server';
import { connectDB, Trial, Patient, AdverseEvent, Visit } from '@/lib/db';

// CDISC SDTM Domain Generators

function generateDM(patients, trials) {
  return patients.map(p => {
    return {
      STUDYID: p.trialId,
      DOMAIN: 'DM',
      USUBJID: p.pseudonymizedId,
      SUBJID: p.patientId,
      RFSTDTC: p.enrolmentDate ? new Date(p.enrolmentDate).toISOString() : '',
      RFENDTC: p.completionDate ? new Date(p.completionDate).toISOString() : p.withdrawalDate ? new Date(p.withdrawalDate).toISOString() : '',
      SITEID: p.site || '',
      ARM: p.armAssigned || '',
      ARMCD: p.armAssigned || '',
      ACTARM: p.armAssigned || '',
      COUNTRY: 'IN',
      DTHFL: p.saeOccurred && p.stage === 'Withdrawn' ? 'Y' : 'N',
      AGE: p.age !== undefined ? String(p.age) : '',
      AGEU: 'YEARS',
      SEX: p.gender === 'Male' ? 'M' : p.gender === 'Female' ? 'F' : 'U',
      ABHA_ID: p.abhaId || '',
      HOSP_REG_NO: p.hospitalRegNumber || '',
      AV_CONSENT_RECORDED: p.audioVisualRecordingDone ? 'Y' : 'N',
      STATUTORY_COMPENSATION_INR: p.calculatedCompensation !== undefined ? p.calculatedCompensation : 0,
      RISK_FACTOR_R: p.diseaseRiskFactor !== undefined ? p.diseaseRiskFactor : 4.0
    };
  });
}

function generateVS(patients) {
  const records = [];
  patients.forEach((p, idx) => {
    const vitals = p.baselineVitals || {};
    if (vitals.bloodPressureSystolic) {
      records.push({ STUDYID: p.trialId, DOMAIN: 'VS', USUBJID: p.pseudonymizedId, VSTESTCD: 'SYSBP', VSTEST: 'Systolic Blood Pressure', VSORRES: String(vitals.bloodPressureSystolic), VSORRESU: 'mmHg' });
    }
    if (vitals.bloodPressureDiastolic) {
      records.push({ STUDYID: p.trialId, DOMAIN: 'VS', USUBJID: p.pseudonymizedId, VSTESTCD: 'DIABP', VSTEST: 'Diastolic Blood Pressure', VSORRES: String(vitals.bloodPressureDiastolic), VSORRESU: 'mmHg' });
    }
    if (vitals.pulseRate) {
      records.push({ STUDYID: p.trialId, DOMAIN: 'VS', USUBJID: p.pseudonymizedId, VSTESTCD: 'PULSE', VSTEST: 'Pulse Rate', VSORRES: String(vitals.pulseRate), VSORRESU: 'beats/min' });
    }
    if (vitals.weight) {
      records.push({ STUDYID: p.trialId, DOMAIN: 'VS', USUBJID: p.pseudonymizedId, VSTESTCD: 'WEIGHT', VSTEST: 'Weight', VSORRES: String(vitals.weight), VSORRESU: 'kg' });
    }
  });
  return records;
}

function generateLB(patients) {
  const records = [];
  patients.forEach(p => {
    const labs = p.baselineLabData || {};
    if (labs.haemoglobin) {
      records.push({ STUDYID: p.trialId, DOMAIN: 'LB', USUBJID: p.pseudonymizedId, LBTESTCD: 'HGB', LBTEST: 'Hemoglobin', LBORRES: String(labs.haemoglobin), LBORRESU: 'g/dL' });
    }
    if (labs.wbcCount) {
      records.push({ STUDYID: p.trialId, DOMAIN: 'LB', USUBJID: p.pseudonymizedId, LBTESTCD: 'WBC', LBTEST: 'Leukocytes', LBORRES: String(labs.wbcCount), LBORRESU: 'cells/mcL' });
    }
    if (labs.serumCreatinine) {
      records.push({ STUDYID: p.trialId, DOMAIN: 'LB', USUBJID: p.pseudonymizedId, LBTESTCD: 'CREAT', LBTEST: 'Creatinine', LBORRES: String(labs.serumCreatinine), LBORRESU: 'mg/dL' });
    }
  });
  return records;
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
      records.push({ STUDYID: p.trialId, DOMAIN: 'DS', USUBJID: p.pseudonymizedId, DSSEQ: 1, DSDECOD: 'ENROLLED', DSSTDTC: new Date(p.enrolmentDate).toISOString() });
    }
    if (p.randomizationDate) {
      records.push({ STUDYID: p.trialId, DOMAIN: 'DS', USUBJID: p.pseudonymizedId, DSSEQ: 2, DSDECOD: 'RANDOMIZED', DSSTDTC: new Date(p.randomizationDate).toISOString() });
    }
    if (p.withdrawalDate || p.stage === 'Withdrawn' || p.stage === 'Dropped Out') {
      records.push({ STUDYID: p.trialId, DOMAIN: 'DS', USUBJID: p.pseudonymizedId, DSSEQ: 3, DSDECOD: 'WITHDRAWN', DSTERM: p.withdrawalReason || 'Protocol withdrawal', DSSTDTC: p.withdrawalDate ? new Date(p.withdrawalDate).toISOString() : new Date().toISOString() });
    }
    if (p.completionDate) {
      records.push({ STUDYID: p.trialId, DOMAIN: 'DS', USUBJID: p.pseudonymizedId, DSSEQ: 3, DSDECOD: 'COMPLETED', DSSTDTC: new Date(p.completionDate).toISOString() });
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
    if (domain === 'ALL' || domain === 'VS') datasets.VS = generateVS(patients);
    if (domain === 'ALL' || domain === 'LB') datasets.LB = generateLB(patients);
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

