import { NextResponse } from 'next/server';
import { connectDB, Consent, Patient } from '@/lib/db';
import { storeOnBlockchain } from '@/lib/blockchain';
import { createSignature } from '@/lib/esignature';
import { hash } from '@/lib/encryption';
import { writeAuditLog } from '@/lib/audit';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const trialId = searchParams.get('trialId');
    const query = {};
    if (patientId) query.patientId = patientId;
    if (trialId) query.trialId = trialId;
    const consents = await Consent.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: consents });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (body.witnessName && /\d/.test(body.witnessName)) {
      return NextResponse.json({ success: false, error: "Witness name cannot contain numbers." }, { status: 400 });
    }
    if (body.investigatorName && /\d/.test(body.investigatorName)) {
      return NextResponse.json({ success: false, error: "Investigator name cannot contain numbers." }, { status: 400 });
    }

    const consentId = body.consentId || `CON-${Date.now()}`;

    // Hash the consent data for integrity
    const consentHash = hash({ patientId: body.patientId, trialId: body.trialId, version: body.consentVersion, date: body.consentDate });

    // E-signature
    const sig = createSignature(
      body.investigatorId || 'SYSTEM',
      body.investigatorRole || 'Investigator',
      consentId, consentHash, 'CONSENT'
    );

    // Anchor to blockchain
    const txHash = await storeOnBlockchain(consentId, {
      patientId: body.patientId, trialId: body.trialId,
      version: body.consentVersion, type: body.consentType
    }, 'CONSENT', `v${body.consentVersion}`);

    const consent = await Consent.create({
      ...body,
      consentId,
      informedConsentFormHash: consentHash,
      eSignature: JSON.stringify(sig),
      blockchainTxHash: txHash
    });

    // Update patient consent status
    await Patient.findOneAndUpdate({ patientId: body.patientId }, {
      consentStatus: body.consentType === 'Withdrawal' ? 'Withdrawn' : 'Consented',
      consentVersion: body.consentVersion,
      consentBlockchainHash: txHash
    });

    // Supersede previous active consents
    if (body.consentType !== 'Withdrawal') {
      await Consent.updateMany(
        { patientId: body.patientId, consentId: { $ne: consentId }, status: 'Active' },
        { status: 'Superseded' }
      );
    }

    await writeAuditLog({ action: 'CONSENT_RECORDED', resource: 'Consent', resourceId: consentId, newValue: { patientId: body.patientId, version: body.consentVersion, type: body.consentType } });

    return NextResponse.json({ success: true, data: consent }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
