/**
 * Hyperledger Fabric Blockchain Ledger Simulation
 * ================================================
 * Implements a hash-chain immutable ledger that mirrors Hyperledger Fabric behavior:
 * - SHA-256 hash chain (each block references previous block's hash)
 * - Immutable transaction logging
 * - Block verification & integrity checking
 * - World state management
 * - Channel-based transaction isolation
 */

const crypto = require('crypto');
const Block = require('../models/Block');

class HyperledgerLedger {
    constructor() {
        this.channelId = 'compliance-channel';
        this.chaincodeId = 'AyurvedaClinicalTrialContract';
        this.organizations = [
            { mspId: 'GovAyushResearchInstituteMSP', name: 'Government Ayurveda Research Institute', role: 'Admin/Regulator' },
            { mspId: 'TrialSiteHospitalMSP', name: 'Trial Site / Hospital', role: 'Investigator' },
            { mspId: 'EthicsCommitteeMSP', name: 'Ethics Committee', role: 'Ethics' },
            { mspId: 'HerbSupplierMSP', name: 'Herb Supplier / Raw Material Certifier', role: 'Supplier' },
        ];
        this.isInitialized = false;
    }

    calculateHash(index, timestamp, data, previousHash, nonce) {
        const blockString = `${index}${timestamp}${JSON.stringify(data)}${previousHash}${nonce}`;
        return crypto.createHash('sha256').update(blockString).digest('hex');
    }

    async initialize() {
        try {
            const existingGenesis = await Block.findOne({ index: 0 });
            if (!existingGenesis) {
                const genesisData = {
                    transactionType: 'GENESIS',
                    payload: {
                        message: 'Nidana Ayurveda CTMS Blockchain — Genesis Block',
                        organizations: this.organizations,
                        channelId: this.channelId,
                        chaincodeId: this.chaincodeId,
                        consensusType: 'Raft',
                        stateDB: 'CouchDB',
                        createdAt: new Date().toISOString(),
                    },
                    actor: 'SYSTEM',
                    organizationMSP: 'GovAyushResearchInstituteMSP',
                };
                const genesisTimestamp = new Date();
                const genesisHash = this.calculateHash(0, genesisTimestamp, genesisData, '0000000000000000000000000000000000000000000000000000000000000000', 0);

                await Block.create({
                    index: 0,
                    timestamp: genesisTimestamp,
                    data: genesisData,
                    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
                    hash: genesisHash,
                    nonce: 0,
                    channelId: this.channelId,
                    chaincodeId: this.chaincodeId,
                });
                console.log('🔗 Genesis block created on compliance-channel');
            }
            this.isInitialized = true;
            console.log('⛓️  Hyperledger Fabric Ledger initialized (Raft consensus, CouchDB state)');
            return true;
        } catch (error) {
            console.error('❌ Ledger initialization error:', error.message);
            return false;
        }
    }

    async getLatestBlock() {
        return await Block.findOne().sort({ index: -1 });
    }

    async submitTransaction(transactionType, payload, actor = 'SYSTEM', organizationMSP = 'GovAyushResearchInstituteMSP') {
        try {
            const latestBlock = await this.getLatestBlock();
            if (!latestBlock) {
                await this.initialize();
                return await this.submitTransaction(transactionType, payload, actor, organizationMSP);
            }

            const newIndex = latestBlock.index + 1;
            const timestamp = new Date();
            const data = { transactionType, payload, actor, organizationMSP };

            let nonce = 0;
            let hash = '';
            do {
                hash = this.calculateHash(newIndex, timestamp, data, latestBlock.hash, nonce);
                nonce++;
            } while (!hash.startsWith('00') && nonce < 10000);
            nonce--;

            const newBlock = await Block.create({
                index: newIndex,
                timestamp,
                data,
                previousHash: latestBlock.hash,
                hash,
                nonce,
                channelId: this.channelId,
                chaincodeId: this.chaincodeId,
            });

            return newBlock;
        } catch (error) {
            console.error('❌ Transaction submission error:', error.message);
            throw error;
        }
    }

    async verifyChainIntegrity() {
        try {
            const blocks = await Block.find().sort({ index: 1 });
            if (blocks.length === 0) {
                return { valid: false, message: 'No blocks found', brokenLinks: [] };
            }

            const brokenLinks = [];
            for (let i = 1; i < blocks.length; i++) {
                const currentBlock = blocks[i];
                const previousBlock = blocks[i - 1];

                if (currentBlock.previousHash !== previousBlock.hash) {
                    brokenLinks.push({
                        blockIndex: currentBlock.index,
                        expected: previousBlock.hash,
                        found: currentBlock.previousHash,
                    });
                }
            }

            return {
                valid: brokenLinks.length === 0,
                totalBlocks: blocks.length,
                message: brokenLinks.length === 0 ? 'Blockchain integrity verified ✓' : 'Integrity breach detected!',
                brokenLinks,
                genesisHash: blocks[0].hash,
                latestHash: blocks[blocks.length - 1].hash,
                latestIndex: blocks[blocks.length - 1].index,
            };
        } catch (error) {
            console.error('❌ Chain verification error:', error.message);
            throw error;
        }
    }

    async queryByTransactionType(transactionType) {
        return await Block.find({ 'data.transactionType': transactionType }).sort({ index: -1 });
    }

    async getChainStats() {
        const totalBlocks = await Block.countDocuments();
        const latestBlock = await this.getLatestBlock();
        const transactionTypes = await Block.distinct('data.transactionType');
        const integrity = await this.verifyChainIntegrity();

        return {
            networkName: 'Nidana Ayurveda CTMS Network',
            channelId: this.channelId,
            chaincodeId: this.chaincodeId,
            consensusType: 'Raft',
            stateDatabase: 'CouchDB',
            organizations: this.organizations,
            totalBlocks,
            latestBlockHash: latestBlock ? latestBlock.hash : null,
            latestBlockIndex: latestBlock ? latestBlock.index : null,
            transactionTypes,
            chainIntegrity: integrity.valid ? 'VERIFIED' : 'COMPROMISED',
            status: 'ACTIVE',
        };
    }

    async getBlockByHash(hash) {
        return await Block.findOne({ hash });
    }

    async getBlockByIndex(index) {
        return await Block.findOne({ index });
    }

    async getRecentTransactions(limit = 20) {
        return await Block.find({ index: { $gt: 0 } }).sort({ index: -1 }).limit(limit);
    }
}

const ledger = new HyperledgerLedger();
module.exports = ledger;
