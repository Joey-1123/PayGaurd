// Location: app/_layout.tsx
// PayGuard Root Layout — wraps everything with auth guard & theme

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePayGuardSession } from '@/store/payGuardSessionStore';

SplashScreen.preventAutoHideAsync();

export default function PayGuardRootLayout() {
  const { isAuthenticated } = usePayGuardSession();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0A0F1E" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="secure-transfer" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
