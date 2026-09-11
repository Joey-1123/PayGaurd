// Location: services/PayGuardNetworkClient.ts
// The single HTTP client for ALL backend communication.
// Mirrors the real FastAPI surface under /api/v1 (auth, payments, alerts,
// recipients, signals). Response DTOs are mapped into PayGuard* display
// models via utils/payGuardApiMappers.ts.

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  PayGuardAuthCredentials,
  PayGuardAuthResponse,
  PayGuardRegisterPayload,
  PayGuardThreatAlert,
  PayGuardTelemetry,
  PayGuardBeneficiary,
  PayGuardSecureTransfer,
  PayGuardInboundSignal,
  PayGuardApiAlert,
  PayGuardApiPayment,
  PayGuardApiRecipient,
  PayGuardApiSignal,
  PayGuardApiUser,
  RiskAssessmentResult,
  SecurePaymentIntent,
} from '@/types/payGuardModels';
import { API_BASE_URL } from '@/constants/apiConfig';
import {
  alertToThreatAlert,
  apiUserToIdentity,
  paymentToTransfer,
  recipientToBeneficiary,
  signalToInboundSignal,
  toRiskDecision,
  toRiskLevel,
} from '@/utils/payGuardApiMappers';

const BASE_URL = API_BASE_URL;

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    'X-PayGuard-Client': 'mobile-v1',
  },
});

// ─────────────────────────────────────────────
// 🔑 REQUEST INTERCEPTOR (auto-attach JWT token)
// ─────────────────────────────────────────────

client.interceptors.request.use(async (config) => {
  try {
    const { usePayGuardSession } = await import('@/store/payGuardSessionStore');
    const token = usePayGuardSession.getState().activeIdentity?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Store not ready yet (e.g. during login)
  }
  return config;
});

// ─────────────────────────────────────────────
// 🏗️ INTERNAL HELPERS
// ─────────────────────────────────────────────

let recipientsCache: PayGuardApiRecipient[] = [];
let recipientsAt: number = 0;

const recipientsById = async (): Promise<Map<string, PayGuardApiRecipient>> => {
  if (Date.now() - recipientsAt > 15_000 || recipientsCache.length === 0) {
    try {
      recipientsCache = (await client.get<PayGuardApiRecipient[]>('/recipients')).data;
      recipientsAt = Date.now();
    } catch {
      // keep stale cache on failure
    }
  }
  return new Map(recipientsCache.map((r) => [r.id, r]));
};

const mapPayments = (payments: PayGuardApiPayment[], byId?: Map<string, PayGuardApiRecipient>) => {
  return payments.map((p) => paymentToTransfer(p, byId));
};

// ─────────────────────────────────────────────
// 🔐 AUTH ENDPOINTS
// ─────────────────────────────────────────────

