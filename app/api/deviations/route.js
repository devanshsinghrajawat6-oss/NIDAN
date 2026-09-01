import { NextResponse } from 'next/server';
import { connectDB, ProtocolDeviation, Trial } from '@/lib/db';
import { storeOnBlockchain } from '@/lib/blockchain';
import { writeAuditLog } from '@/lib/audit';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const trialId = searchParams.get('trialId');
    const query = trialId ? { trialId } : {};
    const deviations = await ProtocolDeviation.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: deviations });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const deviationId = body.deviationId || `DEV-${Date.now()}`;

    // Anchor to blockchain
    const txHash = await storeOnBlockchain(deviationId, {
      trialId: body.trialId, patientId: body.patientId,
      type: body.deviationType, description: body.description
    }, 'PROTOCOL_DEVIATION', body.deviationType);

    const deviation = await ProtocolDeviation.create({ ...body, deviationId, blockchainTxHash: txHash });

    // Increment trial deviation counter
    await Trial.findOneAndUpdate({ trialId: body.trialId }, { $inc: { protocolDeviations: 1 } });

    await writeAuditLog({ action: 'CREATE', resource: 'ProtocolDeviation', resourceId: deviationId, newValue: body });
    return NextResponse.json({ success: true, data: deviation }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
