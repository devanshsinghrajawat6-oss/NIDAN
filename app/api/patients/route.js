import { NextResponse } from 'next/server';
import { connectDB, Patient } from '@/lib/db';
import { storeOnBlockchain } from '@/lib/blockchain';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { 
    validatePersonName, validateIdCode, validateAge, 
    validateContactNumber, validateAbhaId, validateVitals,
    calculateStatutoryCompensation
} from '@/lib/validation';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const patients = await Patient.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: patients }, { status: 200 });
    } catch (error) {
        console.error('Patient API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        
        const allowedRoles = ["Admin", "Investigator", "Coordinator"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ success: false, error: "Forbidden: Insufficient permissions" }, { status: 403 });
        }

        const body = await req.json();
        await connectDB();

        // 1. Validation Checks
        const nameErr = body.fullName ? validatePersonName(body.fullName, "Patient Full Name") : null;
        if (nameErr) return NextResponse.json({ success: false, error: nameErr }, { status: 400 });

        const idErr = validateIdCode(body.patientId || "", "Subject ID");
        if (idErr) return NextResponse.json({ success: false, error: idErr }, { status: 400 });

        const ageErr = validateAge(body.age);
        if (ageErr) return NextResponse.json({ success: false, error: ageErr }, { status: 400 });

        const phoneErr = validateContactNumber(body.contactNumber);
        if (phoneErr) return NextResponse.json({ success: false, error: phoneErr }, { status: 400 });

        const abhaErr = validateAbhaId(body.abhaId);
        if (abhaErr) return NextResponse.json({ success: false, error: abhaErr }, { status: 400 });

        const vitalsErr = validateVitals(body.baselineVitals);
        if (vitalsErr) return NextResponse.json({ success: false, error: vitalsErr }, { status: 400 });

        // 2. Generate Pseudonymized ID if not provided
        const pseudonymizedId = body.pseudonymizedId || `AYU-${body.trialId || 'CT'}-${String(Math.floor(100 + Math.random() * 900))}`;

        // 3. Compute Statutory Compensation if SAE / Risk parameters provided
        const ageVal = body.age || 40;
        const riskFactorVal = body.diseaseRiskFactor !== undefined ? Number(body.diseaseRiskFactor) : 4.0;
        const isHighMortality = Boolean(body.expectedMortality30Days90Percent);
        const compCalc = calculateStatutoryCompensation(ageVal, riskFactorVal, isHighMortality);

        // 4. Submit consent hash to Blockchain
        const txHash = await storeOnBlockchain(
            body.patientId,
            {
                trialId: body.trialId,
                pseudonymizedId,
                consentStatus: body.consentStatus || "Consented",
                avRecorded: Boolean(body.audioVisualRecordingDone)
            },
            "CONSENT",
            body.dosage || ""
        );

        // 5. Store in MongoDB with full GCP fields
        const newPatient = new Patient({
            patientId: body.patientId,
            pseudonymizedId,
            fullName: body.fullName,
            address: body.address,
            dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
            age: body.age ? Number(body.age) : undefined,
            gender: body.gender || 'Prefer not to say',
            contactNumber: body.contactNumber,
            abhaId: body.abhaId,
            hospitalRegNumber: body.hospitalRegNumber,
            dosage: body.dosage,
            armAssigned: body.armAssigned,
            randomizationNumber: body.randomizationNumber,
            trialId: body.trialId,
            site: body.site || 'AIIA New Delhi',
            stage: body.stage || 'Enrolled',
            consentStatus: body.consentStatus || 'Consented',
            consentDate: body.consentDate ? new Date(body.consentDate) : new Date(),
            consentVersion: body.consentVersion || '1.0',
            witnessName: body.witnessName,
            administeredByName: body.administeredByName,
            medicallyQualifiedPerson: body.medicallyQualifiedPerson !== undefined ? Boolean(body.medicallyQualifiedPerson) : true,
            audioVisualRecordingDone: Boolean(body.audioVisualRecordingDone),
            reConsentDone: Boolean(body.reConsentDone),
            reConsentDate: body.reConsentDate ? new Date(body.reConsentDate) : undefined,
            inclusionCriteriaMet: body.inclusionCriteriaMet !== undefined ? Boolean(body.inclusionCriteriaMet) : true,
            exclusionCriteriaMet: body.exclusionCriteriaMet !== undefined ? Boolean(body.exclusionCriteriaMet) : false,
            inclusionExclusionNotes: body.inclusionExclusionNotes,
            baselineVitals: body.baselineVitals || {},
            baselineLabData: body.baselineLabData || {},
            diagnosticEvaluations: body.diagnosticEvaluations,
            screeningDate: body.screeningDate ? new Date(body.screeningDate) : new Date(),
            enrolmentDate: body.enrolmentDate ? new Date(body.enrolmentDate) : new Date(),
            randomizationDate: body.randomizationDate ? new Date(body.randomizationDate) : undefined,
            withdrawalDate: body.withdrawalDate ? new Date(body.withdrawalDate) : undefined,
            withdrawalReason: body.withdrawalReason,
            lastFollowUpDate: body.lastFollowUpDate ? new Date(body.lastFollowUpDate) : undefined,
            completionDate: body.completionDate ? new Date(body.completionDate) : undefined,
            sourceDataVerified: Boolean(body.sourceDataVerified),
            saeOccurred: Boolean(body.saeOccurred),
            diseaseRiskFactor: riskFactorVal,
            expectedMortality30Days90Percent: isHighMortality,
            calculatedCompensation: compCalc.compensation,
            concomitantMedications: body.concomitantMedications,
            subjectDiaryMaintained: body.subjectDiaryMaintained !== undefined ? Boolean(body.subjectDiaryMaintained) : true,
            blockchainTxHash: txHash
        });

        await newPatient.save();
        return NextResponse.json({ success: true, data: newPatient }, { status: 201 });
    } catch (error) {
        console.error('Patient API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