export const PayGuardNetworkClient = {
  /**
   * Create a new account. Backend issues no token on register, so we log the
   * user straight in afterwards and return a full auth session.
   * POST /auth/register
   */
  register: async (payload: PayGuardRegisterPayload): Promise<PayGuardAuthResponse> => {
    await client.post('/auth/register', {
      email: payload.emailAddress,
      full_name: payload.fullName,
      password: payload.password,
    });
    return PayGuardNetworkClient.login({
      emailAddress: payload.emailAddress,
      password: payload.password,
    });
  },

  /**
   * Authenticate and load the identity profile. Backend login is a standard
   * OAuth2 form grant (username/password), then we fetch GET /auth/me.
   * POST /auth/login → GET /auth/me
   */
  login: async (credentials: PayGuardAuthCredentials): Promise<PayGuardAuthResponse> => {
    const form = new URLSearchParams();
    form.append('username', credentials.emailAddress);
    form.append('password', credentials.password);
    const tokenRes = await client.post<{ access_token: string; token_type: string }>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const accessToken = tokenRes.data.access_token;
    const { data: me } = await client.get<PayGuardApiUser>('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return { identity: apiUserToIdentity(me, accessToken), accessToken };
  },

  // ─────────────────────────────────────────
  // 📊 DASHBOARD / TELEMETRY
  // ─────────────────────────────────────────

  /**
   * Build the dashboard telemetry from real endpoints: alert stats + the
   * payment ledger. GET /alerts/stats + GET /payments
   */
  fetchTelemetry: async (): Promise<PayGuardTelemetry> => {
    const [stats, payments] = await Promise.all([
      client.get<{ total: number; by_severity: Record<string, number>; by_status: Record<string, number> }>('/alerts/stats'),
      client.get<PayGuardApiPayment[]>('/payments', { params: { limit: 100 } }),
    ]);
    const activeAlerts = stats.data.by_status?.active ?? 0;
    const blocked = payments.data.filter((p) => ['blocked', 'canceled', 'failed'].includes(p.status));
    const scores = payments.data.map((p) => p.risk_score ?? 0).filter((s) => s > 0);
    return {
      totalTransactions: payments.data.length,
      overallRiskScore: scores.length ? Math.max(...scores) : 0,
      activeAlerts,
      threatsBlockedToday: blocked.length,
    };
  },

  // ─────────────────────────────────────────
  // 💸 PAYMENTS / TRANSFERS
  // ─────────────────────────────────────────

  /**
   * Fetch the payment ledger. GET /payments?limit=
   */
  fetchTransfers: async (page = 1, pageSize = 20): Promise<PayGuardSecureTransfer[]> => {
    const [{ data: payments }, byId] = await Promise.all([
      client.get<PayGuardApiPayment[]>('/payments', { params: { limit: pageSize, offset: (page - 1) * pageSize } }),
      recipientsById(),
    ]);
    return mapPayments(payments, byId);
  },

  /**
   * Get a single transfer by ID. GET /payments/:paymentId
   */
  fetchTransferById: async (transferId: string): Promise<PayGuardSecureTransfer> => {
    const [{ data: payment }, byId] = await Promise.all([
      client.get<PayGuardApiPayment>(`/payments/${transferId}`),
      recipientsById(),
    ]);
    return paymentToTransfer(payment, byId);
  },

  /**
   * Create a payment and run the full AI risk analysis. The backend routes it:
   * LOW → completed, MEDIUM/HIGH → awaiting_confirmation, CRITICAL → blocked.
   * POST /payments → POST /payments/:id/analyze
   */
  initiateSecureTransfer: async (
    intent: SecurePaymentIntent
  ): Promise<{ transfer: PayGuardSecureTransfer; risk: RiskAssessmentResult }> => {
    const { data: created } = await client.post<PayGuardApiPayment>('/payments', {
      recipient_id: intent.beneficiaryId || null,
      amount: intent.amount,
      currency: intent.currencyCode,
      description: intent.note ?? '',
    });
    const { data: analyzed } = await client.post<PayGuardApiPayment>(`/payments/${created.id}/analyze`);
    return {
      transfer: paymentToTransfer(analyzed),
      risk: {
        transferId: analyzed.id,
        riskScore: analyzed.risk_score ?? 0,
        riskLevel: toRiskLevel(analyzed.risk_level),
        decision: toRiskDecision(analyzed.recommendation, analyzed.risk_level),
        flags: [],
        explanation: analyzed.description ?? 'Risk analysis completed.',
        aiRecommendation: analyzed.recommendation ?? undefined,
      },
    };
  },

  /**
   * Confirm a held (MEDIUM/HIGH) transfer. POST /payments/:id/confirm
   */
  confirmTransfer: async (transferId: string): Promise<PayGuardSecureTransfer> => {
    const { data } = await client.post<PayGuardApiPayment>(`/payments/${transferId}/confirm`);
    return paymentToTransfer(data);
  },

  /**
   * Block a transfer (manual shield override). POST /payments/:id/block
   */
  blockTransfer: async (transferId: string): Promise<PayGuardSecureTransfer> => {
    const { data } = await client.post<PayGuardApiPayment>(`/payments/${transferId}/block`);
    return paymentToTransfer(data);
  },

  /**
   * Multi-model risk breakdown for a transfer. GET /payments/:id/risk
   * Returns null when the report is unavailable (backend offline / not found).
   */
  fetchRiskReport: async (
    transferId: string
  ): Promise<{ riskScore: number; riskLevel: string; models: Array<{ model: string; risk_score: number; verdict: string; flags: string[] }> } | null> => {
    try {
      const { data } = await client.get(`payments/${transferId}/risk`);
      return {
        riskScore: data.risk_score ?? 0,
        riskLevel: data.risk_level ?? 'unknown',
        models: Array.isArray(data.models) ? data.models : [],
      };
    } catch {
      return null;
    }
  },

  // ─────────────────────────────────────────
  // 🚨 THREAT ALERTS
  // ─────────────────────────────────────────

  /**
   * Fetch all threat alerts. GET /alerts
   */
  fetchThreatAlerts: async (): Promise<PayGuardThreatAlert[]> => {
    const { data } = await client.get<PayGuardApiAlert[]>('/alerts');
    return data.map(alertToThreatAlert);
  },

  /**
   * Fetch a single alert by ID. GET /alerts/:alertId
   */
  fetchAlertById: async (alertId: string): Promise<PayGuardThreatAlert> => {
    const { data } = await client.get<PayGuardApiAlert>(`/alerts/${alertId}`);
    return alertToThreatAlert(data);
  },

  /**
   * Dismiss a threat alert. PUT /alerts/:alertId/dismiss
   */
  dismissAlert: async (alertId: string): Promise<void> => {
    await client.put(`/alerts/${alertId}/dismiss`);
  },

  /**
   * Block the source payment of a threat. POST /alerts/:alertId/block
   */
  blockThreatSource: async (alertId: string): Promise<void> => {
    await client.post(`/alerts/${alertId}/block`);
  },

  // ─────────────────────────────────────────
  // 👤 BENEFICIARIES (Recipients)
  // ─────────────────────────────────────────

  /**
   * Fetch known recipients. GET /recipients
   */
  fetchBeneficiaries: async (): Promise<PayGuardBeneficiary[]> => {
    const { data } = await client.get<PayGuardApiRecipient[]>('/recipients');
    return data.map(recipientToBeneficiary);
  },

  // ─────────────────────────────────────────
  // 📥 INBOUND SIGNALS (SMS interception)
  // ─────────────────────────────────────────

  /**
   * Submit an intercepted SMS/notification to the shield scorer.
   * The backend classifies it and routes: ignore / alert / reject.
   * POST /signals/sms
   */
  captureSignal: async (payload: { sender: string; body: string; channel?: string }): Promise<PayGuardInboundSignal> => {
    const { data } = await client.post<PayGuardApiSignal>('/signals/sms', {
      sender: payload.sender,
      body: payload.body,
      channel: payload.channel ?? 'sms',
    });
    return signalToInboundSignal(data);
  },

  /**
   * Fetch the history of scored inbound signals. GET /signals
   */
  fetchSignals: async (): Promise<PayGuardInboundSignal[]> => {
    const { data } = await client.get<PayGuardApiSignal[]>('/signals');
    return data.map(signalToInboundSignal);
  },

  // ─────────────────────────────────────────
  // 🔍 RISK ENGINE (local pre-assessment)
  // ─────────────────────────────────────────

  /**
   * Quick client-side pre-assessment used by the QR scanner. The backend has
   * no "just checking, don't create a payment" endpoint, so we fall back to the
   * local heuristic evaluator; callers never crash on it.
   */
  assessRisk: async (intent: Partial<SecurePaymentIntent>): Promise<RiskAssessmentResult | null> => {
    const { calculateLocalRiskHeuristics } = await import('@/utils/payGuardRiskEvaluator');
    const score = calculateLocalRiskHeuristics({
      amount: intent.amount ?? 0,
      beneficiaryName: intent.beneficiaryName,
      beneficiaryId: intent.beneficiaryId,
    });
    return {
      riskScore: Math.round(score),
      riskLevel: score >= 85 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW',
      decision: toRiskDecision(undefined, score >= 85 ? 'critical' : score >= 30 ? 'medium' : 'low'),
      flags: [],
      explanation: 'Local pre-scan heuristic (QR scan).',
    };
  },
};

// ─────────────────────────────────────────────
// 🛠️ ERROR HELPER
// ─────────────────────────────────────────────

export const extractApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ??
      error.response?.data?.detail ??
      error.message ??
      'Something went wrong'
    );
  }
  return 'An unexpected error occurred';
};