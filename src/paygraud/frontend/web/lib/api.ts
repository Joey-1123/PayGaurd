import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/store/authStore";
import type { Alert, Payment, PipelineSnapshot, TraceEvent } from "@/lib/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";
export const WS_URL = API_URL.replace(/^http/, "ws") + "/api/v1/ws";

export const api = axios.create({ baseURL: API_URL + "/api/v1", timeout: 30000 });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(error);
  }
);

export async function login(email: string, password: string): Promise<void> {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  const { data } = await axios.post<{ access_token: string }>(`${API_URL}/api/v1/auth/login`, form);
  useAuthStore.getState().setToken(data.access_token);
}

export async function fetchPipeline(): Promise<PipelineSnapshot> {
  const { data } = await api.get<PipelineSnapshot>("/debug/pipeline");
  return data;
}

export async function fetchTrace(paymentId: string): Promise<TraceEvent[]> {
  const { data } = await api.get<{ found: boolean; trace: TraceEvent[] }>(
    `/debug/pipeline/run/${paymentId}`
  );
  return data.trace;
}

export async function fetchPayments(): Promise<Payment[]> {
  const { data } = await api.get<Payment[]>("/payments?limit=25");
  return data;
}

export async function createPayment(amount: number, description: string): Promise<Payment> {
  const { data } = await api.post<Payment>("/payments", {
    recipient_id: null,
    amount,
    currency: "INR",
    description,
  });
  return data;
}

export async function analyzePayment(paymentId: string): Promise<Payment> {
  const { data } = await api.post<Payment>(`/payments/${paymentId}/analyze`);
  return data;
}

export async function fetchAlerts(): Promise<Alert[]> {
  const { data } = await api.get<Alert[]>("/alerts?limit=10");
  return data;
}