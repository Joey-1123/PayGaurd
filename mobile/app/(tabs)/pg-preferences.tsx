// Location: app/(tabs)/pg-preferences.tsx
// FamPay-Style Account / Profile Screen

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PayGuardColors, PayGuardSpacing, PayGuardFontSize, PayGuardBorderRadius, PayGuardFontWeight } from '@/constants/payGuardTheme';
import { usePayGuardSession } from '@/store/payGuardSessionStore';
import { MOCK_TELEMETRY, MOCK_ALERTS } from '@/utils/mockData';
import { getThreatColorForLevel } from '@/utils/payGuardRiskEvaluator';
import { router } from 'expo-router';

export default function PgAccountScreen() {
  const { activeIdentity, purgeSession } = usePayGuardSession();
  const initials = activeIdentity?.fullName?.split(' ').map(n => n[0]).join('') ?? 'U';

  const handleLogout = () => {
    purgeSession();
    router.replace('/(auth)/pg-login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* PROFILE HEADER */}
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{activeIdentity?.fullName}</Text>
          <Text style={styles.email}>{activeIdentity?.emailAddress}</Text>
          
          <View style={styles.trustBadge}>
            <Text style={styles.trustText}>🛡️ Trust Score: {activeIdentity?.trustScore}%</Text>
          </View>
        </View>

        {/* STATS ROW */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{MOCK_TELEMETRY.totalTransactions}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: PayGuardColors.risk.critical }]}>{MOCK_TELEMETRY.threatsBlockedToday}</Text>
            <Text style={styles.statLabel}>Blocked Threats</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: PayGuardColors.risk.warn }]}>{MOCK_TELEMETRY.activeAlerts}</Text>
            <Text style={styles.statLabel}>Active Alerts</Text>
          </View>
        </View>

        {/* ACTIVE ALERTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Active Alerts</Text>
          {MOCK_ALERTS.map(alert => (
            <View key={alert.alertId} style={[styles.alertCard, { borderLeftColor: getThreatColorForLevel(alert.threatLevel) }]}>
              <Text style={[styles.alertTitle, { color: getThreatColorForLevel(alert.threatLevel) }]}>
                {alert.threatLevel} — {alert.threatCategory.replace(/_/g, ' ')}
              </Text>
              <Text style={styles.alertDesc}>{alert.description}</Text>
            </View>
          ))}
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PayGuardColors.background.dark },
  scroll: { padding: PayGuardSpacing.lg, paddingBottom: 100 },
  profileContainer: { alignItems: 'center', marginBottom: PayGuardSpacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: PayGuardColors.brand.primary, justifyContent: 'center', alignItems: 'center', marginBottom: PayGuardSpacing.md },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  name: { color: PayGuardColors.text.primary, fontSize: PayGuardFontSize.xl, fontWeight: PayGuardFontWeight.bold, marginBottom: 4 },
  email: { color: PayGuardColors.text.secondary, fontSize: PayGuardFontSize.md, marginBottom: PayGuardSpacing.md },
  trustBadge: { backgroundColor: '#064E3B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  trustText: { color: '#34D399', fontSize: PayGuardFontSize.sm, fontWeight: PayGuardFontWeight.bold },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: PayGuardSpacing.xxl },
  statBox: { flex: 1, backgroundColor: PayGuardColors.background.card, marginHorizontal: 4, padding: PayGuardSpacing.md, borderRadius: PayGuardBorderRadius.lg, alignItems: 'center', borderWidth: 1, borderColor: '#1F2937' },
  statValue: { color: PayGuardColors.text.primary, fontSize: PayGuardFontSize.xl, fontWeight: PayGuardFontWeight.bold, marginBottom: 4 },
  statLabel: { color: PayGuardColors.text.secondary, fontSize: 10, textAlign: 'center' },
  section: { marginBottom: PayGuardSpacing.xxl },
  sectionTitle: { color: PayGuardColors.text.primary, fontSize: PayGuardFontSize.lg, fontWeight: PayGuardFontWeight.bold, marginBottom: PayGuardSpacing.md },
  alertCard: { backgroundColor: PayGuardColors.background.card, padding: PayGuardSpacing.md, borderRadius: PayGuardBorderRadius.md, marginBottom: PayGuardSpacing.sm, borderLeftWidth: 4, borderWidth: 1, borderColor: '#1F2937' },
  alertTitle: { fontSize: PayGuardFontSize.sm, fontWeight: PayGuardFontWeight.bold, marginBottom: 6 },
  alertDesc: { color: PayGuardColors.text.secondary, fontSize: PayGuardFontSize.sm },
  logoutBtn: { backgroundColor: '#2D1515', padding: PayGuardSpacing.lg, borderRadius: PayGuardBorderRadius.full, alignItems: 'center', borderWidth: 1, borderColor: PayGuardColors.risk.critical },
  logoutText: { color: PayGuardColors.risk.critical, fontSize: PayGuardFontSize.md, fontWeight: PayGuardFontWeight.bold },
});
