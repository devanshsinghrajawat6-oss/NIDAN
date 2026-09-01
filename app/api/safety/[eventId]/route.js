import { NextResponse } from 'next/server';
import { connectDB, AdverseEvent } from '@/lib/db';
import { writeAuditLog } from '@/lib/audit';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { eventId } = await params;
    const event = await AdverseEvent.findOne({ eventId });
    if (!event) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { eventId } = await params;
    const body = await request.json();

    const previous = await AdverseEvent.findOne({ eventId });
    if (!previous) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });

    // Check if timely report
    let timelyReport = previous.timelyReport;
    if (body.status === 'Submitted to Regulator' && !previous.regulatorySubmittedAt) {
      body.regulatorySubmittedAt = new Date();
      if (previous.regulatoryDeadline) {
        timelyReport = new Date() <= new Date(previous.regulatoryDeadline);
      }
    }

    const updated = await AdverseEvent.findOneAndUpdate(
      { eventId },
      { ...body, timelyReport },
      { new: true }
    );

    await writeAuditLog({
      action: 'SAE_STATUS_UPDATED',
      resource: 'AdverseEvent',
      resourceId: eventId,
      previousValue: { status: previous.status },
      newValue: { status: updated.status, timelyReport }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
