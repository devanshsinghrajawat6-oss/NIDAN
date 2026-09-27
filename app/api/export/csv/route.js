import { NextResponse } from 'next/server';
import { connectDB, Patient } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success, remaining, reset } = rateLimit(ip, 10, 60000); // 10 requests per minute
    if (!success) {
      return NextResponse.json({ success: false, error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const trialId = searchParams.get('trialId');

    const query = trialId ? { trialId } : {};
    const patients = await Patient.find(query).lean();

    if (patients.length === 0) {
      return new NextResponse("Patient ID,Trial ID,Site,Age,Gender,Status\n", { 
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="patients_export_empty.csv"`
        }
      });
    }

    // Generate CSV Header with full GCP parameters
    const headers = [
      "Subject ID", "Pseudonymized ID", "Full Name", "Hospital Reg No (MRN)",
      "Age", "Gender", "Contact Number", "ABHA ID",
      "Trial ID", "Clinical Site", "Arm Assigned", "Randomization No", "Prescribed Dosage",
      "Consent Status", "Consent Date", "Audio-Visual Recording", "Re-Consent Done",
      "Screening Date", "Enrolment Date", "Last Follow-Up Date (LPLFU)", "Study Stage",
      "Withdrawal Reason", "Source Data Verified",
      "BP Systolic (mmHg)", "BP Diastolic (mmHg)", "Pulse (bpm)", "Hb (g/dL)", "WBC (cells/mcL)", "Creatinine (mg/dL)", "Sugar (mg/dL)",
      "SAE Occurred", "Disease Risk Factor (R)", "Statutory Compensation (INR)"
    ].join(",");
    
    // Generate Rows
    const rows = patients.map(p => {
      const vitals = p.baselineVitals || {};
      const labs = p.baselineLabData || {};
      return [
        p.patientId || "",
        p.pseudonymizedId || "",
        p.fullName || "",
        p.hospitalRegNumber || "",
        p.age !== undefined ? p.age : "",
        p.gender || "",
        p.contactNumber || "",
        p.abhaId || "",
        p.trialId || "",
        p.site || "",
        p.armAssigned || "",
        p.randomizationNumber || "",
        p.dosage || "",
        p.consentStatus || "",
        p.consentDate ? new Date(p.consentDate).toLocaleDateString('en-IN') : "",
        p.audioVisualRecordingDone ? "YES" : "NO",
        p.reConsentDone ? "YES" : "NO",
        p.screeningDate ? new Date(p.screeningDate).toLocaleDateString('en-IN') : "",
        p.enrolmentDate ? new Date(p.enrolmentDate).toLocaleDateString('en-IN') : "",
        p.lastFollowUpDate ? new Date(p.lastFollowUpDate).toLocaleDateString('en-IN') : "",
        p.stage || "Enrolled",
        p.withdrawalReason || "",
        p.sourceDataVerified ? "YES" : "NO",
        vitals.bloodPressureSystolic !== undefined ? vitals.bloodPressureSystolic : "",
        vitals.bloodPressureDiastolic !== undefined ? vitals.bloodPressureDiastolic : "",
        vitals.pulseRate !== undefined ? vitals.pulseRate : "",
        labs.haemoglobin !== undefined ? labs.haemoglobin : "",
        labs.wbcCount !== undefined ? labs.wbcCount : "",
        labs.serumCreatinine !== undefined ? labs.serumCreatinine : "",
        labs.fastingBloodSugar !== undefined ? labs.fastingBloodSugar : "",
        p.saeOccurred ? "YES" : "NO",
        p.diseaseRiskFactor !== undefined ? p.diseaseRiskFactor : "",
        p.calculatedCompensation !== undefined ? p.calculatedCompensation : ""
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });

    const csvContent = [headers, ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="clinical_patients_gcp_export_${trialId || 'all'}.csv"`
      },
    });

  } catch (error) {
    console.error('CSV Export Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

