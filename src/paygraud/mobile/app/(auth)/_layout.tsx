// Location: app/(auth)/_layout.tsx
// PayGuard Auth Stack — login & register screens (no tab bar)

import { Stack } from 'expo-router';

export default function PayGuardAuthStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0F1E' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="pg-login" />
      <Stack.Screen name="pg-register" />
    </Stack>
  );
}
