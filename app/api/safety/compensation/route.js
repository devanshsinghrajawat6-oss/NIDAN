import { NextResponse } from 'next/server';
import { connectDB, Patient } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const WORKMEN_AGE_FACTORS = {
  16: 228.54, 17: 227.49, 18: 226.38, 19: 225.22, 20: 224.00,
  21: 222.71, 22: 221.37, 23: 219.95, 24: 218.47, 25: 216.91,
  26: 215.28, 27: 213.57, 28: 211.79, 29: 209.92, 30: 207.98,
  31: 205.95, 32: 203.85, 33: 201.66, 34: 199.40, 35: 197.06,
  36: 194.64, 37: 192.14, 38: 189.56, 39: 186.90, 40: 184.17,
  41: 181.37, 42: 178.49, 43: 175.54, 44: 172.52, 45: 169.44,
  46: 166.29, 47: 163.07, 48: 159.80, 49: 156.47, 50: 153.09,
  51: 149.67, 52: 146.20, 53: 142.68, 54: 139.13, 55: 135.56,
  56: 131.95, 57: 128.33, 58: 124.70, 59: 121.05, 60: 117.41,
  61: 113.77, 62: 110.14, 63: 106.52, 64: 102.93, 65: 99.37
};

export function calculateCompensation({ age, riskFactor, expectedMortality90Percent }) {
  if (expectedMortality90Percent) {
    return {
      baseAmount: 800000,
      ageFactor: 99.37,
      riskFactor,
      isFixed90PercentOverride: true,
      compensationAmount: 200000, // Fixed 2 Lakhs
      formattedAmount: "₹2,00,000 (Fixed 90% 30-Day Mortality Rule)"
    };
  }

  const roundedAge = Math.min(Math.max(Math.round(age || 35), 16), 65);
  const ageFactor = WORKMEN_AGE_FACTORS[roundedAge] || 99.37;
  const baseAmount = 800000; // 8 Lakhs based on unskilled min wage Rs 7,722/mo
  const R = parseFloat(riskFactor) || 4.0;

  // Formula: (B * F * R) / 99.37
  const compensationAmount = Math.round((baseAmount * ageFactor * R) / 99.37);

  return {
    baseAmount,
    ageFactor,
    riskFactor: R,
    isFixed90PercentOverride: false,
    compensationAmount,
    formattedAmount: `₹${compensationAmount.toLocaleString('en-IN')}`
  };
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { patientId, age, riskFactor, expectedMortality90Percent, concomitantMedications } = body;

    const calcResult = calculateCompensation({ age, riskFactor, expectedMortality90Percent });

    await connectDB();
    let patient = null;
    if (patientId) {
      patient = await Patient.findOneAndUpdate(
        { patientId },
        {
          diseaseRiskFactor: riskFactor,
          expectedMortality30Days90Percent: !!expectedMortality90Percent,
          calculatedCompensation: calcResult.compensationAmount,
          concomitantMedications: concomitantMedications || ''
        },
        { new: true }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        calcResult,
        patient
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
