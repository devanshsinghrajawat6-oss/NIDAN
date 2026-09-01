import { NextResponse } from 'next/server';
import { connectDB, AdverseEvent } from '@/lib/db';
import { storeOnBlockchain } from '@/lib/blockchain';
import { createSignature } from '@/lib/esignature';
import { writeAuditLog } from '@/lib/audit';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const trialId = searchParams.get('trialId');
    const eventType = searchParams.get('eventType');
    const query = {};
    if (trialId) query.trialId = trialId;
    if (eventType) query.eventType = eventType;

    const events = await AdverseEvent.find(query).sort({ dateReported: -1 });
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    await connectDB();

    if (body.whoDrugName && /^\d+$/.test(body.whoDrugName.trim())) {
      return NextResponse.json({ success: false, error: "WHODrug name cannot consist of only numbers." }, { status: 400 });
    }
    if (body.description && /^\d+$/.test(body.description.trim())) {
      return NextResponse.json({ success: false, error: "Clinical description cannot consist of only numbers." }, { status: 400 });
    }

    const eventId = body.eventId || `AE-${Date.now()}`;

    // 1. Submit hash to Blockchain for ALCOA+ compliance
    const txHash = await storeOnBlockchain(
      eventId, 
      {
        trialId: body.trialId,
        patientId: body.patientId,
        eventType: body.eventType,
        medDraCode: body.medDraCode,
        severity: body.severity,
        causality: body.causality
      },
      body.eventType === 'SAE' ? 'SAE_REPORT' : 'AE_REPORT',
      `${body.severity}:${body.medDraPreferredTerm || body.medDraCode || ''}`
    );

    // 2. Generate eSignature
    const sig = createSignature(
      body.reportedBy || 'SYSTEM',
      'Investigator',
      eventId,
      txHash,
      body.eventType
    );

    // 3. Compute regulatory deadline
    const reportDate = body.dateReported ? new Date(body.dateReported) : new Date();
    const deadline = new Date(reportDate);
    if (body.eventType === 'SAE' || body.eventType === 'SUSAR') {
      deadline.setHours(deadline.getHours() + 24); // 24h for NDCT 2019 SAE
    } else {
      deadline.setDate(deadline.getDate() + 7); // 7 days for AE
    }

    // 4. Save to MongoDB
    const event = await AdverseEvent.create({
      ...body,
      eventId,
      dateReported: reportDate,
      regulatoryDeadline: deadline,
      blockchainTxHash: txHash,
      eSignature: JSON.stringify(sig)
    });

    await writeAuditLog({
      action: 'SAE_REPORTED',
      resource: 'AdverseEvent',
      resourceId: eventId,
      newValue: { eventId, trialId: body.trialId, eventType: body.eventType, severity: body.severity }
    });
    
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
