// Location: constants/payGuardTheme.ts
// PayGuard brand color system and design tokens

export const PayGuardColors = {
  // Brand primaries
  brand: {
    primary: '#208AEF',      // PayGuard Blue
    secondary: '#0A0F1E',    // Deep Navy (dark background)
    accent: '#00D4AA',       // Teal green (safe/verified)
  },

  // Risk-level palette
  risk: {
    safe: '#00D4AA',         // PAYGUARD_GREEN_SAFE  (score 0–50)
    warn: '#F59E0B',         // PAYGUARD_ORANGE_WARN (score 51–80)
    critical: '#EF4444',     // PAYGUARD_RED_CRITICAL (score 81–100)
    blocked: '#7C3AED',      // Purple — BLOCKED_BY_SHIELD
    pending: '#6B7280',      // Gray — PENDING_ANALYSIS
  },

  // Threat-level badges
  threat: {
    CRITICAL: '#EF4444',
    HIGH: '#F97316',
    MEDIUM: '#F59E0B',
    LOW: '#22C55E',
  },

  // Backgrounds
  background: {
    dark: '#0A0F1E',
    card: '#111827',
    cardElevated: '#1F2937',
    input: '#1A2035',
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#94A3B8',
    muted: '#64748B',
    link: '#208AEF',
  },

  // Status
  status: {
    COMPLETED: '#00D4AA',
    PENDING_ANALYSIS: '#F59E0B',
    BLOCKED_BY_SHIELD: '#EF4444',
    FLAGGED: '#F97316',
  },
} as const;

export const PayGuardSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const PayGuardBorderRadius = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  full: 9999,
} as const;

export const PayGuardFontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  title: 30,
  hero: 38,
} as const;

export const PayGuardFontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TransferStatus = 'COMPLETED' | 'PENDING_ANALYSIS' | 'BLOCKED_BY_SHIELD' | 'FLAGGED';
