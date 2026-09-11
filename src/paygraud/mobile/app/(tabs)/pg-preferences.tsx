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
import { useThreatIntelligence } from '@/hooks/useThreatIntelligence';
import { PayGuardColors as C, PayGuardAlpha as A, PayGuardMonoFont } from '@/constants/payGuardTheme';

export default function PgPreferencesScreen() {
  const { activeIdentity, purgeSession } = usePayGuardSession();
  const { activeAlerts, telemetry } = useThreatIntelligence();
  const [autoBlock, setAutoBlock] = useState(true);
  const [deepPacketScan, setDeepPacketScan] = useState(true);
  const [multiModelAudit, setMultiModelAudit] = useState(true);

  const initials =
    activeIdentity?.fullName?.split(' ').map((n) => n[0]).join('') ?? 'PG';
  const totalTxns = telemetry?.totalTransactions ?? 0;
  const blocked = telemetry?.threatsBlockedToday ?? 0;
  const activeCount = activeAlerts.length;

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
          <Text style={styles.userName}>{activeIdentity?.fullName ?? 'PayGuard User'}</Text>
          <Text style={styles.userEmail}>{activeIdentity?.emailAddress ?? '—'}</Text>
          <View style={styles.trustBadge}>
            <IconShieldCheck size={14} color={C.risk.safe} />
            <Text style={styles.trustBadgeText}>SHIELD ENGINE CONNECTED</Text>
          </View>
        </View>

        {/* 3-METRIC STATS GRID */}
        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Text style={styles.statNumber}>{totalTxns}</Text>
            <Text style={styles.statLabel}>TOTAL TXNS</Text>
          </View>
          <View style={[styles.statTile, { borderColor: A.danger(0.3) }]}>
            <Text style={[styles.statNumber, { color: C.risk.critical }]}>
              {blocked}
            </Text>
            <Text style={styles.statLabel}>AUTO-BLOCKED</Text>
          </View>
          <View style={[styles.statTile, { borderColor: A.warn(0.3) }]}>
            <Text style={[styles.statNumber, { color: C.risk.warn }]}>
              {activeCount}
            </Text>
            <Text style={styles.statLabel}>ACTIVE ALERTS</Text>
          </View>
        </View>

        {/* INTERCEPTED THREAT LOG */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INTERCEPTED THREAT INTELLIGENCE</Text>
          {activeAlerts.length === 0 && (
            <Text style={styles.emptyNote}>No active threats intercepted.</Text>
          )}
          {activeAlerts.map((alert) => (
            <View key={alert.alertId} style={styles.threatCard}>
              <View style={styles.threatCardHeader}>
                <View style={styles.threatBadge}>
                  <IconShieldAlert size={12} color={C.risk.critical} />
                  <Text style={styles.threatBadgeText}>{alert.threatLevel}</Text>
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
                <IconShieldCheck size={16} color={C.gray.white} />
                <Text style={styles.toggleTitle}>Automatic Fraudster Blocking</Text>
              </View>
              <Text style={styles.toggleSub}>Instantly terminate transaction if risk score exceeds 80</Text>
            </View>
            <Switch
              value={autoBlock}
              onValueChange={setAutoBlock}
              thumbColor={autoBlock ? C.gray.white : C.gray[600]}
              trackColor={{ false: C.gray[850], true: C.gray[700] }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={styles.toggleTitleRow}>
                <IconRadio size={16} color={C.gray.white} />
                <Text style={styles.toggleTitle}>Deep QR Payload Inspection</Text>
              </View>
              <Text style={styles.toggleSub}>Inspect URL schemes for redirection and synthetic VPAs</Text>
            </View>
            <Switch
              value={deepPacketScan}
              onValueChange={setDeepPacketScan}
              thumbColor={deepPacketScan ? C.gray.white : C.gray[600]}
              trackColor={{ false: C.gray[850], true: C.gray[700] }}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={styles.toggleTitleRow}>
                <IconCpu size={16} color={C.gray.white} />
                <Text style={styles.toggleTitle}>Multi-Model AI Consensus</Text>
              </View>
              <Text style={styles.toggleSub}>Route through OpenAI + Anthropic + local rule engine</Text>
            </View>
            <Switch
              value={multiModelAudit}
              onValueChange={setMultiModelAudit}
              thumbColor={multiModelAudit ? C.gray.white : C.gray[600]}
              trackColor={{ false: C.gray[850], true: C.gray[700] }}
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
          <IconLogOut size={16} color={C.gray.white} />
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
    backgroundColor: C.gray.black,
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
    backgroundColor: C.gray[975],
    borderWidth: 1.5,
    borderColor: C.gray.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: C.gray.white,
    fontSize: 26,
    fontWeight: '900',
  },
  userName: {
    color: C.gray.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userEmail: {
    color: C.text.secondary,
    fontSize: 12,
    marginBottom: 10,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background.input,
    borderWidth: 1,
    borderColor: A.white(0.15),
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  trustBadgeText: {
    color: C.gray[300],
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
    backgroundColor: C.gray.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: A.white(0.08),
    alignItems: 'center',
  },
  statNumber: {
    color: C.gray.white,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
    fontFamily: PayGuardMonoFont,
  },
  statLabel: {
    color: C.gray[600],
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 28,
  },
  emptyNote: {
    color: C.gray[600],
    fontSize: 11,
  },
  sectionTitle: {
    color: C.gray[600],
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  threatCard: {
    backgroundColor: C.gray.card,
    borderRadius: 16,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: C.risk.critical,
    borderWidth: 1,
    borderColor: A.white(0.06),
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
    backgroundColor: A.danger(0.15),
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  threatBadgeText: {
    color: C.risk.critical,
    fontSize: 9,
    fontWeight: 'bold',
  },
  threatCategory: {
    color: C.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  threatDesc: {
    color: C.gray[300],
    fontSize: 11,
    lineHeight: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.gray.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: A.white(0.08),
    marginBottom: 8,
  },
  toggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  toggleTitle: {
    color: C.gray.white,
    fontSize: 13,
    fontWeight: '600',
  },
  toggleSub: {
    color: C.gray[600],
    fontSize: 10,
    lineHeight: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.gray.card,
    borderWidth: 1,
    borderColor: A.white(0.15),
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  btnPressed: {
    opacity: 0.75,
  },
  logoutText: {
    color: C.gray.white,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
