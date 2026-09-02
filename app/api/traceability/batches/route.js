import { NextResponse } from 'next/server';
import { connectDB, HerbBatch } from '@/lib/db';
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
    const batchId = searchParams.get('batchId');
    const query = batchId ? { batchId } : {};

    const batches = await HerbBatch.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: batches }, { status: 200 });
  } catch (error) {
    console.error('HerbBatch API GET Error:', error);
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

    if (!body.batchId || !body.supplierId || !body.herbName) {
      return NextResponse.json({ success: false, error: "Missing required fields: batchId, supplierId, herbName" }, { status: 400 });
    }

    const existing = await HerbBatch.findOne({ batchId: body.batchId });
    if (existing) {
      return NextResponse.json({ success: false, error: `Batch ID ${body.batchId} already exists.` }, { status: 400 });
    }

    // Prepare payload for blockchain certification hashing
    const certDetails = {
      gmpCertNumber: body.gmpCertNumber || body.certificationDetails?.gmpCertNumber || 'GMP-AYUSH-2025-DEF',
      purityTestResults: body.purityTestResults || body.certificationDetails?.purityTestResults || '99.4% HPLC Purity Certified',
      pesticideScreeningStatus: body.pesticideScreeningStatus || body.certificationDetails?.pesticideScreeningStatus || 'Passed',
      heavyMetalScreeningStatus: body.heavyMetalScreeningStatus || body.certificationDetails?.heavyMetalScreeningStatus || 'Passed',
      certifyingAuthority: body.certifyingAuthority || body.certificationDetails?.certifyingAuthority || 'AYUSH Premium Mark Council'
    };

    const blockchainTxHash = await storeOnBlockchain(
      body.batchId,
      {
        batchId: body.batchId,
        supplierId: body.supplierId,
        supplierName: body.supplierName || 'AIIA Certified Herbal Farm',
        herbName: body.herbName,
        certificationDetails: certDetails,
        status: body.status || 'Certified'
      },
      "HERB_BATCH",
      body.herbName
    );

    const newBatch = new HerbBatch({
      batchId: body.batchId,
      supplierId: body.supplierId,
      supplierName: body.supplierName || 'AIIA Certified Herbal Farm',
      herbName: body.herbName,
      harvestDate: body.harvestDate ? new Date(body.harvestDate) : new Date(),
      certificationDetails: certDetails,
      status: body.status || 'Certified',
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // Default 2 years
      batchHash: blockchainTxHash,
    });

    await newBatch.save();

    await writeAuditLog({
      action: 'HERB_BATCH_REGISTERED',
      resource: 'HerbBatch',
      resourceId: body.batchId,
      userEmail: session.user.email,
      userRole: session.user.role,
      newValue: { batchId: body.batchId, herbName: body.herbName, status: newBatch.status, blockchainTxHash }
    });

    return NextResponse.json({ success: true, data: newBatch }, { status: 201 });
  } catch (error) {
    console.error('HerbBatch API POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
