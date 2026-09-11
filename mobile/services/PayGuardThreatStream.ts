// Location: services/PayGuardThreatStream.ts
// Real-time WebSocket connection to the PayGuard backend.
// Uses socket.io-client — works with FastAPI's WebSocket server.
//
// WHY WEBSOCKET and not just polling the REST API?
// Polling = app asks "any new threats?" every 5 seconds → wasteful
// WebSocket = backend PUSHES alerts the INSTANT they happen → real-time
// This is critical for a security app — a threat alert delayed by 5 seconds
// could mean money lost.

import { io, Socket } from 'socket.io-client';
import type { PayGuardThreatAlert, RiskAssessmentResult } from '@/types/payGuardModels';

// ─────────────────────────────────────────────
// ⚙️ CONFIG
// ─────────────────────────────────────────────

const WS_URL =
  process.env.EXPO_PUBLIC_WS_URL ?? 'http://localhost:8000';

// ─────────────────────────────────────────────
// 🔌 SOCKET INSTANCE
// ─────────────────────────────────────────────

// WHY A MODULE-LEVEL VARIABLE?
// We only ever need ONE socket connection to the backend.
// If we created a new socket inside a component, it would
// reconnect every re-render — that's hundreds of connections!

let socket: Socket | null = null;

// ─────────────────────────────────────────────
// 🟢 CONNECT
// ─────────────────────────────────────────────

/**
 * Connect to the PayGuard Shield Engine WebSocket server.
 * Call this once when the user logs in (in the root layout).
 * 
 * @param token - JWT token so the backend knows WHO is connecting
 */
export const connectToShieldEngine = (token: string): void => {
  // Don't create a duplicate connection
  if (socket?.connected) {
    console.log('[ThreatStream] Already connected');
    return;
  }

  socket = io(WS_URL, {
    // WHY auth object? The backend validates the JWT on connection.
    // If the token is invalid, the server disconnects immediately.
    auth: { token },

    // Reconnect automatically if connection drops
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,  // wait 2s before retrying
    transports: ['websocket'], // skip long-polling, go straight to WS
  });

  // Connection event listeners (for debugging)
  socket.on('connect', () => {
    console.log('[ThreatStream] ✅ Connected to PayGuard Shield Engine');
  });

  socket.on('disconnect', (reason) => {
    console.log('[ThreatStream] ❌ Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[ThreatStream] Connection error:', error.message);
  });
};

// ─────────────────────────────────────────────
// 🔴 DISCONNECT
// ─────────────────────────────────────────────

/**
 * Disconnect from the WebSocket. Call this when user logs out.
 * 
 * WHY DISCONNECT ON LOGOUT?
 * If we don't disconnect, the socket stays open with the old user's
 * JWT token. When they log back in, they'd have two connections.
 */
export const disconnectFromShieldEngine = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[ThreatStream] Disconnected cleanly');
  }
};

// ─────────────────────────────────────────────
// 👂 EVENT LISTENERS
// ─────────────────────────────────────────────

/**
 * Listen for live risk score updates.
 * The backend emits this event when AI finishes analyzing a transfer.
 * 
 * Used by: the payment form screen to update the risk meter in real-time.
 * 
 * @param callback - called whenever a new risk assessment arrives
 */
export const listenForLiveRiskUpdates = (
  callback: (riskData: RiskAssessmentResult) => void
): void => {
  socket?.on('RISK_SCORE_UPDATED', callback);
};

/**
 * Listen for new threat alerts.
 * Backend pushes this when a new security threat is detected.
 * 
 * Used by: the threat center screen to add new alerts in real time.
 */
export const listenForNewThreatAlerts = (
  callback: (alert: PayGuardThreatAlert) => void
): void => {
  socket?.on('NEW_THREAT_ALERT', callback);
};

/**
 * Listen for transaction status changes.
 * e.g. a PENDING_ANALYSIS transfer becomes COMPLETED or BLOCKED_BY_SHIELD.
 * 
 * Used by: the ledger screen to update status badges live.
 */
export const listenForTransferStatusUpdates = (
  callback: (payload: { transferId: string; status: string }) => void
): void => {
  socket?.on('TRANSFER_STATUS_UPDATED', callback);
};

// ─────────────────────────────────────────────
// 🔇 REMOVE LISTENERS
// ─────────────────────────────────────────────

/**
 * Remove a specific event listener.
 * Call this in the useEffect cleanup to prevent memory leaks.
 * 
 * WHY IS THIS IMPORTANT?
 * React components can mount/unmount many times.
 * If we don't remove listeners, the old callback stays attached
 * even after the component is gone → memory leak + ghost updates.
 */
export const removeListener = (eventName: string): void => {
  socket?.off(eventName);
};

/**
 * Check if the socket is currently connected.
 */
export const isConnected = (): boolean => {
  return socket?.connected ?? false;
};
