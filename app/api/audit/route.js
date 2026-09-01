import { NextResponse } from 'next/server';
import { connectDB, AuditLog } from '@/lib/db';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const query = {};
    if (resource) query.resource = resource;
    if (userId) query.userId = userId;
    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(limit);
    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
