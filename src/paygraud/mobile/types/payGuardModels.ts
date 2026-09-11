// Location: types/payGuardModels.ts
// Core domain models for the PayGuard application

// ─────────────────────────────────────────────
// 1. Identity & Auth
// ─────────────────────────────────────────────

export interface PayGuardIdentity {
  pgId: string;
  fullName: string;
  emailAddress: string;
  bioAuthEnabled: boolean;
  trustScore: number; // 0 to 100
  createdAt: string;
  token?: string;
}

export interface PayGuardAuthCredentials {
  emailAddress: string;
  password: string;
}

export interface PayGuardRegisterPayload {
  fullName: string;
  emailAddress: string;
  password: string;
}

export interface PayGuardAuthResponse {
  identity: PayGuardIdentity;
  accessToken: string;
  refreshToken: string;
}

// ─────────────────────────────────────────────
// 2. Payments / Transfers
// ─────────────────────────────────────────────

export type TransferStatus =
  | 'COMPLETED'
  | 'PENDING_ANALYSIS'
  | 'BLOCKED_BY_SHIELD'
  | 'FLAGGED';

export interface PayGuardSecureTransfer {
  transferId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  beneficiaryAccount?: string;
  amount: number;
  currencyCode: string;
  transferStatus: TransferStatus;
  riskAssessmentScore: number; // 0 to 100
  riskExplanation?: string;
  initiatedAt: string;
  completedAt?: string;
}

export interface SecurePaymentIntent {
  beneficiaryId: string;
  beneficiaryName: string;
  amount: number;
  currencyCode: string;
  note?: string;
}

export interface RiskAssessmentResult {
  transferId?: string;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  decision: RiskDecision;
  flags: string[];
  explanation: string;
  aiRecommendation?: string;
}

// ─────────────────────────────────────────────
// 3. Threat Alerts
// ─────────────────────────────────────────────

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ThreatCategory =
  | 'FRAUD_RING_DETECTED'
  | 'UNUSUAL_LOCATION'
  | 'VELOCITY_SPIKE'
  | 'NEW_RECIPIENT'
  | 'SOCIAL_ENGINEERING'
  | 'ACCOUNT_TAKEOVER';

export type RiskDecision = 'APPROVE' | 'CONFIRM' | 'VERIFY' | 'BLOCK';

export interface PayGuardThreatAlert {
  alertId: string;
  threatLevel: RiskLevel;
  threatCategory: ThreatCategory;
  description: string;
  requiresAction: boolean;
  issuedAt: string;
  relatedTransferId?: string;
  isDismissed?: boolean;
  isBlocked?: boolean;
}

// ─────────────────────────────────────────────
// 4. Dashboard / Telemetry
// ─────────────────────────────────────────────

export interface PayGuardTelemetry {
  totalTransactions: number;
  overallRiskScore: number;
  activeAlerts: number;
  threatsBlockedToday: number;
}

// ─────────────────────────────────────────────
// 5. Beneficiary (Recipient)
// ─────────────────────────────────────────────

export interface PayGuardBeneficiary {
  beneficiaryId: string;
  name: string;
  accountNumber: string;
  isTrusted: boolean;
  transactionCount: number;
  lastTransactionAt?: string;
  riskProfile?: RiskLevel;
}

// ─────────────────────────────────────────────
// 6. API Response Wrappers
// ─────────────────────────────────────────────

export interface PayGuardApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PayGuardPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}