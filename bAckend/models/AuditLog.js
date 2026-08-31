const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    actor: { type: String, required: true },
    role: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true },
    details: { type: String },
    ipAddress: { type: String },
    severity: { type: String, enum: ['Info', 'Warning', 'Critical'], default: 'Info' },
    blockchainTxHash: { type: String },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

// Prevent modification/deletion of audit logs
auditLogSchema.pre('findOneAndUpdate', function() {
    throw new Error('Audit logs are immutable and cannot be modified');
});
auditLogSchema.pre('findOneAndDelete', function() {
    throw new Error('Audit logs are immutable and cannot be deleted');
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
