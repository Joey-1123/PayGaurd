import { create } from "zustand";

import {
  analyzePayment,
  createPayment,
  fetchAlerts,
  fetchPayments,
  fetchPipeline,
  fetchRecipients,
  fetchTrace,
  type Recipient,
} from "@/lib/api";
import type { Alert, Payment, PipelineSnapshot, TraceEvent } from "@/lib/types";

interface RunState {
  scenarioId: string | null;
  status: "idle" | "creating" | "analyzing" | "done" | "error";
  paymentId: string | null;
  trace: TraceEvent[];
  message: string | null;
}

interface DashboardState {
  payments: Payment[];
  alerts: Alert[];
  pipeline: PipelineSnapshot | null;
  run: RunState;
  loading: boolean;
  refresh: () => Promise<void>;
  runScenario: (
    id: string,
    amount: number,
    description: string,
    recipientName?: string
  ) => Promise<void>;
  setPipeline: (pipeline: PipelineSnapshot) => void;
}

const initialRun: RunState = {
  scenarioId: null,
  status: "idle",
  paymentId: null,
  trace: [],
  message: null,
};

export const useDashboardStore = create<DashboardState>((set) => ({
  payments: [],
  alerts: [],
  pipeline: null,
  run: initialRun,
  loading: false,

  refresh: async () => {
    set({ loading: true });
    try {
      const [payments, alerts] = await Promise.all([fetchPayments(), fetchAlerts()]);
      set({ payments, alerts });
    } finally {
      set({ loading: false });
    }
  },

  runScenario: async (scenarioId, amount, description, recipientName) => {
    set({ run: { ...initialRun, scenarioId, status: "creating" } });
    try {
      let recipientId: string | undefined;
      if (recipientName) {
        const recipients: Recipient[] = await fetchRecipients();
        recipientId = recipients.find((r) => r.name === recipientName)?.id;
      }
      const payment = await createPayment(amount, description, recipientId);
      const paymentId = payment.id;
      set({ run: { scenarioId, status: "analyzing", paymentId, trace: [], message: null } });
      const analyzed = await analyzePayment(paymentId);
      const trace = await fetchTrace(paymentId);
      set({
        run: {
          scenarioId,
          status: "done",
          paymentId,
          trace: trace.length ? trace : [],
          message: `${analyzed.risk_level ?? "?"} / ${analyzed.recommendation ?? "?"}`,
        },
      });
      const [payments, alerts] = await Promise.all([fetchPayments(), fetchAlerts()]);
      set({ payments, alerts });
    } catch (error) {
      set({ run: { ...initialRun, scenarioId, status: "error", message: String(error) } });
    }
  },

  setPipeline: (pipeline) => set({ pipeline }),
}));