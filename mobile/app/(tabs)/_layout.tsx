// Location: app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { PayGuardColors, PayGuardFontWeight } from '@/constants/payGuardTheme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: PayGuardColors.background.cardElevated,
          borderTopColor: '#1F2937',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: PayGuardColors.brand.primary,
        tabBarInactiveTintColor: PayGuardColors.text.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: PayGuardFontWeight.medium,
        },
      }}
    >
      <Tabs.Screen
        name="pg-dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="pg-threat-center"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📷</Text>,
        }}
      />
      <Tabs.Screen
        name="pg-ledger"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🕐</Text>,
        }}
      />
      <Tabs.Screen
        name="pg-preferences"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
