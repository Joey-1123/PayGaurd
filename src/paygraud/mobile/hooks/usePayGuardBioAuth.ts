// Location: hooks/usePayGuardBioAuth.ts
// Custom hook for biometric authentication.
//
// WHY A HOOK and not just calling the service directly from the screen?
// The hook manages the LOADING STATE and ERROR STATE.
// Without a hook, every screen would need to repeat this logic.
// With a hook, you just call: const { triggerBioAuth, isVerifying } = usePayGuardBioAuth()

import { useState, useCallback } from 'react';
import {
  isBioAuthAvailable,
  verifyWithPayGuardBioAuth,
  verifyBioAuthForLogin,
  getBioAuthType,
} from '@/services/PayGuardBioAuthEngine';
import * as LocalAuthentication from 'expo-local-authentication';

interface BioAuthState {
  isVerifying: boolean;       // true while Face ID prompt is showing
  isAvailable: boolean;       // true if device supports biometrics
  bioAuthType: string;        // "Face ID", "Touch ID", or "Fingerprint"
  error: string | null;       // error message if auth failed
}

export const usePayGuardBioAuth = () => {
  const [state, setState] = useState<BioAuthState>({
    isVerifying: false,
    isAvailable: false,
    bioAuthType: 'Biometrics',
    error: null,
  });

  /**
   * Check device capability on mount.
   * Call this in a useEffect when the screen loads.
   */
  const checkAvailability = useCallback(async () => {
    const available = await isBioAuthAvailable();
    const types = await getBioAuthType();

    // Determine the label to show on the button
    let typeLabel = 'Biometrics';
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      typeLabel = 'Face ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      typeLabel = 'Touch ID';
    }

    setState((s) => ({ ...s, isAvailable: available, bioAuthType: typeLabel }));
  }, []);

  /**
   * Trigger biometric verification for a HIGH-RISK payment.
   * Returns true if the user passed biometrics.
   */
  const triggerPaymentBioAuth = useCallback(
    async (amount: number): Promise<boolean> => {
      setState((s) => ({ ...s, isVerifying: true, error: null }));
      try {
        const success = await verifyWithPayGuardBioAuth(amount);
        if (!success) {
          setState((s) => ({
            ...s,
            isVerifying: false,
            error: 'Biometric verification failed. Transfer cancelled.',
          }));
        } else {
          setState((s) => ({ ...s, isVerifying: false }));
        }
        return success;
      } catch (e) {
        setState((s) => ({
          ...s,
          isVerifying: false,
          error: 'Biometric error. Please try again.',
        }));
        return false;
      }
    },
    []
  );

  /**
   * Trigger biometric verification for LOGIN.
   */
  const triggerLoginBioAuth = useCallback(async (): Promise<boolean> => {
    setState((s) => ({ ...s, isVerifying: true, error: null }));
    const success = await verifyBioAuthForLogin();
    setState((s) => ({ ...s, isVerifying: false }));
    return success;
  }, []);

  return {
    ...state,
    checkAvailability,
    triggerPaymentBioAuth,
    triggerLoginBioAuth,
  };
};
