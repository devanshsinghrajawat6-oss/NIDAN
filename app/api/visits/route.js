import { NextResponse } from 'next/server';
import { connectDB, Visit } from '@/lib/db';
import { writeAuditLog } from '@/lib/audit';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const trialId = searchParams.get('trialId');
    const patientId = searchParams.get('patientId');
    const query = {};
    if (trialId) query.trialId = trialId;
    if (patientId) query.patientId = patientId;
    const visits = await Visit.find(query).sort({ scheduledDate: 1 });
    return NextResponse.json({ success: true, data: visits });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const visitId = body.visitId || `VIS-${Date.now()}`;
    const visit = await Visit.create({ ...body, visitId });
    await writeAuditLog({ action: 'CREATE', resource: 'Visit', resourceId: visitId, newValue: body });
    return NextResponse.json({ success: true, data: visit }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { visitId, ...updates } = body;
    const previous = await Visit.findOne({ visitId });
    const updated = await Visit.findOneAndUpdate({ visitId }, updates, { new: true });
    await writeAuditLog({ action: 'UPDATE', resource: 'Visit', resourceId: visitId, previousValue: previous, newValue: updates });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
