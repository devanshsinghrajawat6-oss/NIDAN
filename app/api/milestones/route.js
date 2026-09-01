import { NextResponse } from 'next/server';
import { connectDB, Milestone } from '@/lib/db';
import { writeAuditLog } from '@/lib/audit';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const trialId = searchParams.get('trialId');
    const query = trialId ? { trialId } : {};
    const milestones = await Milestone.find(query).sort({ plannedDate: 1 });
    return NextResponse.json({ success: true, data: milestones });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const milestoneId = body.milestoneId || `MS-${Date.now()}`;
    const milestone = await Milestone.create({ ...body, milestoneId });
    await writeAuditLog({ action: 'CREATE', resource: 'Milestone', resourceId: milestoneId, newValue: body });
    return NextResponse.json({ success: true, data: milestone }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { milestoneId, ...updates } = body;
    const previous = await Milestone.findOne({ milestoneId });
    const updated = await Milestone.findOneAndUpdate({ milestoneId }, updates, { new: true });
    await writeAuditLog({ action: 'UPDATE', resource: 'Milestone', resourceId: milestoneId, previousValue: previous, newValue: updates });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
