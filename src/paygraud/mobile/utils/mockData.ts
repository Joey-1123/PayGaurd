// Location: utils/mockData.ts
// Mock data for hackathon demo — runs without a backend.
// The 4 demo scenarios from project_plan.md are seeded here.

import type {
  PayGuardSecureTransfer,
  PayGuardThreatAlert,
  PayGuardTelemetry,
  PayGuardBeneficiary,
  PayGuardIdentity,
} from '@/types/payGuardModels';

// ─── DEMO USER ───────────────────────────────
export const MOCK_IDENTITY: PayGuardIdentity = {
  pgId: 'pg-demo-001',
  fullName: 'Alex Johnson',
  emailAddress: 'alex@demo.payguard.app',
  bioAuthEnabled: true,
  trustScore: 87,
  createdAt: '2026-01-15T10:00:00Z',
  token: 'demo-jwt-token-xxx',
};

// ─── DEMO TELEMETRY (dashboard stats) ────────
export const MOCK_TELEMETRY: PayGuardTelemetry = {
  totalTransactions: 142,
  overallRiskScore: 23,
  activeAlerts: 2,
  threatsBlockedToday: 3,
};

// ─── 4 DEMO SCENARIOS (from project_plan.md) ─
export const MOCK_TRANSFERS: PayGuardSecureTransfer[] = [
  {
    // Scenario 1 — INSTANT APPROVE (trusted contact)
    transferId: 'txn-001',
    beneficiaryId: 'ben-001',
    beneficiaryName: 'John Carter',
    beneficiaryAccount: '****1234',
    amount: 50,
    currencyCode: 'USD',
    transferStatus: 'COMPLETED',
    riskAssessmentScore: 8,
    riskExplanation: '12 prior payments. Verified recipient. Low amount.',
    initiatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 min ago
    completedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
  {
    // Scenario 2 — CONFIRM (new recipient, $500)
    transferId: 'txn-002',
    beneficiaryId: 'ben-002',
    beneficiaryName: 'Blue Lotus Agency',
    beneficiaryAccount: '****5678',
    amount: 500,
    currencyCode: 'USD',
    transferStatus: 'PENDING_ANALYSIS',
    riskAssessmentScore: 54,
    riskExplanation: 'New recipient. No prior transactions. Moderate amount.',
    initiatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    // Scenario 3 — VERIFY (HIGH alert, $5000)
    transferId: 'txn-003',
    beneficiaryId: 'ben-003',
    beneficiaryName: 'Customer Care 2FA',
    beneficiaryAccount: '****9012',
    amount: 5000,
    currencyCode: 'USD',
    transferStatus: 'FLAGGED',
    riskAssessmentScore: 76,
    riskExplanation: 'Urgency keyword detected. Impersonation pattern. Large amount.',
    initiatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    // Scenario 4 — BLOCKED ($15,000 scam)
    transferId: 'txn-004',
    beneficiaryId: 'ben-004',
    beneficiaryName: 'Invoice Desk',
    beneficiaryAccount: '****3456',
    amount: 15000,
    currencyCode: 'USD',
    transferStatus: 'BLOCKED_BY_SHIELD',
    riskAssessmentScore: 94,
    riskExplanation: 'Fraud ring detected. Invoice scam pattern. Critical amount threshold crossed.',
    initiatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── MOCK THREAT ALERTS ───────────────────────
export const MOCK_ALERTS: PayGuardThreatAlert[] = [
  {
    alertId: 'alert-001',
    threatLevel: 'CRITICAL',
    threatCategory: 'FRAUD_RING_DETECTED',
    description: '"Invoice Desk" is linked to an active fraud ring operating in your region. Transfer of $15,000 was blocked.',
    requiresAction: true,
    issuedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    relatedTransferId: 'txn-004',
  },
  {
    alertId: 'alert-002',
    threatLevel: 'HIGH',
    threatCategory: 'SOCIAL_ENGINEERING',
    description: '"Customer Care 2FA" shows impersonation patterns. This account has been used in 3 known scam attempts.',
    requiresAction: true,
    issuedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    relatedTransferId: 'txn-003',
  },
  {
    alertId: 'alert-003',
    threatLevel: 'MEDIUM',
    threatCategory: 'NEW_RECIPIENT',
    description: '"Blue Lotus Agency" is a new, unverified recipient. Confirm before proceeding.',
    requiresAction: false,
    issuedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    relatedTransferId: 'txn-002',
  },
];

// ─── MOCK BENEFICIARIES ───────────────────────
export const MOCK_BENEFICIARIES: PayGuardBeneficiary[] = [
  {
    beneficiaryId: 'ben-001',
    name: 'John Carter',
    accountNumber: '1234567891234',
    isTrusted: true,
    transactionCount: 12,
    lastTransactionAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    riskProfile: 'LOW',
  },
  {
    beneficiaryId: 'ben-002',
    name: 'Blue Lotus Agency',
    accountNumber: '9876543215678',
    isTrusted: false,
    transactionCount: 0,
    riskProfile: 'MEDIUM',
  },
];
