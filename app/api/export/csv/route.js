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

    // Generate CSV Header
    const headers = ["Patient ID", "Trial ID", "Site", "Age", "Gender", "Status", "Enrolment Date"].join(",");
    
    // Generate Rows
    const rows = patients.map(p => {
      return [
        p.patientId || "",
        p.trialId || "",
        p.site || "",
        p.age || "",
        p.gender || "",
        p.status || "",
        p.enrolmentDate ? new Date(p.enrolmentDate).toISOString() : ""
      ].map(v => `"${v}"`).join(",");
    });

    const csvContent = [headers, ...rows].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="patients_export_${trialId || 'all'}.csv"`
      },
    });

  } catch (error) {
    console.error('CSV Export Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
