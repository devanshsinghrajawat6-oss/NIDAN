import { NextResponse } from 'next/server';
import { connectDB, Patient } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { 
    validatePersonName, validateAge, validateContactNumber, 
    validateAbhaId, validateVitals, calculateStatutoryCompensation 
} from '@/lib/validation';

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await connectDB();
        
        const patient = await Patient.findOne({ $or: [{ _id: id }, { patientId: id }, { pseudonymizedId: id }] });
        if (!patient) {
            return NextResponse.json({ success: false, error: "Patient record not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: patient });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const allowedRoles = ["Admin", "Investigator", "Coordinator"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ success: false, error: "Forbidden: Insufficient permissions" }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        await connectDB();

        // Validation
        if (body.fullName) {
            const nameErr = validatePersonName(body.fullName, "Patient Full Name");
            if (nameErr) return NextResponse.json({ success: false, error: nameErr }, { status: 400 });
        }
        if (body.age !== undefined) {
            const ageErr = validateAge(body.age);
            if (ageErr) return NextResponse.json({ success: false, error: ageErr }, { status: 400 });
        }
        if (body.contactNumber) {
            const phoneErr = validateContactNumber(body.contactNumber);
            if (phoneErr) return NextResponse.json({ success: false, error: phoneErr }, { status: 400 });
        }
        if (body.abhaId) {
            const abhaErr = validateAbhaId(body.abhaId);
            if (abhaErr) return NextResponse.json({ success: false, error: abhaErr }, { status: 400 });
        }
        if (body.baselineVitals) {
            const vitalsErr = validateVitals(body.baselineVitals);
            if (vitalsErr) return NextResponse.json({ success: false, error: vitalsErr }, { status: 400 });
        }

        // Recalculate compensation if relevant fields changed
        if (body.age !== undefined || body.diseaseRiskFactor !== undefined || body.expectedMortality30Days90Percent !== undefined) {
            const ageVal = body.age !== undefined ? Number(body.age) : 40;
            const riskFactorVal = body.diseaseRiskFactor !== undefined ? Number(body.diseaseRiskFactor) : 4.0;
            const isHighMortality = Boolean(body.expectedMortality30Days90Percent);
            const compCalc = calculateStatutoryCompensation(ageVal, riskFactorVal, isHighMortality);
            body.calculatedCompensation = compCalc.compensation;
        }

        const updated = await Patient.findOneAndUpdate(
            { $or: [{ _id: id }, { patientId: id }] },
            { $set: body },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ success: false, error: "Patient record not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        if (session.user.role !== "Admin") {
            return NextResponse.json({ success: false, error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const { id } = await params;
        await connectDB();
        
        const deleted = await Patient.findOneAndDelete({ $or: [{ _id: id }, { patientId: id }] });
        if (!deleted) {
            return NextResponse.json({ success: false, error: "Patient record not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Patient record deleted successfully" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
