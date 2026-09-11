// Location: constants/payGuardTheme.ts
// Pure Black & White Minimalist Design System (Monochrome Luxury)
// Single source of truth — screens must never hardcode hex values.

import { Platform } from 'react-native';

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
    dangerCard: '#100505',   // solid fraud-alert surface
    dangerInset: '#180808',  // solid fraud-alert inset panel
    cardHover: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.12)',
    borderActive: 'rgba(255, 255, 255, 0.4)',
    borderEmerald: 'rgba(255, 255, 255, 0.3)',
  },

  // Grayscale workhorse scale — every neutral used across the screens.
  gray: {
    white: '#FFFFFF',
    200: '#DDDDDD',
    300: '#CCCCCC',
    400: '#AAAAAA',
    500: '#888888',
    600: '#666666',
    700: '#555555',
    750: '#444444',
    800: '#333333',
    850: '#222222',
    900: '#1A1A1A',
    925: '#161616',
    950: '#141414',
    975: '#111111',
    card: '#0C0C0C',
    deep: '#080808',
    black: '#000000',
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

// Brand colors at opacity — replaces inline `rgba(...)` literals in styles.
export const PayGuardAlpha = {
  white: (o: number): string => `rgba(255, 255, 255, ${o})`,
  black: (o: number): string => `rgba(0, 0, 0, ${o})`,
  danger: (o: number): string => `rgba(255, 42, 42, ${o})`,
  safe: (o: number): string => `rgba(0, 255, 102, ${o})`,
  warn: (o: number): string => `rgba(255, 184, 0, ${o})`,
} as const;

// Monospaced numerals (balances, card numbers, scores) — one definition.
export const PayGuardMonoFont = Platform.OS === 'ios' ? 'Courier' : 'monospace';

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
