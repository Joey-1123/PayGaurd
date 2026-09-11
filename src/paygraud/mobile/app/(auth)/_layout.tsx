// Location: app/(auth)/_layout.tsx
// PayGuard Auth Stack — welcome, login & register screens (no tab bar)

import { Stack } from 'expo-router';
import { PayGuardColors as C } from '@/constants/payGuardTheme';

export default function PayGuardAuthStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.gray.black },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="pg-welcome" />
      <Stack.Screen name="pg-login" />
      <Stack.Screen name="pg-register" />
    </Stack>
  );
}

