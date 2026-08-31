const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    index: { type: Number, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
    data: {
        transactionType: { type: String, required: true },
        payload: { type: mongoose.Schema.Types.Mixed, required: true },
        actor: { type: String },
        organizationMSP: { type: String },
    },
    previousHash: { type: String, required: true },
    hash: { type: String, required: true, unique: true },
    nonce: { type: Number, default: 0 },
    channelId: { type: String, default: 'compliance-channel' },
    chaincodeId: { type: String, default: 'AyurvedaClinicalTrialContract' },
}, { timestamps: true });

module.exports = mongoose.model('Block', blockSchema);
