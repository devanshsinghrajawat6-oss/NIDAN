import { NextResponse } from 'next/server';
import { computePortfolioKPIs } from '@/lib/kpi';

export async function GET() {
  try {
    const kpis = await computePortfolioKPIs();
    return NextResponse.json({ success: true, data: kpis });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
