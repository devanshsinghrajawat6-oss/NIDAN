/**
 * Compliance Rule Engine
 * ======================
 * Enforces regulatory compliance rules from the chaincode:
 * - GCP-Ayurveda (Ministry of Ayush)
 * - CDSCO Clinical Trial Rules 2019
 * - ICMR-NIA Ethical Guidelines
 * - CTRI Registration Mandates
 * - IEC Approval Requirements
 * - SAE Reporting Timeline Enforcement
 */

const Patient = require('../models/Patient');
const Trial = require('../models/Trial');
const AdverseEvent = require('../models/AdverseEvent');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const ledger = require('./ledger');

class ComplianceEngine {

    async validateConsent(patientId) {
        const patient = await Patient.findOne({ patientId });
        if (!patient) {
            return { valid: false, breach: 'PATIENT_NOT_FOUND', message: `Patient ${patientId} not registered.` };
        }
        if (patient.consentStatus !== 'Consented') {
            return { valid: false, breach: 'NO_VALID_CONSENT', message: `Patient ${patientId} consent status: ${patient.consentStatus}` };
        }
        if (patient.consentExpiryDate && new Date(patient.consentExpiryDate) < new Date()) {
            return { valid: false, breach: 'CONSENT_EXPIRED', message: `Consent expired on ${patient.consentExpiryDate}.` };
        }
        return { valid: true, message: 'Consent validated ✓' };
    }

    async validateTrialCompliance(trialId) {
        const trial = await Trial.findOne({ trialId });
        if (!trial) {
            return { valid: false, breaches: [{ rule: 'TRIAL_NOT_FOUND', message: `Trial ${trialId} not found.` }], complianceScore: 0 };
        }

        const breaches = [];
        if (trial.iecApprovalStatus !== 'Approved') {
            breaches.push({ rule: 'IEC_APPROVAL', message: `IEC status: ${trial.iecApprovalStatus}` });
        }
        if (trial.iecExpiryDate && new Date(trial.iecExpiryDate) < new Date()) {
            breaches.push({ rule: 'IEC_EXPIRED', message: `IEC expired on ${trial.iecExpiryDate}.` });
        }
        if (!trial.ctriRegistration) {
            breaches.push({ rule: 'CTRI_MISSING', message: 'CTRI registration missing.' });
        }
        if (trial.status === 'Suspended' || trial.status === 'Terminated') {
            breaches.push({ rule: 'TRIAL_INACTIVE', message: `Trial is ${trial.status}.` });
        }

        return {
            valid: breaches.length === 0,
            breaches,
            complianceScore: Math.max(0, 100 - (breaches.length * 25)),
            message: breaches.length === 0 ? 'Trial compliance verified ✓' : `${breaches.length} issue(s) detected.`,
        };
    }

    async checkSAETimeliness() {
        const unreportedSAEs = await AdverseEvent.find({
            severity: 'SAE',
            iecNotified: false,
            status: { $ne: 'Resolved' },
        });

        const breaches = [];
        const now = new Date();

        for (const sae of unreportedSAEs) {
            const hoursSinceReport = (now - new Date(sae.reportedAt)) / (1000 * 60 * 60);
            if (hoursSinceReport > 24) {
                breaches.push({
                    eventId: sae.eventId,
                    patientId: sae.patientId,
                    trialId: sae.trialId,
                    hoursSinceReport: Math.round(hoursSinceReport),
                    rule: 'SAE_24HR_NOTIFICATION',
                    message: `SAE ${sae.eventId} not notified to IEC after ${Math.round(hoursSinceReport)}h (limit: 24h).`,
                });

                await Notification.create({
                    type: 'SAE_Alert',
                    title: 'URGENT: SAE Notification Overdue',
                    message: `SAE ${sae.eventId} for patient ${sae.patientId} requires IEC notification. ${Math.round(hoursSinceReport)}h elapsed.`,
                    severity: 'critical',
                    targetRole: 'Ethics Committee',
                    relatedResourceType: 'AdverseEvent',
                    relatedResourceId: sae.eventId,
                    actionRequired: true,
                });
            }
        }

        return { breaches, totalOverdue: breaches.length };
    }

