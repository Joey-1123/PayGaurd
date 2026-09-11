// Location: app/(tabs)/pg-preferences.tsx
// Rethought with UI-UX-Pro-Max & Anti-UI-Slop: Pure B&W Security Command Center

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  IconShieldCheck,
  IconShieldAlert,
  IconRadio,
  IconCpu,
  IconLogOut,
} from '@/components/icons/PayGuardIcons';
import { usePayGuardSession } from '@/store/payGuardSessionStore';
import { MOCK_TELEMETRY, MOCK_ALERTS } from '@/utils/mockData';

export default function PgPreferencesScreen() {
  const { activeIdentity, purgeSession } = usePayGuardSession();
  const [autoBlock, setAutoBlock] = useState(true);
  const [deepPacketScan, setDeepPacketScan] = useState(true);
  const [multiModelAudit, setMultiModelAudit] = useState(true);

  const initials = activeIdentity?.fullName?.split(' ').map((n) => n[0]).join('') ?? 'AJ';

  const handleLogout = () => {
    purgeSession();
    router.replace('/(auth)/pg-login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* PROFILE HEADER */}
        <View style={styles.profileBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{activeIdentity?.fullName ?? 'Alex Johnson'}</Text>
          <Text style={styles.userEmail}>{activeIdentity?.emailAddress ?? 'alex@demo.payguard'}</Text>
          <View style={styles.trustBadge}>
            <IconShieldCheck size={14} color="#00FF66" />
            <Text style={styles.trustBadgeText}>TRUST SCORE: 98% (ELITE VERIFIED)</Text>
          </View>
        </View>

        {/* 3-METRIC STATS GRID */}
        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Text style={styles.statNumber}>{MOCK_TELEMETRY.totalTransactions}</Text>
            <Text style={styles.statLabel}>TOTAL TXNS</Text>
          </View>
          <View style={[styles.statTile, { borderColor: 'rgba(255, 42, 42, 0.3)' }]}>
            <Text style={[styles.statNumber, { color: '#FF2A2A' }]}>
              {MOCK_TELEMETRY.threatsBlockedToday}
            </Text>
            <Text style={styles.statLabel}>AUTO-BLOCKED</Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>AI MODELS</Text>
          </View>
        </View>

        {/* INTERCEPTED THREAT LOG */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INTERCEPTED THREAT INTELLIGENCE</Text>
          {MOCK_ALERTS.map((alert) => (
            <View key={alert.alertId} style={styles.threatCard}>
              <View style={styles.threatCardHeader}>
                <View style={styles.threatBadge}>
                  <IconShieldAlert size={12} color="#FF2A2A" />
                  <Text style={styles.threatBadgeText}>BLOCKED</Text>
                </View>
                <Text style={styles.threatCategory}>{alert.threatCategory.replace(/_/g, ' ')}</Text>
              </View>
              <Text style={styles.threatDesc}>{alert.description}</Text>
            </View>
          ))}
        </View>

        {/* DEFENSE CONTROLS TOGGLES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEFENSE PROTOCOL SWITCHES</Text>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={styles.toggleTitleRow}>
                <IconShieldCheck size={16} color="#FFFFFF" />
                <Text style={styles.toggleTitle}>Automatic Fraudster Blocking</Text>
              </View>
              <Text style={styles.toggleSub}>Instantly terminate transaction if risk score exceeds 80</Text>
            </View>
            <Switch
              value={autoBlock}
              onValueChange={setAutoBlock}
              thumbColor={autoBlock ? '#FFFFFF' : '#666666'}
              trackColor={{ false: '#222222', true: '#555555' }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={styles.toggleTitleRow}>
                <IconRadio size={16} color="#FFFFFF" />
                <Text style={styles.toggleTitle}>Deep QR Payload Inspection</Text>
              </View>
              <Text style={styles.toggleSub}>Inspect URL schemes for redirection and synthetic VPAs</Text>
            </View>
            <Switch
              value={deepPacketScan}
              onValueChange={setDeepPacketScan}
              thumbColor={deepPacketScan ? '#FFFFFF' : '#666666'}
              trackColor={{ false: '#222222', true: '#555555' }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={styles.toggleTitleRow}>
                <IconCpu size={16} color="#FFFFFF" />
                <Text style={styles.toggleTitle}>Multi-Model AI Consensus</Text>
              </View>
              <Text style={styles.toggleSub}>Route through OpenAI + Anthropic + local rule engine</Text>
            </View>
            <Switch
              value={multiModelAudit}
              onValueChange={setMultiModelAudit}
              thumbColor={multiModelAudit ? '#FFFFFF' : '#666666'}
              trackColor={{ false: '#222222', true: '#555555' }}
            />
          </View>
        </View>

        {/* LOGOUT */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.btnPressed]}
          onPress={handleLogout}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Sign out of PayGuard"
          accessibilityRole="button"
        >
          <IconLogOut size={16} color="#FFFFFF" />
          <Text style={styles.logoutText}>SIGN OUT</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  profileBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#111111',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userEmail: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 10,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E0E0E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  trustBadgeText: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  statTile: {
    flex: 1,
    backgroundColor: '#0C0C0C',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statLabel: {
    color: '#666666',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#666666',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  threatCard: {
    backgroundColor: '#0C0C0C',
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#FF2A2A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 8,
  },
  threatCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  threatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 42, 42, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  threatBadgeText: {
    color: '#FF2A2A',
    fontSize: 9,
    fontWeight: 'bold',
  },
  threatCategory: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600',
  },
  threatDesc: {
    color: '#CCCCCC',
    fontSize: 11,
    lineHeight: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0C0C0C',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  toggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  toggleTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  toggleSub: {
    color: '#666666',
    fontSize: 10,
    lineHeight: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0C0C0C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  btnPressed: {
    opacity: 0.75,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
