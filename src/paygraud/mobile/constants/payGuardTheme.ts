// Location: constants/payGuardTheme.ts
// Pure Black & White Minimalist Design System (Monochrome Luxury)

export const PayGuardColors = {
  brand: {
    primary: '#FFFFFF',      // Crisp Pure White
    secondary: '#000000',    // Pure Pitch Black
    accent: '#FFFFFF',       // Clean White Accent
    cyan: '#E5E5E5',         // Soft White/Silver
  },

  surface: {
    base: '#000000',
    container: '#0A0A0A',
    elevated: '#121212',
    card: '#0E0E0E',
    cardGlass: 'rgba(255, 255, 255, 0.04)',
    cardHover: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.12)',
    borderActive: 'rgba(255, 255, 255, 0.4)',
    borderEmerald: 'rgba(255, 255, 255, 0.3)',
  },

  risk: {
    safe: '#00FF66',         // Minimalist Crisp Green for Safe
    warn: '#FFB800',         // Amber Warning
    critical: '#FF2A2A',     // High-contrast Red for Fraudster Block
    blocked: '#FF2A2A',      // Blocked
    pending: '#888888',      // Analyzing
  },

  threat: {
    CRITICAL: '#FF2A2A',
    HIGH: '#FF5500',
    MEDIUM: '#FFB800',
    LOW: '#FFFFFF',
  },

  background: {
    dark: '#000000',
    card: '#0A0A0A',
    cardElevated: '#121212',
    input: '#0E0E0E',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#8E8E93',
    muted: '#555555',
    link: '#FFFFFF',
    emerald: '#00FF66',
  },

  status: {
    COMPLETED: '#00FF66',
    PENDING_ANALYSIS: '#888888',
    BLOCKED_BY_SHIELD: '#FF2A2A',
    FLAGGED: '#FFB800',
  },
} as const;

export const PayGuardSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 40,
  xxxl: 56,
} as const;

export const PayGuardBorderRadius = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const PayGuardFontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 19,
  xxl: 24,
  title: 32,
  hero: 44,
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