    async runFullComplianceCheck() {
        const trials = await Trial.find({ status: { $in: ['Active', 'Pending'] } });
        const results = {
            timestamp: new Date().toISOString(),
            totalTrials: trials.length,
            compliantTrials: 0,
            nonCompliantTrials: 0,
            totalBreaches: 0,
            trialResults: [],
            saeTimeliness: null,
            overallScore: 0,
            regulatoryFrameworks: [
                'GCP-Ayurveda (Ministry of Ayush)',
                'CDSCO New Drugs & Clinical Trials Rules 2019',
                'ICMR-NIA Ethical Guidelines',
                'CTRI Registration Mandates',
                'IEC Approval Requirements',
            ],
        };

        for (const trial of trials) {
            const trialCompliance = await this.validateTrialCompliance(trial.trialId);
            const patients = await Patient.find({ trialId: trial.trialId });
            let patientBreaches = 0;

            for (const patient of patients) {
                const consentCheck = await this.validateConsent(patient.patientId);
                if (!consentCheck.valid) patientBreaches++;
            }

            const isCompliant = trialCompliance.valid && patientBreaches === 0;
            if (isCompliant) results.compliantTrials++;
            else results.nonCompliantTrials++;

            results.totalBreaches += trialCompliance.breaches.length + patientBreaches;
            results.trialResults.push({
                trialId: trial.trialId,
                name: trial.name,
                compliant: isCompliant,
                score: trialCompliance.complianceScore,
                breaches: trialCompliance.breaches.length + patientBreaches,
            });

            trial.complianceScore = trialCompliance.complianceScore;
            await trial.save();
        }

        results.saeTimeliness = await this.checkSAETimeliness();
        results.totalBreaches += results.saeTimeliness.totalOverdue;

        if (trials.length > 0) {
            results.overallScore = Math.round(
                results.trialResults.reduce((sum, t) => sum + t.score, 0) / trials.length
            );
        } else {
            results.overallScore = 100;
        }

        await ledger.submitTransaction(
            'COMPLIANCE_CHECK',
            { overallScore: results.overallScore, totalBreaches: results.totalBreaches },
            'ComplianceEngine',
            'GovAyushResearchInstituteMSP'
        );

        await AuditLog.create({
            action: 'COMPLIANCE_CHECK_EXECUTED',
            actor: 'ComplianceEngine',
            role: 'System',
            resourceType: 'ComplianceReport',
            resourceId: `CR-${Date.now()}`,
            details: `Score: ${results.overallScore}%, Breaches: ${results.totalBreaches}`,
            severity: results.totalBreaches > 0 ? 'Warning' : 'Info',
        });

        return results;
    }

    async logRegulatedAction(action, actor, role, resourceType, resourceId, details) {
        const block = await ledger.submitTransaction(
            action, { resourceType, resourceId, details }, actor, this._mapRoleToMSP(role)
        );
        await AuditLog.create({
            action, actor, role, resourceType, resourceId, details, blockchainTxHash: block.hash,
        });
        return block;
    }

    _mapRoleToMSP(role) {
        const mapping = {
            'Admin': 'GovAyushResearchInstituteMSP',
            'Lead Doctor': 'TrialSiteHospitalMSP',
            'Investigator': 'TrialSiteHospitalMSP',
            'Ethics Committee': 'EthicsCommitteeMSP',
            'Pharmacovigilance': 'GovAyushResearchInstituteMSP',
            'Supplier': 'HerbSupplierMSP',
            'Leadership': 'GovAyushResearchInstituteMSP',
            'System': 'GovAyushResearchInstituteMSP',
        };
        return mapping[role] || 'GovAyushResearchInstituteMSP';
    }
}

const complianceEngine = new ComplianceEngine();
module.exports = complianceEngine;
