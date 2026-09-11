// Location: constants/apiConfig.ts
// PayGuard backend endpoint configuration.
//
// Set EXPO_PUBLIC_NGROK_URL to your live ngrok tunnel (or LAN IP) when running
// on a physical device, e.g.:
//   $env:EXPO_PUBLIC_NGROK_URL="https://relative-reopen-subduing.ngrok-free.dev"
// Falls back to the local emulator-friendly default when unset.
// (Do not include a trailing slash.)
// NOTE: mobile uses ngrok for ALL traffic (REST + WS); the web dashboard talks
// to the backend directly so it never sees ngrok's browser interstitial.

const DEFAULT_BACKEND_URL = 'http://localhost:8001';

// Shared demo account for the hackathon demo buttons (login + register screens).
// Single source of truth so both screens never drift apart.
export const DEMO_CREDENTIALS = {
  emailAddress: 'demo@payguard.io',
  password: 'Payguard@123',
} as const;

export const NGROK_BACKEND_URL: string =
  process.env.EXPO_PUBLIC_NGROK_URL?.replace(/\/$/, '') || DEFAULT_BACKEND_URL;

// REST base for all PayGuard API calls.
export const API_BASE_URL = `${NGROK_BACKEND_URL}/api/v1`;

// WebSocket endpoint for the real-time shield stream (raw FastAPI WS,
// authenticated via `?token=<jwt>`).
export const WS_STREAM_URL = `${NGROK_BACKEND_URL.replace(/^http/, 'ws')}/api/v1/ws`;