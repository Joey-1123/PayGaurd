// Location: modules/payguard-sms/index.ts
// Native SMS bridge — only available on dev/native builds (not Expo Go).

import { requireNativeModule } from 'expo-modules-core';

export interface SmsPayload {
  sender: string;
  body: string;
}

export type PayGuardSmsListener = (payload: SmsPayload) => void;

interface SmsSubscription {
  remove: () => void;
}

interface PayGuardSmsNative {
  addListener: (event: 'onSmsReceived', listener: PayGuardSmsListener) => SmsSubscription;
  removeListeners: (count: number) => void;
}

const nativeModule = requireNativeModule<PayGuardSmsNative>('PayGuardSms');

export const subscribeToSms = (listener: PayGuardSmsListener) =>
  nativeModule.addListener('onSmsReceived', listener);

export default {
  subscribeToSms,
};