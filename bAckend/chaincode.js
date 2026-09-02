'use strict';

const { Contract } = require('fabric-contract-api');

class AyurvedaClinicalTrialContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        // Ledger initialization logic
        console.info('============= END : Initialize Ledger ===========');
    }

    // 1. Consent Contract
    async registerConsent(ctx, consentID, patientID, trialID, consentHash, iecApprovalRef) {
        console.info('============= START : Register Consent ===========');
        const consent = {
            docType: 'consent',
            patientID: patientID, // Hashed in practice
            trialID: trialID,
            consentHash: consentHash,
            timestamp: new Date().toISOString(),
            iecApprovalRef: iecApprovalRef,
            status: 'APPROVED'
        };

        await ctx.stub.putState(consentID, Buffer.from(JSON.stringify(consent)));
        console.info('============= END : Register Consent ===========');
        return JSON.stringify(consent);
    }

    async getConsent(ctx, patientID) {
        const queryString = {
            selector: {
                docType: 'consent',
                patientID: patientID,
                status: 'APPROVED'
            }
        };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return allResults;
    }

    // 2. Herb Batch Traceability Contract
    async registerHerbBatch(ctx, batchID, supplierID, herbType, certificationRef, harvestDate, testResultsHash, expiryDate) {
        const batch = {
            docType: 'herbBatch',
            batchID: batchID,
            supplierID: supplierID,
            herbType: herbType,
            certificationRef: certificationRef,
            harvestDate: harvestDate,
            testResultsHash: testResultsHash,
            expiryDate: expiryDate || null,
            status: 'CERTIFIED',
            createdAt: new Date().toISOString()
        };

        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    async getHerbBatch(ctx, batchID) {
        const batchAsBytes = await ctx.stub.getState(batchID);
        if (!batchAsBytes || batchAsBytes.length === 0) {
            throw new Error(`Herb batch ${batchID} does not exist`);
        }
        return JSON.parse(batchAsBytes.toString());
    }

    async flagHerbBatchRecall(ctx, batchID, reason) {
        const batch = await this.getHerbBatch(ctx, batchID);
        batch.status = 'RECALLED';
        batch.recallReason = reason;
        batch.recalledAt = new Date().toISOString();

        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(batch)));
        ctx.stub.setEvent('HerbBatchRecalled', Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    // 3. Dosage Record & Patient Administration Contract
    async createDosageRecord(ctx, dosageID, trialID, herbBatchIDsJSON, formulationName, manufacturerDetails) {
        const herbBatchIDs = JSON.parse(herbBatchIDsJSON);
        
        // Compliance Rule: Verify ALL referenced herb batches exist, are CERTIFIED, and not expired/recalled
        for (const batchID of herbBatchIDs) {
            const batch = await this.getHerbBatch(ctx, batchID);
            if (batch.status !== 'CERTIFIED') {
                throw new Error(`Compliance Breach: Herb batch ${batchID} status is '${batch.status}' (must be CERTIFIED).`);
            }
            if (batch.expiryDate && new Date(batch.expiryDate) < new Date()) {
                throw new Error(`Compliance Breach: Herb batch ${batchID} has expired.`);
            }
        }

        const dosageRecord = {
            docType: 'dosageRecord',
            dosageID: dosageID,
            trialID: trialID,
            herbBatchIDs: herbBatchIDs,
            formulationName: formulationName,
            manufacturerDetails: manufacturerDetails,
            status: 'ACTIVE',
            createdAt: new Date().toISOString()
        };

        await ctx.stub.putState(dosageID, Buffer.from(JSON.stringify(dosageRecord)));
        return JSON.stringify(dosageRecord);
    }

    async logPatientAdministration(ctx, adminID, patientID, dosageID, trialID, site, timestamp) {
        // Rule: Verify patient informed consent exists
        const consents = await this.getConsent(ctx, patientID);
        if (!consents || consents.length === 0) {
            throw new Error(`Compliance Breach: No valid consent found for patient ${patientID}`);
        }

        // Rule: Verify dosage record exists and is ACTIVE
        const dosageAsBytes = await ctx.stub.getState(dosageID);
        if (!dosageAsBytes || dosageAsBytes.length === 0) {
            throw new Error(`Dosage record ${dosageID} does not exist.`);
        }
        const dosageRecord = JSON.parse(dosageAsBytes.toString());
        if (dosageRecord.status !== 'ACTIVE') {
            throw new Error(`Compliance Breach: Dosage record ${dosageID} is currently ${dosageRecord.status}.`);
        }

        const administration = {
            docType: 'patientAdministration',
            adminID: adminID,
            patientID: patientID, // Hashed/Pseudonymized ID
            dosageID: dosageID,
            trialID: trialID,
            site: site,
            timestamp: timestamp || new Date().toISOString()
        };

        await ctx.stub.putState(adminID, Buffer.from(JSON.stringify(administration)));
        return JSON.stringify(administration);
    }

    async logDosage(ctx, logID, patientID, trialID, dosage, herbBatchID, recordedBy) {
        // Legacy fallback method for backwards compatibility
        const consents = await this.getConsent(ctx, patientID);
        if (!consents || consents.length === 0) {
            throw new Error(`Compliance Breach: No valid consent found for patient ${patientID}`);
        }
        const batch = await this.getHerbBatch(ctx, herbBatchID);
        if (batch.status !== 'CERTIFIED') {
            throw new Error(`Compliance Breach: Herb batch ${herbBatchID} is not certified.`);
        }
        const dosageLog = {
            docType: 'dosageLog',
            patientID: patientID,
            trialID: trialID,
            dosage: dosage,
            herbBatchID: herbBatchID,
            timestamp: new Date().toISOString(),
            recordedBy: recordedBy
        };
        await ctx.stub.putState(logID, Buffer.from(JSON.stringify(dosageLog)));
        return JSON.stringify(dosageLog);
    }

    // 4. Adverse Event Contract
    async reportAdverseEvent(ctx, eventID, patientID, severity, description, resolutionRef) {
        const event = {
            docType: 'adverseEvent',
            eventID: eventID,
            patientID: patientID,
            severity: severity, // 'AE' or 'SAE'
            description: description,
            reportedAt: new Date().toISOString(),
            notifiedAt: '', // To be updated when IEC is notified via events
            status: 'REPORTED',
            resolutionRef: resolutionRef
        };
        
        // Dispatch blockchain event for Severe Adverse Events (SAE) to notify Ethics Committee
        if (severity === 'SAE') {
            ctx.stub.setEvent('SAEReported', Buffer.from(JSON.stringify(event)));
        }
        
        await ctx.stub.putState(eventID, Buffer.from(JSON.stringify(event)));
        return JSON.stringify(event);
    }
    
    // 5. Protocol Deviation Contract
    async logProtocolDeviation(ctx, deviationID, trialID, description, reportedBy) {
        const deviation = {
            docType: 'protocolDeviation',
            deviationID: deviationID,
            trialID: trialID,
            description: description,
            reportedBy: reportedBy,
            approvals: [],
            status: 'PENDING_APPROVAL'
        };

        await ctx.stub.putState(deviationID, Buffer.from(JSON.stringify(deviation)));
        return JSON.stringify(deviation);
    }

    async approveProtocolDeviation(ctx, deviationID, approverID) {
        const deviationAsBytes = await ctx.stub.getState(deviationID);
        if (!deviationAsBytes || deviationAsBytes.length === 0) {
            throw new Error(`Deviation ${deviationID} does not exist`);
        }
        const deviation = JSON.parse(deviationAsBytes.toString());
        
        // Add approver
        if(!deviation.approvals.includes(approverID)){
            deviation.approvals.push(approverID);
        }
        
        // Rule: Requires dual signature (e.g., PI + Ethics Committee)
        if (deviation.approvals.length >= 2) {
            deviation.status = 'RESOLVED';
        }

        await ctx.stub.putState(deviationID, Buffer.from(JSON.stringify(deviation)));
        return JSON.stringify(deviation);
    }
    
    // Generic Query Function
    async queryAllAssets(ctx, docType) {
        const queryString = {
            selector: {
                docType: docType
            }
        };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return JSON.stringify(allResults);
    }
}

module.exports = AyurvedaClinicalTrialContract;
