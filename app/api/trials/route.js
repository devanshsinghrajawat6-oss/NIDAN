import { NextResponse } from 'next/server';
import { connectDB, Trial } from '@/lib/db';
import { writeAuditLog } from '@/lib/audit';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const { searchParams } = new URL(request.url);
        const trialId = searchParams.get('trialId');
        const query = trialId ? { trialId } : {};

        const trials = await Trial.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: trials }, { status: 200 });
    } catch (error) {
        console.error('Trial API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        
        const allowedRoles = ["Admin", "Investigator"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ success: false, error: "Forbidden: Insufficient permissions" }, { status: 403 });
        }

        await connectDB();
        const body = await req.json();
        
        if (body.principalInvestigator && /\d/.test(body.principalInvestigator)) {
            return NextResponse.json({ success: false, error: "Principal Investigator name cannot contain numbers." }, { status: 400 });
        }
        if (body.name && /^\d+$/.test(body.name.trim())) {
            return NextResponse.json({ success: false, error: "Trial title cannot consist of only numbers." }, { status: 400 });
        }
        
        const newTrial = new Trial({
            trialId: body.trialId,
            name: body.name,
            phase: body.phase,
            status: body.status || 'Active',
            enrollmentCurrent: body.enrollmentCurrent || 0,
            enrollmentTarget: body.enrollmentTarget || 100,
            complianceScore: body.complianceScore || 100,
            principalInvestigator: body.principalInvestigator,
            site: body.site || 'AIIA New Delhi',
            herbFormulation: body.herbFormulation,
            description: body.description,
            primaryObjective: body.primaryObjective,
            secondaryObjectives: body.secondaryObjectives || [],
            studyDesign: body.studyDesign || 'Randomized Controlled Trial',
            blindingType: body.blindingType || 'Double-blind',
            multiCentre: body.multiCentre || false,
            sites: body.sites || [body.site || 'AIIA New Delhi'],
            protocolVersion: body.protocolVersion || '1.0',
            iecApprovalStatus: body.iecApprovalStatus || 'Approved',
            iecApprovalNumber: body.iecApprovalNumber,
            iecApprovalDate: body.iecApprovalDate,
            iecExpiryDate: body.iecExpiryDate,
            ctriRegistration: body.ctriRegistration,
            ctriLastUpdated: body.ctriLastUpdated || new Date(),
            nextCTRIUpdateDue: body.nextCTRIUpdateDue,
            nextMonitoringVisitDate: body.nextMonitoringVisitDate,
            siteActivationDate: body.siteActivationDate || new Date(),
        });

        await newTrial.save();

        await writeAuditLog({
            action: 'TRIAL_REGISTERED',
            resource: 'Trial',
            resourceId: body.trialId,
            newValue: { trialId: body.trialId, name: body.name, phase: body.phase, ctriRegistration: body.ctriRegistration }
        });

        return NextResponse.json({ success: true, data: newTrial }, { status: 201 });
    } catch (error) {
        console.error('Trial API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
