// Location: app/(tabs)/_layout.tsx
// Pure Black & White Minimalist Bottom Navigation Dock with Lucide Vector Icons

import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { IconHome, IconQrCode, IconReceipt, IconShieldCheck } from '@/components/icons/PayGuardIcons';
import { PayGuardColors as C, PayGuardAlpha as A } from '@/constants/payGuardTheme';

function TabItem({
  IconComponent,
  focused,
}: {
  IconComponent: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  focused: boolean;
}) {
  return (
    <View style={styles.tabItem}>
      <IconComponent
        size={22}
        color={focused ? C.gray.white : C.gray[600]}
        strokeWidth={focused ? 2.4 : 1.8}
      />
      {focused && <View style={styles.activePill} />}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="pg-dashboard"
        options={{
          tabBarIcon: ({ focused }) => <TabItem IconComponent={IconHome} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pg-threat-center"
        options={{
          tabBarIcon: ({ focused }) => <TabItem IconComponent={IconQrCode} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pg-ledger"
        options={{
          tabBarIcon: ({ focused }) => <TabItem IconComponent={IconReceipt} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pg-preferences"
        options={{
          tabBarIcon: ({ focused }) => <TabItem IconComponent={IconShieldCheck} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: C.gray.black,
    borderTopColor: A.white(0.12),
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
    paddingTop: 8,
    elevation: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 44,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    bottom: -6,
    width: 14,
    height: 2,
    backgroundColor: C.gray.white,
    borderRadius: 1,
  },
});