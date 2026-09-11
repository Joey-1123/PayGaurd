// Location: hooks/usePayGuardLedger.ts
// Custom hook for the transaction ledger.
//
// Handles: fetching transfers from API → storing in Zustand → returning to UI.

import { useState, useCallback, useEffect } from 'react';
import { PayGuardNetworkClient, extractApiError } from '@/services/PayGuardNetworkClient';
import { usePayGuardLedger } from '@/store/payGuardLedgerStore';

export const usePayGuardLedgerData = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { transfers, setTransfers, updateTransferStatus } = usePayGuardLedger();

  /**
   * Load transfers from the API into the Zustand store.
   * Call this on screen mount and on pull-to-refresh.
   */
  const loadTransfers = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const result = await PayGuardNetworkClient.fetchTransfers();
      setTransfers(result);
    } catch (e) {
      setError(extractApiError(e));
    } finally {
      setIsFetching(false);
    }
  }, [setTransfers]);

  // Auto-load on first mount
  useEffect(() => { loadTransfers(); }, [loadTransfers]);

  return { transfers, isFetching, error, refresh: loadTransfers, updateTransferStatus };
};
