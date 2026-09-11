// Location: utils/payGuardFormatters.ts
// Pure helper functions — no side effects, no imports needed
// Used everywhere: screens, components, hooks

// ─────────────────────────────────────────────
// 💰 CURRENCY FORMATTING
// ─────────────────────────────────────────────

/**
 * Formats a raw number into a currency string.
 * 
 * WHY: The API returns amount as a plain number (e.g. 5000).
 * The UI needs to show "$5,000.00" or "₹5,000.00"
 * 
 * Example:
 *   formatPayGuardCurrency(5000, 'USD') → "$5,000.00"
 *   formatPayGuardCurrency(1500.5, 'INR') → "₹1,500.50"
 */
export const formatPayGuardCurrency = (
  amount: number,
  currencyCode: string = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amount);
};

// ─────────────────────────────────────────────
// 🔒 ACCOUNT MASKING
// ─────────────────────────────────────────────

/**
 * Masks a beneficiary account number for security.
 * Shows only the last 4 digits.
 * 
 * WHY: We never display full account numbers in the UI — privacy + security.
 * 
 * Example:
 *   maskBeneficiaryAccount("1234567890") → "••••••7890"
 *   maskBeneficiaryAccount("AB12") → "••AB"  (short — shows last 2)
 */
export const maskBeneficiaryAccount = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length <= 4) {
    return `••${accountNumber ?? ''}`;
  }
  const visible = accountNumber.slice(-4);
  const masked = '•'.repeat(accountNumber.length - 4);
  return `${masked}${visible}`;
};

// ─────────────────────────────────────────────
// 📅 DATE / TIME FORMATTING
// ─────────────────────────────────────────────

/**
 * Formats an ISO date string to a readable short date.
 * 
 * Example:
 *   formatPayGuardDate("2026-09-11T10:30:00Z") → "Sep 11, 2026"
 */
export const formatPayGuardDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats an ISO date string to show time.
 * 
 * Example:
 *   formatPayGuardTime("2026-09-11T10:30:00Z") → "10:30 AM"
 */
export const formatPayGuardTime = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Returns a human-friendly "time ago" string.
 * 
 * WHY: The threat feed shows "2 minutes ago" instead of raw timestamps.
 * 
 * Example:
 *   timeAgo("2026-09-11T10:28:00Z") → "2 minutes ago"
 *   timeAgo("2026-09-10T10:30:00Z") → "1 day ago"
 */
export const timeAgo = (isoString: string): string => {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(isoString).getTime()) / 1000
  );

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// ─────────────────────────────────────────────
// 🛡️ RISK SCORE FORMATTING
// ─────────────────────────────────────────────

/**
 * Converts a numeric risk score (0–100) to a label.
 * 
 * Example:
 *   riskScoreToLabel(85) → "CRITICAL"
 *   riskScoreToLabel(55) → "HIGH"
 *   riskScoreToLabel(30) → "LOW"
 */
export const riskScoreToLabel = (
  score: number
): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' => {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
};
