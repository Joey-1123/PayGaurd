// Location: hooks/usePayGuardThreatStream.ts
// Custom hook for the WebSocket real-time connection.
//
// WHY A HOOK FOR WEBSOCKET?
// The socket must connect when user logs in and disconnect on logout.
// It also needs to update the Zustand stores when events arrive.
// A hook manages this lifecycle cleanly with useEffect.

import { useEffect, useCallback } from 'react';
import {
  connectToShieldEngine,
  disconnectFromShieldEngine,
  listenForNewThreatAlerts,
  listenForTransferStatusUpdates,
  listenForLiveRiskUpdates,
  removeListener,
} from '@/services/PayGuardThreatStream';
import { PayGuardNetworkClient } from '@/services/PayGuardNetworkClient';
import { usePayGuardSession } from '@/store/payGuardSessionStore';
import { usePayGuardThreats } from '@/store/threatIntelligenceStore';
import { usePayGuardLedger } from '@/store/payGuardLedgerStore';

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
  const { setAlerts, updateRiskScore } = usePayGuardThreats();
  const { updateTransferStatus } = usePayGuardLedger();

  const refreshAlertFeed = useCallback(async () => {
    try {
      const alerts = await PayGuardNetworkClient.fetchThreatAlerts();
      setAlerts(alerts);
    } catch {
      // backend offline — keep current feed
    }
  }, [setAlerts]);

  useEffect(() => {
    // Only connect if user is logged in and has a token
    if (!isAuthenticated || !activeIdentity?.token) return;

    // 1. Connect to the WebSocket server
    connectToShieldEngine(activeIdentity.token);

    // 2. New threat alert (payment or inbound SMS). The WS payload only carries
    //    ids, so re-pull the feed to get the full alert records.
    listenForNewThreatAlerts(() => {
      void refreshAlertFeed();
    });

    // 3. Listen for transfer status changes → update ledger store
    listenForTransferStatusUpdates(({ transferId, status }) => {
      updateTransferStatus(transferId, status as any);
    });

    // 4. Listen for live risk score updates → update threat store
    listenForLiveRiskUpdates((score) => {
      updateRiskScore(score);
    });

    // CLEANUP: runs when user logs out or component unmounts
    return () => {
      removeListener('alert_new');
      removeListener('payment_status_changed');
      removeListener('risk_score_updated');
      disconnectFromShieldEngine();
    };
  }, [isAuthenticated, activeIdentity?.token, refreshAlertFeed]);
};

/**
 * Lighter hook — just returns the current risk score from the store.
 * Use this in the payment form screen's risk meter.
 */
export const useLiveRiskScore = () => {
  const { currentRiskScore } = usePayGuardThreats();
  return currentRiskScore;
};
