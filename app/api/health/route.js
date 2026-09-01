import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function GET() {
    try {
        await connectDB();
        return NextResponse.json({
            success: true,
            message: 'Nidana Ayurveda CTMS API is running',
            database: 'connected',
            blockchain: 'active',
            timestamp: new Date().toISOString(),
        }, { status: 200 });
    } catch (error) {
        console.error('Health API Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal Server Error',
            message: error.message,
        }, { status: 500 });
    }
}
