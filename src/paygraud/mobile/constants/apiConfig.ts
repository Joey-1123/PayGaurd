// Location: constants/apiConfig.ts
// PayGuard backend endpoint configuration.
//
// Set EXPO_PUBLIC_NGROK_URL to your live ngrok tunnel (or LAN IP) when running
// on a physical device, e.g.:
//   $env:EXPO_PUBLIC_NGROK_URL="https://7a3b-103-211-54-12.ngrok-free.app"
// Falls back to the local emulator-friendly default when unset.
// (Do not include a trailing slash.)

const DEFAULT_BACKEND_URL = 'http://localhost:8000';

export const NGROK_BACKEND_URL: string =
  process.env.EXPO_PUBLIC_NGROK_URL?.replace(/\/$/, '') || DEFAULT_BACKEND_URL;

// REST base for all PayGuard API calls.
export const API_BASE_URL = `${NGROK_BACKEND_URL}/api/v1`;

// WebSocket endpoint for the real-time shield stream (raw FastAPI WS,
// authenticated via `?token=<jwt>`).
export const WS_STREAM_URL = `${NGROK_BACKEND_URL.replace(/^http/, 'ws')}/api/v1/ws`;