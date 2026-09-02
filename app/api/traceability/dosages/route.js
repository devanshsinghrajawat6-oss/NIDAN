import { NextResponse } from 'next/server';
import { connectDB, DosageRecord, HerbBatch } from '@/lib/db';
import { storeOnBlockchain } from '@/lib/blockchain';
import { writeAuditLog } from '@/lib/audit';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const dosageId = searchParams.get('dosageId');
    const trialId = searchParams.get('trialId');
    
    let query = {};
    if (dosageId) query.dosageId = dosageId;
    if (trialId) query.trialId = trialId;

    const dosages = await DosageRecord.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: dosages }, { status: 200 });
  } catch (error) {
    console.error('DosageRecord API GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const allowedRoles = ["Admin", "Investigator", "Coordinator", "Pharmacovigilance"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    if (!body.dosageId || !body.trialId || !body.herbBatchIds || !Array.isArray(body.herbBatchIds) || body.herbBatchIds.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required fields: dosageId, trialId, herbBatchIds (array)" }, { status: 400 });
    }

    const existing = await DosageRecord.findOne({ dosageId: body.dosageId });
    if (existing) {
      return NextResponse.json({ success: false, error: `Dosage ID ${body.dosageId} already exists.` }, { status: 400 });
    }

    // ─── CHAINCODE / RULE ENFORCEMENT ───────────────────────────────────────
    // Verify referenced Herb Batches exist, are 'Certified', and not expired or recalled.
    for (const batchId of body.herbBatchIds) {
      const batch = await HerbBatch.findOne({ batchId });
      if (!batch) {
        return NextResponse.json({ 
          success: false, 
          error: `Compliance Breach: Referenced Herb Batch '${batchId}' does not exist in the system.` 
        }, { status: 400 });
      }
      if (batch.status !== 'Certified') {
        return NextResponse.json({ 
          success: false, 
          error: `Compliance Breach: Herb Batch '${batchId}' status is '${batch.status}'. Only 'Certified' batches can be formulated.` 
        }, { status: 400 });
      }
      if (batch.expiryDate && new Date(batch.expiryDate) < new Date()) {
        return NextResponse.json({ 
          success: false, 
          error: `Compliance Breach: Herb Batch '${batchId}' has expired on ${new Date(batch.expiryDate).toLocaleDateString()}.` 
        }, { status: 400 });
      }
    }

    // Write on-chain record
    const blockchainTxHash = await storeOnBlockchain(
      body.dosageId,
      {
        dosageId: body.dosageId,
        trialId: body.trialId,
        herbBatchIds: body.herbBatchIds,
        formulationName: body.formulationName,
        formulationDate: body.formulationDate || new Date()
      },
      "DOSAGE_RECORD",
      body.formulationName
    );

    const newDosage = new DosageRecord({
      dosageId: body.dosageId,
      trialId: body.trialId,
      herbBatchIds: body.herbBatchIds,
      formulationName: body.formulationName || 'Standardized Ayurvedic Formulation',
      formulationDate: body.formulationDate ? new Date(body.formulationDate) : new Date(),
      quantity: body.quantity || '1000 Units',
      manufacturerDetails: body.manufacturerDetails || 'AIIA GMP Certified Pharmacy Lab',
      status: 'Active',
      blockchainTxHash
    });

    await newDosage.save();

    await writeAuditLog({
      action: 'DOSAGE_RECORD_CREATED',
      resource: 'DosageRecord',
      resourceId: body.dosageId,
      userEmail: session.user.email,
      userRole: session.user.role,
      newValue: { dosageId: body.dosageId, trialId: body.trialId, herbBatchIds: body.herbBatchIds, blockchainTxHash }
    });

    return NextResponse.json({ success: true, data: newDosage }, { status: 201 });
  } catch (error) {
    console.error('DosageRecord API POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
