import { NextResponse } from 'next/server';
import { connectDB, Patient } from '@/lib/db';
import { storeOnBlockchain } from '@/lib/blockchain';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

        if (body.fullName && /\d/.test(body.fullName)) {
            return NextResponse.json({ success: false, error: "Patient name cannot contain numbers." }, { status: 400 });
        }
        
        // 1. Submit consent hash to Blockchain
        const txHash = await storeOnBlockchain(
            body.patientId,
            {
                trialId: body.trialId,
                pseudonymizedId: body.pseudonymizedId,
                consentStatus: body.consentStatus || "Consented"
            },
            "CONSENT",
            body.dosage || ""
        );

        // 2. Store in MongoDB
        const newPatient = new Patient({
            patientId: body.patientId,
            pseudonymizedId: body.pseudonymizedId,
            fullName: body.fullName,
            address: body.address,
            dosage: body.dosage,
            trialId: body.trialId,
            site: body.site,
            consentStatus: body.consentStatus || 'Consented',
            consentDate: new Date(),
            blockchainTxHash: txHash
        });

        await newPatient.save();
        return NextResponse.json({ success: true, data: newPatient }, { status: 201 });
    } catch (error) {
        console.error('Patient API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
