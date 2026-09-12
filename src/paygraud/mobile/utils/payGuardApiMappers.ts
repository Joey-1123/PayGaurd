// Location: utils/payGuardApiMappers.ts
// Single source of truth for converting FastAPI DTOs into the app's display
// models. Keeps every screen dumb: screens consume PayGuard* models, never raw
// backend shapes.

import type {
  PayGuardApiAlert,
  PayGuardApiPayment,
  PayGuardApiRecipient,
  PayGuardApiSignal,
  PayGuardApiUser,
  PayGuardBeneficiary,
  PayGuardInboundSignal,
  PayGuardSecureTransfer,
  PayGuardThreatAlert,
  RiskDecision,
  RiskLevel,
  TransferStatus,
} from '@/types/payGuardModels';

// ─────────────────────────────────────────────
// Enums (backend sends lowercase strings)
// ─────────────────────────────────────────────

const LEVEL_MAP: Record<string, RiskLevel> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  critical: 'CRITICAL',
};

const DECISION_MAP: Record<string, RiskDecision> = {
  auto_approve: 'APPROVE',
  confirmation_required: 'CONFIRM',
  verification_required: 'VERIFY',
  block: 'BLOCK',
};

const LEVEL_TO_DECISION: Record<RiskLevel, RiskDecision> = {
  LOW: 'APPROVE',
  MEDIUM: 'CONFIRM',
  HIGH: 'VERIFY',
  CRITICAL: 'BLOCK',
};

const STATUS_MAP: Record<string, TransferStatus> = {
  pending: 'PENDING_ANALYSIS',
  analyzing: 'PENDING_ANALYSIS',
  awaiting_confirmation: 'AWAITING_CONFIRMATION',
  confirmed: 'CONFIRMED',
  completed: 'COMPLETED',
  blocked: 'BLOCKED_BY_SHIELD',
  canceled: 'CANCELED',
  failed: 'FAILED',
};

export const toRiskLevel = (level?: string | null): RiskLevel => {
  if (!level) return 'LOW';
  return LEVEL_MAP[level.toLowerCase()] ?? 'LOW';
};

export const toRiskDecision = (recommendation?: string | null, level?: string | null): RiskDecision => {
  if (recommendation && DECISION_MAP[recommendation]) return DECISION_MAP[recommendation];
  return LEVEL_TO_DECISION[toRiskLevel(level)];
};

export const toTransferStatus = (status: string): TransferStatus => {
  return STATUS_MAP[status.toLowerCase()] ?? 'PENDING_ANALYSIS';
};

// ─────────────────────────────────────────────
// Identity (auth)
// ─────────────────────────────────────────────

export interface PayGuardIdentityWithToken {
  pgId: string;
  fullName: string;
  emailAddress: string;
  bioAuthEnabled: boolean;
  trustScore: number;
  createdAt: string;
  token: string;
}

export const apiUserToIdentity = (user: PayGuardApiUser, token: string): PayGuardIdentityWithToken => {
  return {
    pgId: user.id,
    fullName: user.full_name,
    emailAddress: user.email,
    bioAuthEnabled: false,
    trustScore: 0,
    createdAt: new Date().toISOString(),
    token,
  };
};

// ─────────────────────────────────────────────
// Payments / transfers
// ─────────────────────────────────────────────

export const paymentToTransfer = (
  payment: PayGuardApiPayment,
  recipientsById?: Map<string, PayGuardApiRecipient>
): PayGuardSecureTransfer => {
  const recipient = payment.recipient_id ? recipientsById?.get(payment.recipient_id) : undefined;
  return {
    transferId: payment.id,
    beneficiaryId: payment.recipient_id ?? '',
    beneficiaryName: recipient?.name ?? 'Beneficiary',
    beneficiaryAccount: recipient?.account_number,
    amount: payment.amount,
    currencyCode: payment.currency,
    transferStatus: toTransferStatus(payment.status),
    riskAssessmentScore: payment.risk_score ?? 0,
    riskExplanation: payment.description ?? undefined,
    initiatedAt: payment.created_at,
    completedAt: payment.status === 'completed' ? payment.created_at : undefined,
  };
};

// ─────────────────────────────────────────────
// Alerts
// ─────────────────────────────────────────────

export const alertToThreatAlert = (alert: PayGuardApiAlert): PayGuardThreatAlert => {
  return {
    alertId: alert.id,
    threatLevel: toRiskLevel(alert.severity),
    threatCategory: alert.alert_type.toUpperCase(),
    description: alert.description ?? alert.title ?? 'Security alert',
    requiresAction: alert.status === 'active',
    issuedAt: alert.created_at,
    relatedTransferId: alert.payment_id ?? undefined,
    isDismissed: alert.status !== 'active',
    isBlocked: false,
  };
};

// ─────────────────────────────────────────────
// Recipients / beneficiaries
// ─────────────────────────────────────────────

export const recipientToBeneficiary = (recipient: PayGuardApiRecipient): PayGuardBeneficiary => {
  return {
    beneficiaryId: recipient.id,
    name: recipient.name,
    accountNumber: recipient.account_number,
    isTrusted: recipient.is_verified,
    transactionCount: recipient.previous_transaction_count,
    riskProfile: toRiskLevel(recipient.risk_category),
  };
};

// ─────────────────────────────────────────────
// Inbound signals (SMS interception)
// ─────────────────────────────────────────────

export const signalToInboundSignal = (signal: PayGuardApiSignal): PayGuardInboundSignal => {
  return {
    signalId: signal.id,
    channel: signal.channel,
    sender: signal.sender,
    body: signal.body,
    linkDomain: signal.link_domain ?? undefined,
    flags: signal.flags ?? [],
    riskScore: signal.risk_score ?? 0,
    riskLevel: toRiskLevel(signal.risk_level),
    action: (signal.action as PayGuardInboundSignal['action']) ?? 'ignore',
    status: signal.status,
    createdAt: signal.created_at,
  };
};