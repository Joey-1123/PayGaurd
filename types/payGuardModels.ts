// Location: mobile/types/payGuardModels.ts

export interface PayGuardIdentity {
  pgId: string;
  fullName: string;
  emailAddress: string;
  bioAuthEnabled: boolean;
  trustScore: number; // 0 to 100
  createdAt: string;
}

export interface PayGuardSecureTransfer {
  transferId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  amount: number;
  currencyCode: string;
  transferStatus: 'COMPLETED' | 'PENDING_ANALYSIS' | 'BLOCKED_BY_SHIELD' | 'FLAGGED';
  riskAssessmentScore: number;
  initiatedAt: string;
}

export interface PayGuardThreatAlert {
  alertId: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  threatCategory: 'FRAUD_RING_DETECTED' | 'UNUSUAL_LOCATION' | 'VELOCITY_SPIKE';
  description: string;
  requiresAction: boolean;
  issuedAt: string;
}