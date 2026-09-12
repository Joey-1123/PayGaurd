import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { PayGuardSecureTransfer } from '@/types/payGuardModels';

/**
 * Local device notifications driven by WS frames.
 *
 * NOTE: expo-notifications is NOT bundled in Expo Go on Android (remote
 * notification support removed in SDK 53) and its module has an import-time
 * side effect that throws there. We never import it on Android Expo Go, and
 * otherwise load it lazily — the app always boots, notifications silently
 * no-op where unavailable, and the in-app UI covers the gap. Real device
 * notifications need a development build.
 */
const isAndroidExpoGo =
  Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let notifier: typeof import('expo-notifications') | null = null;

async function loadNotifier(): Promise<typeof import('expo-notifications') | null> {
  if (Platform.OS === 'web' || isAndroidExpoGo) return null;
  if (notifier) return notifier;
  try {
    const mod = await import('expo-notifications');
    mod.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    notifier = mod;
    return mod;
  } catch {
    // Expo Go on Android throws at module evaluation — notifications unavailable.
    return null;
  }
}

/**
 * Fire a device notification for a transfer event (WS-driven).
 */
export const notifyTransfer = async (transfer: PayGuardSecureTransfer): Promise<void> => {
  const Notifications = await loadNotifier();
  if (!Notifications) return;

  const { transferStatus, amount, currencyCode, beneficiaryName } = transfer;
  const title =
    transferStatus === 'AWAITING_CONFIRMATION'
      ? 'Approval required'
      : transferStatus === 'BLOCKED_BY_SHIELD'
        ? 'Transfer blocked'
        : transferStatus === 'COMPLETED' || transferStatus === 'CONFIRMED'
          ? 'Transfer settled'
          : 'Transfer updated';
  const body =
    `${beneficiaryName} · ${amount} ${currencyCode} — ` +
    (transferStatus === 'AWAITING_CONFIRMATION'
      ? 'tap the ledger to approve or block'
      : transferStatus === 'BLOCKED_BY_SHIELD'
        ? 'blocked before payment reached the rails'
        : transferStatus === 'COMPLETED' || transferStatus === 'CONFIRMED'
          ? 'cleared by the shield'
          : 'status changed');

  try {
    const current = await Notifications.getPermissionsAsync();
    let granted = current.granted;
    if (!granted) granted = (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { transferId: transfer.transferId } },
      trigger: null,
    });
  } catch {
    // notifications unavailable (Expo Go / Simulator) — WS still updates the UI
  }
};