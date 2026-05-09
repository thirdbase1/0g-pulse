# MozoSubz Identity Verification Engine 🏢

**Enterprise-Grade KYC & Compliance Platform**

MozoSubz is a comprehensive identity verification and compliance platform for fintech, banking, and regulated businesses. It provides real-time KYC verification, biometric liveness detection, document OCR, and global compliance screening.

---

## 🚀 Core Capabilities

- **🔐 Real-time KYC Verification**: Multi-level verification (L0-L4) with customizable compliance requirements
- **👤 Biometric Matching**: Liveness detection, face matching, and anti-spoofing checks
- **📄 Document OCR**: Intelligent document scanning with tampering detection
- **🚫 Sanctions Screening**: PEP lists, global sanctions databases, and AML flag detection
- **📊 Risk Scoring**: Automatic risk assessment (low/medium/high/critical)
- **📋 Compliance Reports**: Audit trails and regulatory reporting
- **🔗 Webhook Events**: Real-time event streaming for compliance monitoring
- **🌍 Enterprise Security**: HMAC-signed webhooks, API key management, encrypted data

---

## 📦 Installation

```bash
npm install mozosubz
```

---

## 🛠️ Quick Start

### Initiate a Verification Flow

```typescript
import { MozoSubz } from 'mozosubz';

const identity = new MozoSubz({
  apiKey: process.env.MOZOSUBZ_API_KEY,
  environment: 'production',
  complianceLevel: 'enhanced',
  enableBiometrics: true
});

// Start KYC for a user at Level 2
const verification = await identity.initiateVerification('user_123', 'L2');
console.log(`Verification ID: ${verification.verificationId}`);
```

### Submit Documents for Verification

```typescript
const docResult = await identity.submitDocument(
  verification.verificationId,
  'passport',
  imageBase64String
);

console.log(`Document Confidence: ${docResult.ocrConfidence}%`);
console.log(`Tampered: ${docResult.tamperedDetected}`);
```

### Perform Biometric Checks

```typescript
const bioResult = await identity.performBiometricCheck(
  verification.verificationId,
  videoBase64String,
  referencePhotoBase64String
);

if (bioResult.livenessCheck === 'passed' && bioResult.similarityScore > 95) {
  console.log('✅ Liveness and face match confirmed');
}
```

### Run Compliance Checks

```typescript
const compliance = await identity.runComplianceCheck(
  'user_123',
  'John Doe',
  'NG' // ISO country code
);

if (compliance.sanctions.pep || compliance.sanctions.sanctions_list) {
  console.log('⚠️ User flagged for PEP/Sanctions screening');
}
```

### Finalize and Issue Compliance Certificate

```typescript
const final = await identity.finalizeVerification(
  verification.verificationId,
  'approved'
);

console.log(`Verification Status: ${final.status}`);
console.log(`Risk Level: ${final.riskLevel}`);
```

---

## 📊 Verification Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| **L0** | Email verification only | Low-risk operations |
| **L1** | Phone + Email | Basic account access |
| **L2** | ID document scan | Standard fintech |
| **L3** | L2 + Biometric liveness | High-risk transactions |
| **L4** | L3 + Compliance screening | Regulated industries |

---

## 🔐 Security Best Practices

1. **Store API keys in environment variables** - Never expose in code
2. **Use webhook verification** for event authenticity
3. **Enable HTTPS only** for all API communication
4. **Implement rate limiting** on your endpoints
5. **Audit compliance reports regularly** for regulatory compliance
6. **Redact sensitive data** in logs (PII, documents, biometrics)

---

## 📋 Webhook Events

MozoSubz sends real-time events for compliance monitoring:

```json
{
  "event": "verification.completed",
  "verificationId": "ver_abc123",
  "status": "verified",
  "riskLevel": "low",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Verify webhook signatures:

```typescript
const isValid = identity.verifyWebhookSignature(payload, signature);
```

---

## 🌍 Supported Documents

- 🛂 Passport
- 🆔 National ID
- 🚗 Driver's License
- ✈️ Visa
- 📄 Utility Bill (Address Proof)
- 🏦 Bank Statement

---

## 📈 Risk Scoring

Automatic risk assessment based on:

- Document validity and tampering detection
- Biometric liveness and anti-spoofing scores
- Compliance screening results (PEP, sanctions)
- Geographic risk factors
- Behavioral patterns

**Risk Levels:**
- 🟢 **Low**: 0-25%
- 🟡 **Medium**: 26-50%
- 🔴 **High**: 51-75%
- ⚫ **Critical**: 76-100%

---

## 📞 Support

- 📧 Email: support@mozosubz.io
- 🐛 Issues: [GitHub Issues](https://github.com/thirdbase1/0g-pulse)
- 📚 Docs: https://docs.mozosubz.io

---

## 📜 License

MIT © Jules - Enterprise Identity Verification
