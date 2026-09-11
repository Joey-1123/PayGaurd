// Location: app/_layout.tsx
// PayGuard Root Layout — wraps everything, handles auth redirect

import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePayGuardSession } from '@/store/payGuardSessionStore';

SplashScreen.preventAutoHideAsync();

// WHY THIS COMPONENT?
// "useProtectedRoute" checks if the user is logged in.
// If not logged in and trying to access (tabs) → redirect to login
// If logged in and on (auth) screens → redirect to dashboard
// This is the "auth guard" pattern.
function useProtectedRoute() {
  const { isAuthenticated } = usePayGuardSession();
  const segments = useSegments(); // current route segments e.g. ["(tabs)", "pg-dashboard"]
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in, not on auth screen → send to login
      router.replace('/(auth)/pg-login');
    } else if (isAuthenticated && inAuthGroup) {
      // Logged in but still on auth screen → send to dashboard
      router.replace('/(tabs)/pg-dashboard');
    }
  }, [isAuthenticated, segments]);
}

export default function PayGuardRootLayout() {
  useProtectedRoute();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {/* Slot renders whatever the current route's screen is */}
        <Slot />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
