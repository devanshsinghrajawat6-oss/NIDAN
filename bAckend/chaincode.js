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
    async registerHerbBatch(ctx, batchID, supplierID, herbType, certificationRef, harvestDate, testResultsHash) {
        const batch = {
            docType: 'herbBatch',
            batchID: batchID,
            supplierID: supplierID,
            herbType: herbType,
            certificationRef: certificationRef,
            harvestDate: harvestDate,
            testResultsHash: testResultsHash,
            status: 'CERTIFIED'
        };

        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(batch)));
        return JSON.stringify(batch);
    }

    async getHerbBatch(ctx, batchID) {
        const batchAsBytes = await ctx.stub.getState(batchID);
        if (!batchAsBytes || batchAsBytes.length === 0) {
            throw new Error(`${batchID} does not exist`);
        }
        return JSON.parse(batchAsBytes.toString());
    }

    // 3. Dosage Log Contract with Compliance Rules
    async logDosage(ctx, logID, patientID, trialID, dosage, herbBatchID, recordedBy) {
        // Rule: Consent must exist and be valid for patient
        const consents = await this.getConsent(ctx, patientID);
        if (!consents || consents.length === 0) {
            throw new Error(`Compliance Breach: No valid consent found for patient ${patientID}`);
        }

        // Rule: Herb batch must be certified
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
