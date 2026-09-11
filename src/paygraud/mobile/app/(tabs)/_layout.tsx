// Location: app/(tabs)/_layout.tsx
// PayGuard Main Tab Bar — Dashboard, Ledger, Threat Center, Preferences

import { Tabs } from 'expo-router';
import { PayGuardColors } from '@/constants/payGuardTheme';

export default function PayGuardMainTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: PayGuardColors.background.card,
          borderTopColor: '#1F2937',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: PayGuardColors.brand.primary,
        tabBarInactiveTintColor: PayGuardColors.text.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="pg-dashboard"
        options={{ title: 'Dashboard', tabBarLabel: 'Home' }}
      />
      <Tabs.Screen
        name="pg-ledger"
        options={{ title: 'Ledger', tabBarLabel: 'Ledger' }}
      />
      <Tabs.Screen
        name="pg-threat-center"
        options={{ title: 'Alerts', tabBarLabel: 'Alerts' }}
      />
      <Tabs.Screen
        name="pg-preferences"
        options={{ title: 'Settings', tabBarLabel: 'Settings' }}
      />
    </Tabs>
  );
}
