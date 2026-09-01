import { NextResponse } from 'next/server';
import { connectDB, AdverseEvent } from '@/lib/db';

/**
 * Export Pharmacovigilance data as E2B (R3) XML format / CIOMS-I
 * for regulatory submission to CDSCO and NPvCC.
 */
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const trialId = searchParams.get('trialId');
    const format = searchParams.get('format') || 'cioms';

    const query = trialId ? { trialId } : {};
    const events = await AdverseEvent.find(query).sort({ dateReported: -1 });

    if (format === 'e2b') {
      // E2B (R3) XML generation
      const xmlEntries = events.map(e => `
    <ichicsr lang="en">
      <safetyreportversion>1</safetyreportversion>
      <safetyreportid>${e.eventId}</safetyreportid>
      <primarysourcecountry>IN</primarysourcecountry>
      <occurcountry>IN</occurcountry>
      <transmissiondateformat>102</transmissiondateformat>
      <transmissiondate>${new Date().toISOString().slice(0, 10).replace(/-/g, '')}</transmissiondate>
      <reporttype>1</reporttype>
      <serious>${['SAE', 'SUSAR'].includes(e.eventType) ? '1' : '2'}</serious>
      <patient>
        <patientinitial>${e.patientId}</patientinitial>
        <patientonsetage></patientonsetage>
        <reaction>
          <primarysourcereaction>${e.description || ''}</primarysourcereaction>
          <reactionmeddraversionllt>26.0</reactionmeddraversionllt>
          <reactionmeddrallt>${e.medDraCode || ''}</reactionmeddrallt>
          <reactionmeddrapt>${e.medDraPreferredTerm || ''}</reactionmeddrapt>
          <reactionoutcome>${e.outcome === 'Resolved' ? '1' : e.outcome === 'Fatal' ? '5' : '6'}</reactionoutcome>
        </reaction>
        <drug>
          <medicinalproduct>${e.whoDrugName || 'Ayurvedic Test Formulation'}</medicinalproduct>
          <drugcharacterization>1</drugcharacterization>
          <drugcausalityassessment>${e.causality || 'Unassessed'}</drugcausalityassessment>
        </drug>
      </patient>
    </ichicsr>`).join('\n');

      const fullXml = `<?xml version="1.0" encoding="UTF-8"?>
<ichicsrmessageheader>
  <messagetype>ichicsr</messagetype>
  <messageformatversion>2.1</messageformatversion>
  <messagesenderidentifier>AIIA-NPvCC-DELHI</messagesenderidentifier>
  <messagereceiveridentifier>CDSCO-INDIA</messagereceiveridentifier>
  <messagedateformat>204</messagedateformat>
  <messagedate>${new Date().toISOString()}</messagedate>
  ${xmlEntries}
</ichicsrmessageheader>`;

      return new NextResponse(fullXml, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': `attachment; filename="e2b_r3_${trialId || 'all'}_${Date.now()}.xml"`
        }
      });
    }

    // Default: CIOMS-I JSON summary
    const ciomsReports = events.map(e => ({
      reportId: e.eventId,
      studyId: e.trialId,
      subjectId: e.patientId,
      suspectDrug: e.whoDrugName || 'Test Ayurvedic Drug',
      adverseReaction: e.medDraPreferredTerm || e.description,
      medDraCode: e.medDraCode,
      soc: e.medDraSystemOrganClass,
      severity: e.severity,
      causality: e.causality,
      outcome: e.outcome,
      dateReported: e.dateReported,
      regulatoryDeadline: e.regulatoryDeadline,
      blockchainTxHash: e.blockchainTxHash
    }));

    return NextResponse.json({
      success: true,
      metadata: {
        standard: 'CIOMS-I / NPvCC PV Report',
        issuer: 'National Pharmacovigilance Coordination Centre (NPvCC) - AIIA',
        generatedAt: new Date().toISOString()
      },
      data: ciomsReports
    }, {
      headers: {
        'Content-Disposition': `attachment; filename="cioms_${trialId || 'all'}_${Date.now()}.json"`
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
