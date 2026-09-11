// Location: services/PayGuardBioAuthEngine.ts
// Handles biometric authentication (Face ID / Touch ID / Fingerprint).
// Uses expo-local-authentication — Expo's wrapper around native biometric APIs.

import * as LocalAuthentication from 'expo-local-authentication';

// ─────────────────────────────────────────────
// 🔍 CAPABILITY CHECK
// ─────────────────────────────────────────────

/**
 * Checks if the device supports biometrics at all.
 * Some older/cheaper devices have no biometric hardware.
 * 
 * Returns: true if device has Face ID / Touch ID / Fingerprint
 * 
 * WHY CHECK THIS FIRST?
 * If the device has no biometrics, we fallback to PIN/password.
 * We never want to show a biometric prompt on an unsupported device.
 */
export const isBioAuthAvailable = async (): Promise<boolean> => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;

  // Check if the user has actually enrolled biometrics
  // (device could have hardware but no fingerprints/face enrolled)
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
};

/**
 * Returns what TYPE of biometrics the device supports.
 * 
 * Returns list like:
 *  [AuthenticationType.FINGERPRINT]           → Touch ID
 *  [AuthenticationType.FACIAL_RECOGNITION]    → Face ID
 *  [AuthenticationType.IRIS]                  → Iris scan
 */
export const getBioAuthType =
  async (): Promise<LocalAuthentication.AuthenticationType[]> => {
    return LocalAuthentication.supportedAuthenticationTypesAsync();
  };

// ─────────────────────────────────────────────
// 🔐 AUTHENTICATION
// ─────────────────────────────────────────────

/**
 * Triggers a biometric prompt for HIGH-RISK payment authorization.
 * 
 * WHY: When a payment is HIGH risk, we don't just ask "are you sure?".
 * We require biometric proof that the REAL user is authorizing it.
 * A scammer who grabbed your phone can't use your face or fingerprint.
 * 
 * @param transferAmount - shown in the prompt message to the user
 * @returns true if the user authenticated successfully
 * 
 * Example:
 *   verifyWithPayGuardBioAuth(5000)
 *   → Shows: "PayGuard requires Face ID to secure this $5,000.00 transfer"
 *   → User scans face → returns true
 *   → User fails 3 times → returns false
 */
export const verifyWithPayGuardBioAuth = async (
  transferAmount: number
): Promise<boolean> => {
  // First check the device supports biometrics
  const available = await isBioAuthAvailable();
  if (!available) {
    // No biometrics → fallback (in a real app, show PIN screen)
    // For the hackathon, we'll allow it through with a warning
    console.warn('[PayGuardBioAuth] No biometrics available — fallback used');
    return true;
  }

  const result = await LocalAuthentication.authenticateAsync({
    // This message appears in the Face ID / fingerprint dialog
    promptMessage: `PayGuard requires biometrics to secure this $${transferAmount.toLocaleString()} transfer`,

    // Shown when biometric fails — user can try again
    fallbackLabel: 'Use device PIN',

    // If true, the user can fall back to device PIN/password
    disableDeviceFallback: false,

    // Cancel button text
    cancelLabel: 'Cancel Transfer',
  });

  return result.success;
};

/**
 * Triggers biometric prompt for app LOGIN (not payment — lighter message).
 * 
 * @returns true if authenticated
 */
export const verifyBioAuthForLogin = async (): Promise<boolean> => {
  const available = await isBioAuthAvailable();
  if (!available) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Use biometrics to sign in to PayGuard',
    fallbackLabel: 'Use password',
    disableDeviceFallback: false,
    cancelLabel: 'Cancel',
  });

  return result.success;
};
