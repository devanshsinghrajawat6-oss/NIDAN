import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';

export async function GET() {
    try {
        await connectDB();
        const dbState = mongoose.connection.readyState;
        const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
        
        return NextResponse.json({
            success: true,
            server: 'Nidana Ayurveda CTMS',
            version: '2.0.0', // Updated to Next.js version
            database: states[dbState] || 'unknown',
            blockchain: 'EVM Local Network (Hardhat)',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        }, { status: 200 });
    } catch (error) {
        console.error('Status API Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal Server Error',
            message: error.message,
        }, { status: 500 });
    }
}
