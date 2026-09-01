import { NextResponse } from 'next/server';
import { connectDB, Patient, AdverseEvent } from '@/lib/db';

function generateADSL(patients) {
  return patients.map(p => ({
    STUDYID: p.trialId,
    USUBJID: p.pseudonymizedId,
    SUBJID: p.patientId,
    SITEID: p.site || '',
    ARM: p.armAssigned || '',
    ARMCD: p.armAssigned || '',
    ACTARM: p.armAssigned || '',
    RANDFL: p.randomizationDate ? 'Y' : 'N',
    ITTFL: p.enrolmentDate ? 'Y' : 'N',
    SAFFL: p.enrolmentDate && p.consentStatus === 'Consented' ? 'Y' : 'N',
    COMPLFL: p.completionDate ? 'Y' : 'N',
    WTHDRAWN: p.withdrawalDate ? 'Y' : 'N',
    DCREASCD: p.withdrawalReason || '',
    RFSTDTC: p.enrolmentDate?.toISOString?.() || '',
    RFENDTC: p.completionDate?.toISOString?.() || p.withdrawalDate?.toISOString?.() || '',
    TRTSDT: p.enrolmentDate?.toISOString?.() || '',
    AGE: '',
    SEX: p.gender === 'Male' ? 'M' : p.gender === 'Female' ? 'F' : 'U',
    DOSAGE: p.dosage || '',
  }));
}

function generateADAE(events, patients) {
  return events.map(e => {
    const patient = patients.find(p => p.patientId === e.patientId);
    return {
      STUDYID: e.trialId,
      USUBJID: e.patientId,
      ARM: patient?.armAssigned || '',
      AETERM: e.description || e.medDraPreferredTerm || '',
      AEDECOD: e.medDraPreferredTerm || '',
      AEHLT: e.medDraHighLevelTerm || '',
      AESOC: e.medDraSystemOrganClass || '',
      AESEV: e.severity || '',
      AESER: ['SAE', 'SUSAR'].includes(e.eventType) ? 'Y' : 'N',
      AEREL: e.causality || '',
      AEOUT: e.outcome || '',
      AESTDTC: e.dateOccurred?.toISOString?.() || '',
      TRTEMFL: 'Y',
      TIMELYRPT: e.timelyReport === true ? 'Y' : e.timelyReport === false ? 'N' : '',
    };
  });
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const trialId = searchParams.get('trialId');
    const query = trialId ? { trialId } : {};

    const [patients, events] = await Promise.all([
      Patient.find(query),
      AdverseEvent.find(query)
    ]);

    return NextResponse.json({
      success: true,
      metadata: {
        standard: 'CDISC ADaM v2.1',
        generatedAt: new Date().toISOString(),
        trialId: trialId || 'ALL',
        datasets: ['ADSL', 'ADAE']
      },
      datasets: {
        ADSL: generateADSL(patients),
        ADAE: generateADAE(events, patients)
      }
    }, {
      headers: { 'Content-Disposition': `attachment; filename="adam_${trialId || 'all'}_${Date.now()}.json"` }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
