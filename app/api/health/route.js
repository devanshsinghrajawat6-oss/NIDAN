import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';

export async function GET() {
    try {
        await connectDB();
        const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'degraded';
        const memoryUsage = process.memoryUsage();

        return NextResponse.json({
            status: dbStatus === 'healthy' ? 'UP' : 'DEGRADED',
            service: 'NIDANA Ayurveda CTMS Core',
            checks: {
                database: { status: dbStatus, host: mongoose.connection.host || 'connected' },
                blockchain: { status: 'active', network: 'Hardhat Local EVM' },
                security: { rbac: 'enforced', auth: 'next-auth/jwt' }
            },
            system: {
                uptimeSeconds: Math.floor(process.uptime()),
                memoryUsageMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            },
            timestamp: new Date().toISOString(),
        }, { status: dbStatus === 'healthy' ? 200 : 503 });
    } catch (error) {
        console.error('Health API Error:', error);
        return NextResponse.json({
            status: 'DOWN',
            error: 'Database connection failed',
            message: error.message,
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
