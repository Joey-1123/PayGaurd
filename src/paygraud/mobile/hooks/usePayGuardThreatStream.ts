// Location: hooks/usePayGuardThreatStream.ts
// Custom hook for the WebSocket real-time connection.
//
// WHY A HOOK FOR WEBSOCKET?
// The socket must connect when user logs in and disconnect on logout.
// It also needs to update the Zustand stores when events arrive.
// A hook manages this lifecycle cleanly with useEffect.

import { useEffect } from 'react';
import {
  connectToShieldEngine,
  disconnectFromShieldEngine,
  listenForNewThreatAlerts,
  listenForTransferStatusUpdates,
  listenForLiveRiskUpdates,
  removeListener,
} from '@/services/PayGuardThreatStream';
import { usePayGuardSession } from '@/store/payGuardSessionStore';
import { usePayGuardThreats } from '@/store/threatIntelligenceStore';
import { usePayGuardLedger } from '@/store/payGuardLedgerStore';
import type { RiskAssessmentResult } from '@/types/payGuardModels';

/**
 * Manages the WebSocket connection lifecycle.
 * Use this in the ROOT LAYOUT so the socket stays alive for the whole app.
 * 
 * Usage:
 *   // In app/_layout.tsx
 *   usePayGuardThreatStream();
 */
export const usePayGuardThreatStream = () => {
  const { activeIdentity, isAuthenticated } = usePayGuardSession();
  const { addAlert, updateRiskScore } = usePayGuardThreats();
  const { updateTransferStatus } = usePayGuardLedger();

  useEffect(() => {
    // Only connect if user is logged in and has a token
    if (!isAuthenticated || !activeIdentity?.token) return;

    // 1. Connect to the WebSocket server
    connectToShieldEngine(activeIdentity.token);

    // 2. Listen for new security alerts → add to Zustand store
    listenForNewThreatAlerts((alert) => {
      addAlert(alert);
    });

    // 3. Listen for transfer status changes → update ledger store
    listenForTransferStatusUpdates(({ transferId, status }) => {
      updateTransferStatus(transferId, status as any);
    });

    // 4. Listen for live risk score updates → update threat store
    listenForLiveRiskUpdates((riskData: RiskAssessmentResult) => {
      updateRiskScore(riskData.riskScore);
    });

    // CLEANUP: runs when user logs out or component unmounts
    // Removes all listeners + disconnects socket
    return () => {
      removeListener('NEW_THREAT_ALERT');
      removeListener('TRANSFER_STATUS_UPDATED');
      removeListener('RISK_SCORE_UPDATED');
      disconnectFromShieldEngine();
    };
  }, [isAuthenticated, activeIdentity?.token]);
};

/**
 * Lighter hook — just returns the current risk score from the store.
 * Use this in the payment form screen's risk meter.
 */
export const useLiveRiskScore = () => {
  const { currentRiskScore } = usePayGuardThreats();
  return currentRiskScore;
};
