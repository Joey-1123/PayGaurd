// Location: store/payGuardLedgerStore.ts
// Manages the transaction ledger with optimistic UI updates

import { create } from 'zustand';
import { PayGuardSecureTransfer, SecurePaymentIntent } from '@/types/payGuardModels';

interface PayGuardLedgerState {
  transfers: PayGuardSecureTransfer[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setTransfers: (transfers: PayGuardSecureTransfer[]) => void;
  addTransfer: (transfer: PayGuardSecureTransfer) => void;
  updateTransferStatus: (transferId: string, status: PayGuardSecureTransfer['transferStatus']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearLedger: () => void;
}

export const usePayGuardLedger = create<PayGuardLedgerState>((set) => ({
  transfers: [],
  isLoading: false,
  error: null,

  setTransfers: (transfers) => set({ transfers }),

  addTransfer: (transfer) =>
    set((state) => ({ transfers: [transfer, ...state.transfers] })),

  updateTransferStatus: (transferId, status) =>
    set((state) => ({
      transfers: state.transfers.map((t) =>
        t.transferId === transferId ? { ...t, transferStatus: status } : t
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearLedger: () => set({ transfers: [], error: null }),
}));
