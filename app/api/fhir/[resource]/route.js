import { NextResponse } from 'next/server';
import { connectDB, Trial, Patient, AdverseEvent, Consent } from '@/lib/db';
import { trialToFHIRResearchStudy, patientToFHIRResearchSubject, adverseEventToFHIR, consentToFHIRConsent } from '@/lib/fhir';

const RESOURCE_MAP = {
  ResearchStudy: { model: Trial, transformer: trialToFHIRResearchStudy },
  ResearchSubject: { model: Patient, transformer: patientToFHIRResearchSubject },
  AdverseEvent: { model: AdverseEvent, transformer: adverseEventToFHIR },
  Consent: { model: Consent, transformer: consentToFHIRConsent },
};

// GET /api/fhir/:resource — return all resources of a type
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { resource } = await params;

    if (!RESOURCE_MAP[resource]) {
      return NextResponse.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found', diagnostics: `Unknown resource type: ${resource}` }] }, { status: 404 });
    }

    const { model, transformer } = RESOURCE_MAP[resource];
    const records = await model.find({});
    const fhirResources = records.map(r => transformer(r.toObject ? r.toObject() : r));

    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: fhirResources.length,
      timestamp: new Date().toISOString(),
      entry: fhirResources.map(r => ({
        fullUrl: `https://aiia.gov.in/fhir/${resource}/${r.id}`,
        resource: r
      }))
    };

    return NextResponse.json(bundle, {
      headers: { 'Content-Type': 'application/fhir+json' }
    });
  } catch (error) {
    return NextResponse.json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', diagnostics: error.message }] }, { status: 500 });
  }
}
