// Location: utils/payGuardRiskEvaluator.ts
// Client-side risk heuristics — runs BEFORE the backend AI analysis.
// Think of this as a "pre-screening" layer. Fast, no network needed.

import { PayGuardColors } from '@/constants/payGuardTheme';
import type { RiskLevel, TransferStatus } from '@/types/payGuardModels';

// ─────────────────────────────────────────────
// 🧮 LOCAL RISK SCORE CALCULATOR
// ─────────────────────────────────────────────

/**
 * Calculates a quick local risk score before the backend runs AI analysis.
 * 
 * WHY THIS EXISTS:
 * The backend AI (GPT-4 + Claude) takes 1–3 seconds to respond.
 * While waiting, we show the user a PRELIMINARY risk score
 * calculated from simple rules on the device. This feels snappy.
 * 
 * Rules (each adds points to the score 0–100):
 *  - Amount > $10,000 → very high risk (+50)
 *  - Amount > $5,000  → high risk (+30)
 *  - Amount > $1,000  → medium risk (+15)
 *  - Beneficiary name contains scam keywords → +40
 *  - New/unknown beneficiary → +20
 * 
 * Example:
 *   calculateLocalRiskHeuristics({ amount: 15000, beneficiaryName: "Invoice Desk" }) → ~75
 */
export const calculateLocalRiskHeuristics = (transfer: {
  amount?: number;
  beneficiaryName?: string;
  beneficiaryId?: string;
}): number => {
  let score = 0;

  // 1. Amount-based risk
  const amount = transfer.amount ?? 0;
  if (amount > 10_000) score += 50;
  else if (amount > 5_000) score += 30;
  else if (amount > 1_000) score += 15;
  else if (amount > 500) score += 8;

  // 2. Keyword-based risk (common scam patterns)
  // WHY: Fraudsters often use words like "urgent", "customer care", "2FA" to pressure victims
  const scamKeywords = [
    'invoice', 'urgent', 'customer care', '2fa', 'verify',
    'desk', 'support', 'refund', 'prize', 'lottery', 'tax',
  ];
  const name = (transfer.beneficiaryName ?? '').toLowerCase();
  const hasScamKeyword = scamKeywords.some((kw) => name.includes(kw));
  if (hasScamKeyword) score += 40;

  // 3. Unknown beneficiary (no ID = never transacted before)
  if (!transfer.beneficiaryId) score += 20;

  // Cap at 100
  return Math.min(score, 100);
};

// ─────────────────────────────────────────────
// 🎨 RISK SCORE → COLOR
// ─────────────────────────────────────────────

/**
 * Returns the PayGuard brand color for a risk score.
 * Used by PayGuardRiskMeter and risk badges.
 * 
 * Example:
 *   getThreatColorForScore(85) → "#EF4444"  (red)
 *   getThreatColorForScore(55) → "#F59E0B"  (orange)
 *   getThreatColorForScore(20) → "#00D4AA"  (green)
 */
export const getThreatColorForScore = (score: number): string => {
  if (score >= 80) return PayGuardColors.risk.critical;
  if (score >= 50) return PayGuardColors.risk.warn;
  return PayGuardColors.risk.safe;
};

// ─────────────────────────────────────────────
// 🏷️ RISK LEVEL → COLOR
// ─────────────────────────────────────────────

/**
 * Returns color for a RiskLevel string (from backend response).
 * 
 * Example:
 *   getThreatColorForLevel('HIGH') → "#F97316"  (orange)
 *   getThreatColorForLevel('CRITICAL') → "#EF4444" (red)
 */
export const getThreatColorForLevel = (level: RiskLevel): string => {
  return PayGuardColors.threat[level];
};

// ─────────────────────────────────────────────
// 📊 TRANSFER STATUS → COLOR
// ─────────────────────────────────────────────

/**
 * Returns the correct color for a transaction status badge.
 * 
 * Example:
 *   getStatusColor('COMPLETED') → "#00D4AA"
 *   getStatusColor('BLOCKED_BY_SHIELD') → "#EF4444"
 */
export const getStatusColor = (status: TransferStatus): string => {
  return PayGuardColors.status[status];
};

// ─────────────────────────────────────────────
// 🤔 RISK DECISION HELPER
// ─────────────────────────────────────────────

/**
 * Maps a risk score to the PayGuard decision action.
 * This mirrors what the backend's decision matrix does.
 * 
 * Score 0–39   → APPROVE  (green light)
 * Score 40–59  → CONFIRM  (ask user to confirm)
 * Score 60–79  → VERIFY   (needs extra verification)
 * Score 80–100 → BLOCK    (stop the transaction)
 */
export const getRiskDecision = (
  score: number
): 'APPROVE' | 'CONFIRM' | 'VERIFY' | 'BLOCK' => {
  if (score >= 80) return 'BLOCK';
  if (score >= 60) return 'VERIFY';
  if (score >= 40) return 'CONFIRM';
  return 'APPROVE';
};
