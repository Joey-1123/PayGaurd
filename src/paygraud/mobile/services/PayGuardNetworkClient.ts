// Location: services/PayGuardNetworkClient.ts
// The single HTTP client for ALL backend communication.
// Uses Axios — a popular HTTP library that's better than raw fetch().
//
// WHY ONE CENTRAL CLIENT?
// If the backend URL changes, or we need to add auth headers,
// we change it in ONE place instead of 20+ files.

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  PayGuardAuthCredentials,
  PayGuardRegisterPayload,
  PayGuardAuthResponse,
  PayGuardSecureTransfer,
  PayGuardThreatAlert,
  PayGuardTelemetry,
  PayGuardBeneficiary,
  PayGuardApiResponse,
  PayGuardPaginatedResponse,
  RiskAssessmentResult,
  SecurePaymentIntent,
} from '@/types/payGuardModels';

// ─────────────────────────────────────────────
// ⚙️ CONFIGURATION
// ─────────────────────────────────────────────

// WHY USE A CONSTANT HERE?
// During the hackathon, we swap this with the ngrok tunnel URL.
// e.g. "https://abc123.ngrok-free.app/api/v1"
// You only change this ONE line.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

// ─────────────────────────────────────────────
// 🏗️ AXIOS INSTANCE
// ─────────────────────────────────────────────

// WHY CREATE AN INSTANCE instead of using axios directly?
// An instance lets us set default config (baseURL, timeout, headers)
// once, and all requests automatically inherit them.

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000, // 10 seconds — if backend doesn't respond, fail fast
  headers: {
    'Content-Type': 'application/json',
    'X-PayGuard-Client': 'mobile-v1', // lets backend know requests come from mobile
  },
});

// ─────────────────────────────────────────────
// 🔑 REQUEST INTERCEPTOR (auto-attach JWT token)
// ─────────────────────────────────────────────

// WHAT IS AN INTERCEPTOR?
// A function that runs BEFORE every request.
// Here we grab the stored JWT token and attach it to the Authorization header.
// This way, every API call is automatically authenticated.

client.interceptors.request.use(async (config) => {
  try {
    // Zustand stores expose .getState() directly on the hook export
    const { usePayGuardSession } = await import('@/store/payGuardSessionStore');
    const token = usePayGuardSession.getState().activeIdentity?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // If store isn't ready yet (e.g. during login), skip
  }
  return config;
});

// ─────────────────────────────────────────────
// 🔐 AUTH ENDPOINTS
// ─────────────────────────────────────────────

