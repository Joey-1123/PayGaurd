// Location: store/threatIntelligenceStore.ts
// Manages active security alerts and the real-time risk score

import { create } from 'zustand';
import { PayGuardThreatAlert, PayGuardTelemetry } from '@/types/payGuardModels';

interface ThreatIntelligenceState {
  activeAlerts: PayGuardThreatAlert[];
  currentRiskScore: number;
  telemetry: PayGuardTelemetry | null;
  isLoading: boolean;

  // Actions
  setAlerts: (alerts: PayGuardThreatAlert[]) => void;
  addAlert: (alert: PayGuardThreatAlert) => void;
  dismissThreat: (alertId: string) => void;
  blockThreatSource: (alertId: string) => void;
  updateRiskScore: (score: number) => void;
  setTelemetry: (telemetry: PayGuardTelemetry) => void;
  setLoading: (loading: boolean) => void;
  clearThreats: () => void;
}

export const usePayGuardThreats = create<ThreatIntelligenceState>((set) => ({
  activeAlerts: [],
  currentRiskScore: 0,
  telemetry: null,
  isLoading: false,

  setAlerts: (alerts) => set({ activeAlerts: alerts }),

  addAlert: (alert) =>
    set((state) => ({ activeAlerts: [alert, ...state.activeAlerts] })),

  dismissThreat: (alertId) =>
    set((state) => ({
      activeAlerts: state.activeAlerts.map((a) =>
        a.alertId === alertId ? { ...a, isDismissed: true } : a
      ),
    })),

  blockThreatSource: (alertId) =>
    set((state) => ({
      activeAlerts: state.activeAlerts.map((a) =>
        a.alertId === alertId ? { ...a, isBlocked: true, isDismissed: true } : a
      ),
    })),

  updateRiskScore: (score) => set({ currentRiskScore: score }),

  setTelemetry: (telemetry) => set({ telemetry }),

  setLoading: (loading) => set({ isLoading: loading }),

  clearThreats: () =>
    set({ activeAlerts: [], currentRiskScore: 0, telemetry: null }),
}));
