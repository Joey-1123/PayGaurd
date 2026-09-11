// Location: services/PayGuardThreatStream.ts
// Real-time WebSocket connection to the PayGuard shield engine.
//
// The backend is a plain FastAPI WebSocket at /api/v1/ws (auth via ?token=),
// NOT Socket.IO. Frames are JSON `{ "type": "<event>", "data": {...} }`.
// Known backend events:
//   - "connected"   → handshake acked
//   - "alert_new"   → a new threat alert was raised (payment or inbound SMS)
//
// We keep React Native's native WebSocket (no socket.io dependency).

import type { PayGuardThreatAlert } from '@/types/payGuardModels';
import { WS_STREAM_URL } from '@/constants/apiConfig';

const RECONNECT_DELAY_MS = 2500;
const MAX_RECONNECT_ATTEMPTS = 6;

let socket: WebSocket | null = null;
let authToken: string | null = null;
let reconnectAttempts = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let shouldReconnect = false;

type StreamHandler = (payload: unknown) => void;
const listeners: Map<string, Set<StreamHandler>> = new Map();

// ─────────────────────────────────────────────
// 🔌 CONNECTION LIFECYCLE
// ─────────────────────────────────────────────

const tokenUrl = (token: string): string =>
  `${WS_STREAM_URL}?token=${encodeURIComponent(token)}`;

function emit(eventName: string, payload: unknown): void {
  listeners.get(eventName)?.forEach((handler) => {
    try {
      handler(payload);
    } catch {
      // a single bad handler must not kill the stream
    }
  });
}

function scheduleReconnect(): void {
  if (!shouldReconnect || socket?.readyState === WebSocket.OPEN) return;
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.warn('[ThreatStream] reconnect limit reached');
    return;
  }
  reconnectAttempts += 1;
  reconnectTimer = setTimeout(() => {
    if (authToken && shouldReconnect) connectToShieldEngine(authToken);
  }, RECONNECT_DELAY_MS);
}

/**
 * Connect to the shield engine. Call once after login.
 */
export const connectToShieldEngine = (token: string): void => {
  if (socket?.readyState === WebSocket.OPEN) {
    console.log('[ThreatStream] Already connected');
    return;
  }

  authToken = token;
  shouldReconnect = true;
  reconnectAttempts = 0;

  let ws: WebSocket;
  try {
    ws = new WebSocket(tokenUrl(token));
  } catch {
    scheduleReconnect();
    return;
  }
  socket = ws;

  ws.onopen = () => {
    reconnectAttempts = 0;
    console.log('[ThreatStream] Connected to PayGuard Shield Engine');
  };

  ws.onmessage = (event) => {
    let frame: { type?: string; data?: unknown };
    try {
      frame = JSON.parse(event.data);
    } catch {
      return;
    }
    if (!frame.type) return;
    emit(frame.type, frame.data ?? {});
  };

  ws.onerror = (error: unknown) => {
    console.error('[ThreatStream] Socket error:', error);
  };

  ws.onclose = () => {
    if (socket === ws) socket = null;
    console.log('[ThreatStream] Disconnected');
    scheduleReconnect();
  };
};

/**
 * Tear down the connection (logout).
 */
export const disconnectFromShieldEngine = (): void => {
  shouldReconnect = false;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.close();
    socket = null;
  }
  authToken = null;
  console.log('[ThreatStream] Disconnected cleanly');
};

// ─────────────────────────────────────────────
// 👂 EVENT LISTENERS
// ─────────────────────────────────────────────

function subscribe(eventName: string, handler: StreamHandler): () => void {
  if (!listeners.has(eventName)) listeners.set(eventName, new Set());
  listeners.get(eventName)!.add(handler);
  return () => listeners.get(eventName)?.delete(handler);
}

/**
 * Low-level subscription to a raw event type. Returns an unsubscribe fn.
 */
export const onStreamEvent = (eventName: string, handler: StreamHandler): (() => void) =>
  subscribe(eventName, handler);

/**
 * New threat alert — either a risk-flagged payment or a scored inbound SMS.
 * The payload carries `{ alert_id?, severity, signal_id?, action? }`; the hook
 * refreshes the full alert feed so details match what the API returns.
 */
export const listenForNewThreatAlerts = (callback: (alert: PayGuardThreatAlert) => void): void => {
  subscribe('alert_new', (payload) => {
    callback({ alertId: '', threatLevel: 'HIGH', threatCategory: 'INBOUND', description: 'New threat detected', requiresAction: true, issuedAt: new Date().toISOString(), ...(payload as Partial<PayGuardThreatAlert>) });
  });
};

/**
 * Live risk score updates. The backend does not emit these yet — kept for
 * forward-compat so the hook wiring is already in place.
 */
export const listenForLiveRiskUpdates = (callback: (riskscore: number) => void): void => {
  subscribe('risk_score_updated', (payload) => {
    callback(((payload as { score?: number })?.score ?? 0));
  });
};

/**
 * Payment status changes (e.g. PENDING_ANALYSIS → COMPLETED). Backend does not
 * emit these yet — pull-based refresh still covers the ledger.
 */
export const listenForTransferStatusUpdates = (
  callback: (payload: { transferId: string; status: string }) => void
): void => {
  subscribe('payment_status_changed', (payload) => {
    const p = payload as { transferId?: string; status?: string };
    if (p.transferId && p.status) callback({ transferId: p.transferId, status: p.status });
  });
};

/**
 * Remove all handlers for an event name.
 */
export const removeListener = (eventName: string): void => {
  listeners.delete(eventName);
};

export const isConnected = (): boolean => {
  return socket?.readyState === WebSocket.OPEN;
};