import { NextResponse } from 'next/server';
import { connectDB, HerbBatch, DosageRecord, PatientAdministration, Notification } from '@/lib/db';
import { writeAuditLog } from '@/lib/audit';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const allowedRoles = ["Admin", "Pharmacovigilance", "Regulator"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden: Insufficient permissions for initiating a Recall" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    if (!body.batchId) {
      return NextResponse.json({ success: false, error: "Missing required parameter: batchId" }, { status: 400 });
    }

    const batch = await HerbBatch.findOne({ batchId: body.batchId });
    if (!batch) {
      return NextResponse.json({ success: false, error: `Herb Batch '${body.batchId}' not found.` }, { status: 404 });
    }

    // 1. Update Batch status to Recalled
    batch.status = 'Recalled';
    await batch.save();

    // 2. Cascade status change to all linked DosageRecords
    const affectedDosages = await DosageRecord.find({ herbBatchIds: body.batchId });
    const dosageIds = affectedDosages.map(d => d.dosageId);

    await DosageRecord.updateMany(
      { herbBatchIds: body.batchId },
      { $set: { status: 'Recalled' } }
    );

    // 3. Find affected patient administrations
    const affectedAdmins = await PatientAdministration.find({ dosageId: { $in: dosageIds } });
    const affectedPatientIds = Array.from(new Set(affectedAdmins.map(a => a.patientId)));
    const affectedTrials = Array.from(new Set(affectedAdmins.map(a => a.trialId).concat(affectedDosages.map(d => d.trialId))));

    // 4. Create urgent notifications
    const reasonText = body.reason || 'Quality audit failure / Safety signal detected';
    const urgentNotification = new Notification({
      type: 'SAE_DEADLINE',
      severity: 'critical',
      title: `URGENT RECALL: Herb Batch ${body.batchId}`,
      message: `Herb Batch ${body.batchId} (${batch.herbName}) has been RECALLED. Reason: ${reasonText}. ${affectedPatientIds.length} patient administration records impacted across trials: ${affectedTrials.join(', ')}.`,
      trialId: affectedTrials[0] || 'GENERAL',
      targetRoles: ['Admin', 'Investigator', 'Pharmacovigilance', 'Regulator', 'Ethics Committee'],
      isRead: false,
      actionUrl: `/dashboard/traceability?batchId=${body.batchId}`
    });

    await urgentNotification.save();

    // 5. Write audit log
    await writeAuditLog({
      action: 'HERB_BATCH_RECALLED',
      resource: 'HerbBatch',
      resourceId: body.batchId,
      userEmail: session.user.email,
      userRole: session.user.role,
      newValue: { 
        batchId: body.batchId, 
        reason: reasonText, 
        affectedDosagesCount: affectedDosages.length, 
        affectedPatientsCount: affectedPatientIds.length 
      }
    });

    return NextResponse.json({
      success: true,
      message: `Herb Batch ${body.batchId} successfully flagged as RECALLED.`,
      summary: {
        batchId: body.batchId,
        recalledStatus: 'Recalled',
        dosagesRecalled: affectedDosages.length,
        patientsImpacted: affectedPatientIds.length,
        trialsImpacted: affectedTrials.length
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Batch Recall API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
