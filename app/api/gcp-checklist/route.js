import { NextResponse } from 'next/server';
import { connectDB, GcpChecklist } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        await connectDB();
        const { searchParams } = new URL(req.url);
        const trialId = searchParams.get('trialId');

        const query = trialId ? { trialId } : {};
        const checklists = await GcpChecklist.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: checklists });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const allowedRoles = ["Admin", "Investigator", "Monitor", "Regulator"];
        if (!allowedRoles.includes(session.user.role)) {
            return NextResponse.json({ success: false, error: "Forbidden: Insufficient permissions" }, { status: 403 });
        }

        const body = await req.json();
        await connectDB();

        const checklistId = body.checklistId || `GCP-AUDIT-${Date.now()}`;
        
        // Calculate compliance score based on Yes / No items
        const items = body.checklistItems || [];
        const yesCount = items.filter(i => i.status === 'Yes').length;
        const totalEvaluated = items.filter(i => i.status !== 'NA').length;
        const overallScore = totalEvaluated > 0 ? Math.round((yesCount / totalEvaluated) * 100) : 100;

        const newAudit = new GcpChecklist({
            checklistId,
            trialId: body.trialId,
            siteName: body.siteName || 'All India Institute of Ayurveda',
            inspectionDate: body.inspectionDate ? new Date(body.inspectionDate) : new Date(),
            inspectionTeam: body.inspectionTeam || [session.user.name],
            personnelPresent: body.personnelPresent || [],
            investigatorDetails: body.investigatorDetails,
            sponsorDetails: body.sponsorDetails,
            stageOfStudy: body.stageOfStudy || 'During Conduct of trial',
            typeOfInspection: body.typeOfInspection || 'Surveillance',
            checklistItems: items,
            overallScore,
            auditedBy: session.user.name || session.user.email
        });

        await newAudit.save();
        return NextResponse.json({ success: true, data: newAudit }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
