import { NextResponse } from 'next/server';
import { connectDB, PatientAdministration, DosageRecord, Patient } from '@/lib/db';
import { storeOnBlockchain } from '@/lib/blockchain';
import { writeAuditLog } from '@/lib/audit';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const dosageId = searchParams.get('dosageId');
    
    let query = {};
    if (patientId) query.patientId = patientId;
    if (dosageId) query.dosageId = dosageId;

    const admins = await PatientAdministration.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: admins }, { status: 200 });
  } catch (error) {
    console.error('PatientAdministration API GET Error:', error);
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

    await connectDB();
    const body = await req.json();

    if (!body.patientId || !body.dosageId || !body.trialId || !body.site) {
      return NextResponse.json({ success: false, error: "Missing required fields: patientId, dosageId, trialId, site" }, { status: 400 });
    }

    // ─── PRIVACY / DPDP CHECK ───────────────────────────────────────────────
    // Ensure patientId is pseudonymous/ID format (e.g. PT-1001 or AYU-ASH-001-A), not raw PII name
    let targetPatientId = body.patientId;
    const patientDoc = await Patient.findOne({ 
      $or: [{ patientId: body.patientId }, { pseudonymizedId: body.patientId }] 
    });

    if (patientDoc) {
      targetPatientId = patientDoc.pseudonymizedId || patientDoc.patientId;
    }

    // ─── DOSAGE RECORD VALIDATION ───────────────────────────────────────────
    const dosage = await DosageRecord.findOne({ dosageId: body.dosageId });
    if (!dosage) {
      return NextResponse.json({ success: false, error: `Dosage Record '${body.dosageId}' not found.` }, { status: 400 });
    }
    if (dosage.status !== 'Active') {
      return NextResponse.json({ 
        success: false, 
        error: `Compliance Breach: Dosage Record '${body.dosageId}' is marked as '${dosage.status}'. Cannot administer to patient.` 
      }, { status: 400 });
    }

    const adminId = body.administrationId || `ADM-${Date.now().toString().slice(-6)}`;

    // Write to Blockchain (using pseudonymous ID ONLY)
    const blockchainTxHash = await storeOnBlockchain(
      adminId,
      {
        administrationId: adminId,
        pseudonymizedPatientId: targetPatientId,
        dosageId: body.dosageId,
        trialId: body.trialId,
        site: body.site,
        administeredAt: new Date().toISOString()
      },
      "PATIENT_ADMINISTRATION",
      body.dosageAmount || "Standard Dosage"
    );

    const newAdmin = new PatientAdministration({
      administrationId: adminId,
      patientId: targetPatientId,
      dosageId: body.dosageId,
      trialId: body.trialId,
      site: body.site,
      administeredAt: body.administeredAt ? new Date(body.administeredAt) : new Date(),
      administeredBy: session.user.name || session.user.email,
      dosageAmount: body.dosageAmount || '500mg twice daily',
      notes: body.notes || 'Administered according to protocol dosage guidelines.',
      blockchainTxHash
    });

    await newAdmin.save();

    await writeAuditLog({
      action: 'PATIENT_DOSAGE_ADMINISTERED',
      resource: 'PatientAdministration',
      resourceId: adminId,
      userEmail: session.user.email,
      userRole: session.user.role,
      newValue: { administrationId: adminId, patientId: targetPatientId, dosageId: body.dosageId, site: body.site, blockchainTxHash }
    });

    return NextResponse.json({ success: true, data: newAdmin }, { status: 201 });
  } catch (error) {
    console.error('PatientAdministration API POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
