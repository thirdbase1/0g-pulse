import { NextRequest, NextResponse } from 'next/server';
import { MozoSubz } from '@/packages/mozosubz/src/index';

// Initialize the Identity Verification Engine
const identity = new MozoSubz({
  apiKey: process.env.MOZOSUBZ_API_KEY || 'SANDBOX_MODE',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  complianceLevel: 'enhanced',
  enableBiometrics: true,
  webhookSecret: process.env.WEBHOOK_SECRET,
});

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      service: 'MozoSubz Identity Verification Engine v5.0.0',
      capabilities: [
        'Real-time KYC Verification',
        'Biometric Liveness Checks',
        'Document OCR & Validation',
        'Sanctions & PEP Screening',
        'Compliance Reporting',
        'Risk Scoring'
      ],
      status: 'operational'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, verificationLevel, documentType, imageBase64, videoBase64, referencePhoto, fullName, nationality } = body;

    switch (action) {
      case 'initiate':
        const verification = await identity.initiateVerification(userId, verificationLevel || 'L2');
        return NextResponse.json(verification);

      case 'submit_document':
        const docScan = await identity.submitDocument(userId, documentType, imageBase64);
        return NextResponse.json(docScan);

      case 'biometric_check':
        const bioResult = await identity.performBiometricCheck(userId, videoBase64, referencePhoto);
        return NextResponse.json(bioResult);

      case 'compliance_check':
        const compliance = await identity.runComplianceCheck(userId, fullName, nationality);
        return NextResponse.json(compliance);

      case 'get_profile':
        const profile = await identity.getUserProfile(userId);
        return NextResponse.json(profile);

      case 'finalize':
        const result = await identity.finalizeVerification(userId, body.approvalStatus);
        return NextResponse.json(result);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload, signature } = body;

    if (action === 'verify_webhook') {
      const isValid = identity.verifyWebhookSignature(payload, signature);
      return NextResponse.json({ verified: isValid });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