export const PayGuardNetworkClient = {

  /**
   * Register a new PayGuard account.
   * POST /auth/register
   */
  register: async (
    payload: PayGuardRegisterPayload
  ): Promise<PayGuardAuthResponse> => {
    const { data } = await client.post<PayGuardAuthResponse>(
      '/auth/register',
      payload
    );
    return data;
  },

  /**
   * Login with email + password.
   * POST /auth/login
   * Returns JWT tokens + user identity.
   */
  login: async (
    credentials: PayGuardAuthCredentials
  ): Promise<PayGuardAuthResponse> => {
    const { data } = await client.post<PayGuardAuthResponse>(
      '/auth/login',
      credentials
    );
    return data;
  },

  // ─────────────────────────────────────────
  // 📊 DASHBOARD / TELEMETRY
  // ─────────────────────────────────────────

  /**
   * Fetch the user's security telemetry (stats for the dashboard).
   * GET /telemetry
   * Returns: totalTransactions, riskScore, activeAlerts, threatsBlocked
   */
  fetchTelemetry: async (): Promise<PayGuardTelemetry> => {
    const { data } = await client.get<PayGuardApiResponse<PayGuardTelemetry>>(
      '/telemetry'
    );
    return data.data;
  },

  // ─────────────────────────────────────────
  // 💸 PAYMENTS / TRANSFERS
  // ─────────────────────────────────────────

  /**
   * Fetch paginated list of transfers (for the ledger screen).
   * GET /transfers?page=1&pageSize=20
   */
  fetchTransfers: async (
    page = 1,
    pageSize = 20
  ): Promise<PayGuardPaginatedResponse<PayGuardSecureTransfer>> => {
    const { data } = await client.get<
      PayGuardApiResponse<PayGuardPaginatedResponse<PayGuardSecureTransfer>>
    >('/transfers', { params: { page, pageSize } });
    return data.data;
  },

  /**
   * Get a single transfer by ID (for the detail screen).
   * GET /transfers/:transferId
   */
  fetchTransferById: async (
    transferId: string
  ): Promise<PayGuardSecureTransfer> => {
    const { data } = await client.get<
      PayGuardApiResponse<PayGuardSecureTransfer>
    >(`/transfers/${transferId}`);
    return data.data;
  },

  /**
   * Initiate a new payment. The backend will:
   *  1. Run AI risk analysis
   *  2. Return a risk assessment + decision
   *  3. If APPROVE → run through PaymentSimulator
   *  4. If BLOCK → never reaches the gateway
   * 
   * POST /transfers/initiate
   */
  initiateSecureTransfer: async (
    intent: SecurePaymentIntent
  ): Promise<{ transfer: PayGuardSecureTransfer; risk: RiskAssessmentResult }> => {
    const { data } = await client.post<
      PayGuardApiResponse<{
        transfer: PayGuardSecureTransfer;
        risk: RiskAssessmentResult;
      }>
    >('/transfers/initiate', intent);
    return data.data;
  },

  /**
   * Confirm a MEDIUM-risk transfer (human-in-the-loop step).
   * POST /transfers/:transferId/confirm
   */
  confirmTransfer: async (
    transferId: string
  ): Promise<PayGuardSecureTransfer> => {
    const { data } = await client.post<
      PayGuardApiResponse<PayGuardSecureTransfer>
    >(`/transfers/${transferId}/confirm`);
    return data.data;
  },

  // ─────────────────────────────────────────
  // 🚨 THREAT ALERTS
  // ─────────────────────────────────────────

  /**
   * Fetch all active threat alerts.
   * GET /alerts
   */
  fetchThreatAlerts: async (): Promise<PayGuardThreatAlert[]> => {
    const { data } = await client.get<
      PayGuardApiResponse<PayGuardThreatAlert[]>
    >('/alerts');
    return data.data;
  },

  /**
   * Dismiss a threat alert.
   * POST /alerts/:alertId/dismiss
   */
  dismissAlert: async (alertId: string): Promise<void> => {
    await client.post(`/alerts/${alertId}/dismiss`);
  },

  /**
   * Block the source of a threat (add to blocklist).
   * POST /alerts/:alertId/block
   */
  blockThreatSource: async (alertId: string): Promise<void> => {
    await client.post(`/alerts/${alertId}/block`);
  },

  // ─────────────────────────────────────────
  // 👤 BENEFICIARIES (Recipients)
  // ─────────────────────────────────────────

  /**
   * Fetch the list of known beneficiaries (for the recipient picker).
   * GET /beneficiaries
   */
  fetchBeneficiaries: async (): Promise<PayGuardBeneficiary[]> => {
    const { data } = await client.get<
      PayGuardApiResponse<PayGuardBeneficiary[]>
    >('/beneficiaries');
    return data.data;
  },

  // ─────────────────────────────────────────
  // 🔍 RISK ENGINE (live pre-assessment)
  // ─────────────────────────────────────────

  /**
   * Get a quick risk assessment for a payment BEFORE submitting.
   * Used for the live risk meter while the user is filling in the form.
   * POST /risk/assess
   */
  assessRisk: async (
    intent: Partial<SecurePaymentIntent>
  ): Promise<RiskAssessmentResult> => {
    const { data } = await client.post<
      PayGuardApiResponse<RiskAssessmentResult>
    >('/risk/assess', intent);
    return data.data;
  },
};

// ─────────────────────────────────────────────
// 🛠️ ERROR HELPER
// ─────────────────────────────────────────────

/**
 * Extracts a user-friendly error message from an Axios error.
 * 
 * WHY: Axios errors are complex objects. We want a simple string
 * to show in the UI (e.g. "Invalid credentials" instead of a stack trace).
 * 
 * Usage: catch(e) { const msg = extractApiError(e); showToast(msg); }
 */
export const extractApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Backend returned a structured error
    return (
      error.response?.data?.message ??
      error.response?.data?.detail ??
      error.message ??
      'Something went wrong'
    );
  }
  return 'An unexpected error occurred';
};
