import { NextResponse } from 'next/server';
import { connectDB, Patient } from '@/lib/db';
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
    const patients = await Patient.find(query).lean();

    const emptyHtml = `<html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Patients</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
      </head>
      <body>
        <table>
          <tr><th>Patient ID</th><th>Trial ID</th><th>Site</th><th>Age</th><th>Gender</th><th>Status</th><th>Enrolment Date</th></tr>
        </table>
      </body>
    </html>`;

    if (patients.length === 0) {
      return new NextResponse(emptyHtml, { 
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="patients_export_empty.xls"`
        }
      });
    }

    // Generate Rows
    const rows = patients.map(p => {
      return `<tr>
        <td>${p.patientId || ""}</td>
        <td>${p.trialId || ""}</td>
        <td>${p.site || ""}</td>
        <td>${p.age || ""}</td>
        <td>${p.gender || ""}</td>
        <td>${p.status || ""}</td>
        <td>${p.enrolmentDate ? new Date(p.enrolmentDate).toISOString() : ""}</td>
      </tr>`;
    }).join("");

    const fullHtml = `<html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Patients</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
      </head>
      <body>
        <table>
          <tr><th>Patient ID</th><th>Trial ID</th><th>Site</th><th>Age</th><th>Gender</th><th>Status</th><th>Enrolment Date</th></tr>
          ${rows}
        </table>
      </body>
    </html>`;

    return new NextResponse(fullHtml, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel',
        'Content-Disposition': `attachment; filename="patients_export_${trialId || 'all'}.xls"`
      },
    });

  } catch (error) {
    console.error('Excel Export Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
