// Location: constants/apiConfig.ts
// 🚨 PASTE YOUR NGROK BACKEND URL HERE 🚨

/**
 * Replace this URL with your live ngrok tunnel URL whenever you restart ngrok!
 * Example: 'https://7a3b-103-211-54-12.ngrok-free.app'
 * (Do not include a trailing slash)
 */
export const NGROK_BACKEND_URL = 'http://localhost:8000';

// The full API path used by PayGuard Network Client
export const API_BASE_URL = `${NGROK_BACKEND_URL}/api/v1`;

// WebSocket URL for real-time security alerts
export const WS_BASE_URL = NGROK_BACKEND_URL.replace(/^http/, 'ws');
