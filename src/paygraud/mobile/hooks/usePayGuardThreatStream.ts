// Location: hooks/usePayGuardThreatStream.ts
// Custom hook for the WebSocket real-time connection.
//
// WHY A HOOK FOR WEBSOCKET?
// The socket must connect when user logs in and disconnect on logout.
// It also needs to update the Zustand stores when events arrive.
// A hook manages this lifecycle cleanly with useEffect.

import { useEffect, useCallback, useRef } from 'react';
import {
  connectToShieldEngine,
  disconnectFromShieldEngine,
  listenForNewThreatAlerts,
  listenForTransferStatusUpdates,
  listenForLiveRiskUpdates,
  removeListener,
} from '@/services/PayGuardThreatStream';
import { PayGuardNetworkClient } from '@/services/PayGuardNetworkClient';
import { notifyTransfer } from '@/services/payGuardLocalNotifier';
import { usePayGuardSession } from '@/store/payGuardSessionStore';
import { usePayGuardThreats } from '@/store/threatIntelligenceStore';
import { usePayGuardLedger } from '@/store/payGuardLedgerStore';
import { toTransferStatus } from '@/utils/payGuardApiMappers';

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
  const { transfers, upsertTransfer, updateTransferStatus } = usePayGuardLedger();

  // Reflect the latest ledger into a ref so handleTransferStatus stays a
  // stable callback — otherwise every store update re-runs the WS effect
  // below and the socket tears down + reconnects (churn, missed events).
  const transfersRef = useRef(transfers);
  transfersRef.current = transfers;

  const refreshAlertFeed = useCallback(async () => {
    try {
      const alerts = await PayGuardNetworkClient.fetchThreatAlerts();
      setAlerts(alerts);
    } catch {
      // backend offline — keep current feed
    }
  }, [setAlerts]);

  const handleTransferStatus = useCallback(
    async (transferId: string, status: string) => {
      const mapped = toTransferStatus(status);
      let transfer = transfersRef.current.find((t) => t.transferId === transferId);
      if (!transfer) {
        try {
          // Payment may have been initiated on another device (web) — fetch once
          // so the ledger shows it and the notification carries full details.
          transfer = await PayGuardNetworkClient.fetchTransferById(transferId);
          upsertTransfer(transfer);
        } catch {
          return;
        }
      }
      updateTransferStatus(transferId, mapped);
      void notifyTransfer({ ...transfer, transferStatus: mapped });
    },
    [upsertTransfer, updateTransferStatus]
  );

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

    // 3. Listen for transfer status changes → inject into ledger (upserting
    //    transfers the device has never seen) + raise a device notification.
    listenForTransferStatusUpdates(({ transferId, status }) => {
      void handleTransferStatus(transferId, status);
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
  }, [isAuthenticated, activeIdentity?.token, refreshAlertFeed, handleTransferStatus]);
};

/**
 * Lighter hook — just returns the current risk score from the store.
 * Use this in the payment form screen's risk meter.
 */
export const useLiveRiskScore = () => {
  const { currentRiskScore } = usePayGuardThreats();
  return currentRiskScore;
};
