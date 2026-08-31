const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Trial = require('../models/Trial');
const Patient = require('../models/Patient');
const AdverseEvent = require('../models/AdverseEvent');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const Block = require('../models/Block');
const ledger = require('../blockchain/ledger');
const complianceEngine = require('../blockchain/complianceEngine');

// ─── DB readiness check ───────────────────────────────────────────────────────
const isDbReady = () => mongoose.connection.readyState === 1;

// ─── Health Check ────────────────────────────────────────────────────────────
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Nidana Ayurveda CTMS API is running',
        blockchain: ledger.isInitialized ? 'connected' : 'initializing',
        timestamp: new Date().toISOString(),
    });
});

// ─── Dashboard Stats (aggregated KPIs) ──────────────────────────────────────
router.get('/dashboard/stats', async (req, res) => {
    if (!isDbReady()) {
        return res.json({
            success: true,
            data: {
                activeStudies: 0, totalPatients: 0, pendingApprovals: 0,
                urgentSafetyIssues: 0, totalTrials: 0, completedTrials: 0,
                blockchainBlocks: 0, complianceScore: 0, totalBreaches: 0,
                recentActivity: new Date().toISOString(),
            },
        });
    }
    try {
        const activeStudies = await Trial.countDocuments({ status: 'Active' });
        const totalPatients = await Patient.countDocuments({ status: 'Active' });
        const pendingApprovals = await Trial.countDocuments({ iecApprovalStatus: 'Pending' });
        const urgentSafetyIssues = await AdverseEvent.countDocuments({ severity: 'SAE', status: { $ne: 'Resolved' } });
        const totalTrials = await Trial.countDocuments();
        const completedTrials = await Trial.countDocuments({ status: 'Completed' });
        const blockchainBlocks = await Block.countDocuments();
        const compliance = await complianceEngine.runFullComplianceCheck();
        res.json({
            success: true,
            data: { activeStudies, totalPatients, pendingApprovals, urgentSafetyIssues, totalTrials, completedTrials, blockchainBlocks, complianceScore: compliance.overallScore, totalBreaches: compliance.totalBreaches, recentActivity: compliance.timestamp },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Trials CRUD ─────────────────────────────────────────────────────────────
router.get('/trials', async (req, res) => {
    if (!isDbReady()) return res.json({ success: true, count: 0, data: [] });
    try {
        const trials = await Trial.find().sort({ createdAt: -1 });
        res.json({ success: true, count: trials.length, data: trials });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/trials', async (req, res) => {
    if (!isDbReady()) return res.status(503).json({ success: false, error: 'Database not connected.' });
    try {
        const trial = await Trial.create(req.body);
        await complianceEngine.logRegulatedAction('TRIAL_CREATED', req.body.principalInvestigator || 'System', 'Lead Doctor', 'Trial', trial.trialId, `New trial: ${trial.name}`);
        res.status(201).json({ success: true, data: trial });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ─── Patients CRUD ───────────────────────────────────────────────────────────
router.get('/patients', async (req, res) => {
    if (!isDbReady()) return res.json({ success: true, count: 0, data: [] });
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });
        res.json({ success: true, count: patients.length, data: patients });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/patients', async (req, res) => {
    if (!isDbReady()) return res.status(503).json({ success: false, error: 'Database not connected.' });
    try {
        const patient = await Patient.create(req.body);
        await complianceEngine.logRegulatedAction('PATIENT_ENROLLED', 'System', 'Lead Doctor', 'Patient', patient.patientId, `Patient enrolled in trial ${patient.trialId}`);
        res.status(201).json({ success: true, data: patient });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ─── Adverse Events ──────────────────────────────────────────────────────────
router.get('/adverse-events', async (req, res) => {
    if (!isDbReady()) return res.json({ success: true, count: 0, data: [] });
    try {
        const events = await AdverseEvent.find().sort({ reportedAt: -1 });
        res.json({ success: true, count: events.length, data: events });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/adverse-events', async (req, res) => {
    if (!isDbReady()) return res.status(503).json({ success: false, error: 'Database not connected.' });
    try {
        const event = await AdverseEvent.create(req.body);
        await complianceEngine.logRegulatedAction('ADVERSE_EVENT_REPORTED', req.body.reportedBy || 'System', 'Lead Doctor', 'AdverseEvent', event.eventId, `${event.severity}: ${event.description}`);
        if (event.severity === 'SAE') {
            await Notification.create({ type: 'SAE_Alert', title: 'URGENT: New Serious Adverse Event', message: `SAE ${event.eventId} reported for patient ${event.patientId}. IEC notification required within 24 hours.`, severity: 'critical', targetRole: 'Ethics Committee', relatedResourceType: 'AdverseEvent', relatedResourceId: event.eventId, actionRequired: true });
        }
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ─── Audit Logs (Read-only) ──────────────────────────────────────────────────
router.get('/audit-logs', async (req, res) => {
    if (!isDbReady()) return res.json({ success: true, count: 0, data: [] });
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
        res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Notifications ───────────────────────────────────────────────────────────
router.get('/notifications', async (req, res) => {
    if (!isDbReady()) return res.json({ success: true, unreadCount: 0, count: 0, data: [] });
    try {
        const notifications = await Notification.find().sort({ timestamp: -1 }).limit(50);
        const unreadCount = await Notification.countDocuments({ read: false });
        res.json({ success: true, unreadCount, count: notifications.length, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/notifications/:id/read', async (req, res) => {
    if (!isDbReady()) return res.status(503).json({ success: false, error: 'Database not connected.' });
    try {
        const notif = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
        res.json({ success: true, data: notif });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ─── Blockchain Endpoints ────────────────────────────────────────────────────
router.get('/blockchain/status', async (req, res) => {
    try {
        const stats = await ledger.getChainStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/blockchain/verify', async (req, res) => {
    try {
        const integrity = await ledger.verifyChainIntegrity();
        res.json({ success: true, data: integrity });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/blockchain/blocks', async (req, res) => {
    try {
        const blocks = await ledger.getRecentTransactions(parseInt(req.query.limit) || 20);
        res.json({ success: true, count: blocks.length, data: blocks });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/blockchain/block/:index', async (req, res) => {
    try {
        const block = await ledger.getBlockByIndex(parseInt(req.params.index));
        if (!block) return res.status(404).json({ success: false, error: 'Block not found' });
        res.json({ success: true, data: block });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Compliance ──────────────────────────────────────────────────────────────
router.get('/compliance/check', async (req, res) => {
    try {
        const result = await complianceEngine.runFullComplianceCheck();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Search ──────────────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
    if (!isDbReady()) return res.json({ success: true, data: { trials: [], patients: [], events: [] } });
    try {
        const q = req.query.q || '';
        if (!q) return res.json({ success: true, data: { trials: [], patients: [], events: [] } });
        const regex = new RegExp(q, 'i');
        const [trials, patients, events] = await Promise.all([
            Trial.find({ $or: [{ name: regex }, { trialId: regex }, { therapeuticArea: regex }, { site: regex }] }).limit(10),
            Patient.find({ $or: [{ patientId: regex }, { pseudonymizedId: regex }, { site: regex }] }).limit(10),
            AdverseEvent.find({ $or: [{ eventId: regex }, { description: regex }] }).limit(10),
        ]);
        res.json({ success: true, data: { trials, patients, events } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Seed Data endpoint removed (no hardcoded data) ─────────────────────────
// Data must be added via the proper POST endpoints when a real MongoDB URI
// is configured in bAckend/.env (MONGODB_URI=...).
router.post('/seed', (req, res) => {
    res.status(410).json({ success: false, error: 'Seed endpoint disabled. Connect a real MongoDB database and add data via the API.' });
});

module.exports = { router };

