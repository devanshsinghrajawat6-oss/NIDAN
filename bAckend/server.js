require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { router: apiRoutes } = require('./routes/index');
const ledger = require('./blockchain/ledger');

// ─── Initialize Express ──────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ─────────────────────────────────────────────────────
// Set security headers (helmet-style)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// ─── Core Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Simple Rate Limiter ─────────────────────────────────────────────────────
const rateLimitMap = new Map();
app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    const maxRequests = 200;

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
    } else {
        const entry = rateLimitMap.get(ip);
        if (now - entry.startTime > windowMs) {
            rateLimitMap.set(ip, { count: 1, startTime: now });
        } else {
            entry.count++;
            if (entry.count > maxRequests) {
                return res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
            }
        }
    }
    next();
});

// ─── Serve static assets from the frontend directory ─────────────────────────
const frontendDir = path.join(__dirname, '..');
app.use(express.static(frontendDir));

// ─── Request Logger (dev) ────────────────────────────────────────────────────
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} — ${new Date().toISOString()}`);
    next();
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ─── Frontend Routes ─────────────────────────────────────────────────────
// Root → Login
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendDir, 'login.html'));
});

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(frontendDir, 'login.html'));
});

// Dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(frontendDir, 'code.html'));
});

// Blockchain demo page
app.get('/blockchain-demo', (req, res) => {
    res.sendFile(path.join(frontendDir, 'blockchain_demo.html'));
});

// ─── Connect to MongoDB, Initialize Blockchain & Start Server ────────────────
connectDB().then(async () => {
    // Initialize Hyperledger Fabric Blockchain Ledger
    try {
        console.log('\n⛓️  Initializing Hyperledger Fabric Blockchain...');
        await ledger.initialize();
    } catch (err) {
        console.log('⚠️  Blockchain initialization deferred (DB not ready):', err.message);
    }

    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}`);
        console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
        console.log(`⛓️  Blockchain Status: http://localhost:${PORT}/api/blockchain/status`);
        console.log(`🔒 Security Headers: Enabled`);
        console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard\n`);
    });
});
