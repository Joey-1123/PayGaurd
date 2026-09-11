// Location: hooks/useThreatIntelligence.ts
// Custom hook for threat alerts + dashboard telemetry.

import { useCallback, useEffect, useState } from 'react';
import { PayGuardNetworkClient, extractApiError } from '@/services/PayGuardNetworkClient';
import { usePayGuardThreats } from '@/store/threatIntelligenceStore';

export const useThreatIntelligence = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    activeAlerts, telemetry, currentRiskScore,
    setAlerts, setTelemetry, dismissThreat, blockThreatSource,
  } = usePayGuardThreats();

  /** Load alerts + telemetry from the API. */
  const loadData = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const [alerts, telemetryData] = await Promise.all([
        PayGuardNetworkClient.fetchThreatAlerts(),
        PayGuardNetworkClient.fetchTelemetry(),
      ]);
      setAlerts(alerts);
      setTelemetry(telemetryData);
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setIsFetching(false);
    }
  }, [setAlerts, setTelemetry]);

  /** Dismiss an alert — calls API then updates local store. */
  const handleDismiss = useCallback(async (alertId: string) => {
    dismissThreat(alertId); // optimistic update (instant UI)
    try {
      await PayGuardNetworkClient.dismissAlert(alertId);
    } catch {
      // If API fails, we could revert — skipped for hackathon
    }
  }, [dismissThreat]);

  /** Block a threat source — calls API then updates local store. */
  const handleBlock = useCallback(async (alertId: string) => {
    blockThreatSource(alertId); // optimistic update
    try {
      await PayGuardNetworkClient.blockThreatSource(alertId);
    } catch {
      // Revert logic skipped for hackathon
    }
  }, [blockThreatSource]);

  useEffect(() => { loadData(); }, [loadData]);

  return {
    activeAlerts: activeAlerts.filter((a) => !a.isDismissed),
    telemetry, currentRiskScore, isFetching, error,
    refresh: loadData, dismiss: handleDismiss, block: handleBlock,
  };
};
