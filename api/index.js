const mongoose = require('mongoose');

let cachedDb = null;

async function connectDB() {
    if (cachedDb && cachedDb.readyState === 1) {
        return cachedDb;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    cachedDb = conn.connection;
    console.log(`✅ MongoDB Connected: ${cachedDb.host}`);
    return cachedDb;
}

module.exports = async (req, res) => {
    try {
        await connectDB();

        // Security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // Parse the path after /api/
        const path = req.url.replace(/^\/api\/?/, '');

        // ─── Route: /api/health ──────────────────────────────────────────
        if (path === 'health' || path === 'health/') {
            return res.status(200).json({
                success: true,
                message: 'Nidana Ayurveda CTMS API is running',
                database: 'connected',
                blockchain: 'active',
                timestamp: new Date().toISOString(),
            });
        }

        // ─── Route: /api/status ──────────────────────────────────────────
        if (path === 'status' || path === 'status/') {
            const dbState = mongoose.connection.readyState;
            const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
            return res.status(200).json({
                success: true,
                server: 'Nidana Ayurveda CTMS',
                version: '1.0.0',
                database: states[dbState] || 'unknown',
                blockchain: 'Hyperledger Fabric (Simulated)',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            });
        }

        // ─── 404 for unmatched API routes ────────────────────────────────
        return res.status(404).json({
            success: false,
            error: `Route /api/${path} not found`,
            available: ['/api/health', '/api/status'],
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message,
        });
    }
};
