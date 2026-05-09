/**
 * MozoSubz Identity Verification Engine - Enterprise Grade
 * Features: Real-time KYC, Biometric Matching, Document OCR, Risk Scoring, Compliance Reports
 *
 * @author Jules
 * @version 5.0.0
 */

export type MozoSubzConfig = {
  apiKey: string;
  baseUrl?: string;
  environment?: 'production' | 'staging' | 'sandbox';
  timeout?: number;
  retries?: number;
  enableBiometrics?: boolean;
  complianceLevel?: 'basic' | 'standard' | 'enhanced';
  webhookUrl?: string;
  webhookSecret?: string;
};

export type VerificationLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';

export type DocumentType = 
  | 'passport' 
  | 'national_id' 
  | 'driver_license' 
  | 'visa' 
  | 'utility_bill' 
  | 'bank_statement';

export type VerificationStatus = 
  | 'pending' 
  | 'processing' 
  | 'verified' 
  | 'rejected' 
  | 'expired' 
  | 'flagged';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type VerificationResponse<T = any> = {
  verificationId: string;
  status: VerificationStatus;
  riskLevel: RiskLevel;
  confidence: number; // 0-100
  timestamp: string;
  expiresAt?: string;
  data?: T;
  flags?: string[];
  error?: string;
};

export type DocumentScanResult = {
  documentId: string;
  documentType: DocumentType;
  extractedData: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    expiryDate?: string;
    documentNumber: string;
    issueCountry: string;
  };
  ocrConfidence: number;
  tamperedDetected: boolean;
  expiryStatus: 'valid' | 'expiring_soon' | 'expired';
};

export type BiometricMatchResult = {
  matchId: string;
  similarityScore: number; // 0-100
  faceDetected: boolean;
  livenessCheck: 'passed' | 'failed' | 'inconclusive';
  antiSpoofScore: number;
};

export type ComplianceReport = {
  reportId: string;
  userId: string;
  verificationLevel: VerificationLevel;
  sanctions: {
    pep: boolean;
    sanctions_list: boolean;
    aml_flag: boolean;
  };
  complianceScore: number;
  generatedAt: string;
  validUntil: string;
};

export type UserProfile = {
  userId: string;
  verificationLevel: VerificationLevel;
  documents: DocumentScanResult[];
  biometrics: BiometricMatchResult[];
  complianceStatus: 'approved' | 'pending' | 'suspended' | 'rejected';
  lastVerificationAt: string;
  nextReviewDate: string;
};

export class MozoSubz {
  private readonly baseUrl: string;
  private readonly config: MozoSubzConfig;
  private verificationCache: Map<string, { data: VerificationResponse; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 5; // 5 minute cache

  constructor(config: MozoSubzConfig) {
    this.config = {
      environment: 'production',
      timeout: 30000,
      retries: 3,
      enableBiometrics: true,
      complianceLevel: 'standard',
      ...config,
    };

    this.baseUrl = this.config.baseUrl || 'https://identity.mozosubz.io/api/v5';

    if (!this.config.apiKey) {
      throw new Error('MozoSubz: API Key is required.');
    }
  }

  /**
   * Initiate a new KYC verification flow
   */
  async initiateVerification(userId: string, verificationLevel: VerificationLevel): Promise<VerificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/verifications/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          verificationLevel,
          environment: this.config.environment,
          enableBiometrics: this.config.enableBiometrics,
        }),
      });

      if (!response.ok) {
        throw new Error(`KYC initiation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to initiate verification: ${error.message}`);
    }
  }

  /**
   * Submit document for OCR and validation
   */
  async submitDocument(
    verificationId: string,
    documentType: DocumentType,
    imageBase64: string
  ): Promise<DocumentScanResult> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationId,
          documentType,
          image: imageBase64,
        }),
      });

      if (!response.ok) {
        throw new Error(`Document scan failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to scan document: ${error.message}`);
    }
  }

  /**
   * Perform biometric liveness check and face matching
   */
  async performBiometricCheck(
    verificationId: string,
    videoBase64: string,
    referencePhotoBase64: string
  ): Promise<BiometricMatchResult> {
    try {
      const response = await fetch(`${this.baseUrl}/biometrics/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationId,
          video: videoBase64,
          referencePhoto: referencePhotoBase64,
        }),
      });

      if (!response.ok) {
        throw new Error(`Biometric verification failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to perform biometric check: ${error.message}`);
    }
  }

  /**
   * Run compliance and sanctions checks
   */
  async runComplianceCheck(userId: string, fullName: string, nationality: string): Promise<ComplianceReport> {
    try {
      const response = await fetch(`${this.baseUrl}/compliance/check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          fullName,
          nationality,
          complianceLevel: this.config.complianceLevel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Compliance check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to run compliance check: ${error.message}`);
    }
  }

  /**
   * Get complete user verification profile
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  /**
   * Complete verification process and issue compliance certificate
   */
  async finalizeVerification(
    verificationId: string,
    approvalStatus: 'approved' | 'rejected'
  ): Promise<VerificationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/verifications/${verificationId}/finalize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvalStatus,
          finalizedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Finalization failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to finalize verification: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature from compliance events
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!this.config.webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.config.webhookSecret);
    hmac.update(JSON.stringify(payload));
    const computed = hmac.digest('hex');

    return computed === signature;
  }

  /**
   * Generate compliance audit report for regulatory purposes
   */
  async generateAuditReport(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/audit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          format: 'pdf',
        }),
      });

      if (!response.ok) {
        throw new Error(`Report generation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to generate audit report: ${error.message}`);
    }
  }
}
