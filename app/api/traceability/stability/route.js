import { NextResponse } from 'next/server';
import { connectDB, HerbBatch } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const batches = await HerbBatch.find({}).sort({ createdAt: -1 });

    // Mock stability data for each batch per CDSCO Dec 2011 guidelines
    const stabilityRecords = batches.map(b => ({
      batchId: b.batchId,
      herbName: b.herbName,
      supplierName: b.supplierName,
      phase: "Phase II / Phase III",
      storageCondition: "25°C ± 2°C / 60% RH ± 5% RH (Real Time) & 40°C ± 2°C / 75% RH ± 5% RH (Accelerated)",
      containerClosureSystem: "HDPE Container with Induction Sealed Cap",
      activeIngredientSpecs: {
        genericName: b.herbName,
        chemicalName: `${b.herbName} Standardized Extract (Withanolides 5%)`,
        empiricalFormula: "C28H38O6 (Withaferin A)",
        molecularWeight: "470.60 g/mol",
        analyticalMethods: ["HPLC Assay", "IR Spectroscopy", "UV Spectrum", "LC-MS Impurity Profiling"],
        impurityProfile: [
          { name: "Withanolide D Impurity", limit: "< 0.5%", result: "0.12%" },
          { name: "Heavy Metals (Lead/Arsenic)", limit: "< 10 ppm", result: "Passed (< 1 ppm)" },
          { name: "Aflatoxin B1", limit: "< 2 ppb", result: "Passed" }
        ]
      },
      stabilityTestingIntervals: [
        { month: 0, assay: "99.4%", moisture: "2.1%", status: "Compliant" },
        { month: 1, assay: "99.1%", moisture: "2.3%", status: "Compliant" },
        { month: 3, assay: "98.7%", moisture: "2.4%", status: "Compliant" },
        { month: 6, assay: "98.2%", moisture: "2.6%", status: "Compliant" }
      ],
      significantChangeDetected: false, // 10-day reporting trigger flag
      significantChangeNotice: "No significant changes observed. Assay retained >98% strength."
    }));

    return NextResponse.json({ success: true, data: stabilityRecords });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
