const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: { type: String, enum: ['SAE_Alert', 'Compliance_Breach', 'Consent_Expiry', 'Deadline', 'System', 'Blockchain'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    targetRole: { type: String },
    relatedResourceType: { type: String },
    relatedResourceId: { type: String },
    read: { type: Boolean, default: false },
    actionRequired: { type: Boolean, default: false },
    actionUrl: { type: String },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
