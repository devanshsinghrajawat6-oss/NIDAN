import { NextResponse } from 'next/server';
import { connectDB, HerbBatch, DosageRecord, PatientAdministration, Patient } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const queryPatientId = searchParams.get('patientId');
    const queryDosageId = searchParams.get('dosageId');
    const queryBatchId = searchParams.get('batchId');

    if (!queryPatientId && !queryDosageId && !queryBatchId) {
      return NextResponse.json({ 
        success: false, 
        error: "Please provide 'patientId', 'dosageId', or 'batchId' parameter." 
      }, { status: 400 });
    }

    // ─── 1. DOWNSTREAM TRACE (Given Herb Batch ID) ─────────────────────────
    if (queryBatchId) {
      const batch = await HerbBatch.findOne({ batchId: queryBatchId });
      if (!batch) {
        return NextResponse.json({ success: false, error: `Herb Batch '${queryBatchId}' not found.` }, { status: 404 });
      }

      // Find all dosages using this batch ID
      const dosages = await DosageRecord.find({ herbBatchIds: queryBatchId });
      const dosageIds = dosages.map(d => d.dosageId);

      // Find all patient administrations using these dosages
      const administrations = await PatientAdministration.find({ dosageId: { $in: dosageIds } });

      // Gather distinct affected trials, sites, and pseudonymous patient IDs
      const affectedTrials = Array.from(new Set(administrations.map(a => a.trialId).concat(dosages.map(d => d.trialId))));
      const affectedSites = Array.from(new Set(administrations.map(a => a.site)));
      const affectedPatientIds = Array.from(new Set(administrations.map(a => a.patientId)));

      return NextResponse.json({
        success: true,
        traceType: 'DOWNSTREAM_RECALL_IMPACT',
        batch,
        summary: {
          totalDosagesFormulated: dosages.length,
          totalPatientAdministrations: administrations.length,
          totalAffectedPatients: affectedPatientIds.length,
          affectedTrialsCount: affectedTrials.length,
          affectedSitesCount: affectedSites.length,
          isRecalled: batch.status === 'Recalled'
        },
        dosages,
        administrations,
        affectedTrials,
        affectedSites,
        affectedPatientIds
      }, { status: 200 });
    }

    // ─── 2. UPSTREAM TRACE (Given Patient ID or Dosage ID) ──────────────────
    let administrations = [];
    let dosages = [];
    let patientMeta = null;

    if (queryPatientId) {
      // Find patient record (or match pseudonymous ID)
      const patientDoc = await Patient.findOne({
        $or: [{ patientId: queryPatientId }, { pseudonymizedId: queryPatientId }]
      });

      const targetId = patientDoc ? patientDoc.pseudonymizedId : queryPatientId;
      if (patientDoc) {
        patientMeta = {
          pseudonymizedId: patientDoc.pseudonymizedId,
          trialId: patientDoc.trialId,
          site: patientDoc.site,
          consentStatus: patientDoc.consentStatus,
          armAssigned: patientDoc.armAssigned
        };
      }

      administrations = await PatientAdministration.find({
        $or: [{ patientId: queryPatientId }, { patientId: targetId }]
      }).sort({ administeredAt: -1 });

      const dosageIds = Array.from(new Set(administrations.map(a => a.dosageId)));
      if (dosageIds.length > 0) {
        dosages = await DosageRecord.find({ dosageId: { $in: dosageIds } });
      }
    } else if (queryDosageId) {
      const dosage = await DosageRecord.findOne({ dosageId: queryDosageId });
      if (dosage) dosages = [dosage];
      administrations = await PatientAdministration.find({ dosageId: queryDosageId });
    }

    // Collect all referenced Herb Batch IDs from the dosages
    const allBatchIds = Array.from(new Set(dosages.flatMap(d => d.herbBatchIds || [])));
    const herbBatches = await HerbBatch.find({ batchId: { $in: allBatchIds } });

    // Build visual chain objects
    const chain = administrations.map(admin => {
      const parentDosage = dosages.find(d => d.dosageId === admin.dosageId);
      const linkedBatches = parentDosage 
        ? herbBatches.filter(b => parentDosage.herbBatchIds.includes(b.batchId))
        : [];

      return {
        administration: admin,
        dosage: parentDosage || null,
        herbBatches: linkedBatches
      };
    });

    return NextResponse.json({
      success: true,
      traceType: 'UPSTREAM_LINEAGE',
      patientMeta,
      summary: {
        totalAdministrations: administrations.length,
        totalDosagesUsed: dosages.length,
        totalRawHerbBatches: herbBatches.length,
        hasRecalledBatch: herbBatches.some(b => b.status === 'Recalled')
      },
      chain,
      administrations,
      dosages,
      herbBatches
    }, { status: 200 });

  } catch (error) {
    console.error('Traceability Trace API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
