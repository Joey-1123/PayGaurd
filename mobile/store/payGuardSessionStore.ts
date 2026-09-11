// Location: mobile/store/payGuardSessionStore.ts

import { create } from 'zustand';
import { PayGuardIdentity } from '../types/payGuardModels';

// 1. Define what our "memory" looks like
interface PayGuardSessionState {
  activeIdentity: PayGuardIdentity | null;
  isAuthenticated: boolean;
  authenticateIdentity: (identity: PayGuardIdentity) => void;
  purgeSession: () => void;
}

// 2. Create the actual memory bank
export const usePayGuardSession = create<PayGuardSessionState>((set) => ({
  activeIdentity: null,
  isAuthenticated: false,

  // Call this when the user successfully logs in
  authenticateIdentity: (identity) =>
    set({ activeIdentity: identity, isAuthenticated: true }),

  // Call this when the user logs out
  purgeSession: () =>
    set({ activeIdentity: null, isAuthenticated: false }),
}));