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
  refreshToken?: string;
}

// ─────────────────────────────────────────────
// 2. Payments / Transfers
// ─────────────────────────────────────────────

export type TransferStatus =
  | 'COMPLETED'
  | 'PENDING_ANALYSIS'
  | 'AWAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'BLOCKED_BY_SHIELD'
  | 'CANCELED'
  | 'FAILED'
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
export type ThreatCategory = string;

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

// ─────────────────────────────────────────────
// 7. Real backend DTOs (FastAPI response shapes)
// ─────────────────────────────────────────────

export interface PayGuardApiUser {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  account_type: string;
}

export interface PayGuardApiToken {
  access_token: string;
  token_type: string;
}

export interface PayGuardApiPayment {
  id: string;
  recipient_id: string | null;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  risk_score: number | null;
  risk_level: string | null;
  confidence: number | null;
  recommendation: string | null;
  human_confirmed: boolean;
  gateway_reference: string | null;
  created_at: string;
}

export interface PayGuardApiAlert {
  id: string;
  payment_id: string | null;
  alert_type: string;
  severity: string;
  risk_score: number;
  title: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

export interface PayGuardApiRecipient {
  id: string;
  name: string;
  account_number: string;
  bank_name: string | null;
  is_verified: boolean;
  verification_level: string;
  risk_score: number;
  risk_category: string;
  previous_transaction_count: number;
}

export type PayGuardSignalAction = 'ignore' | 'alert' | 'reject';

export interface PayGuardApiSignal {
  id: string;
  channel: string;
  sender: string;
  body: string;
  extracted_link: string | null;
  link_domain: string | null;
  flags: string[] | null;
  risk_score: number | null;
  risk_level: string | null;
  action: string | null;
  status: string;
  created_at: string;
}

/**
 * Client-side mirror of an inbound SMS/notification that went through the
 * backend signal scorer. Used by the SMS capture screen and threat stream.
 */
export interface PayGuardInboundSignal {
  signalId: string;
  channel: string;
  sender: string;
  body: string;
  linkDomain?: string;
  flags: string[];
  riskScore: number;
  riskLevel: RiskLevel;
  action: PayGuardSignalAction;
  status: string;
  createdAt: string;
}