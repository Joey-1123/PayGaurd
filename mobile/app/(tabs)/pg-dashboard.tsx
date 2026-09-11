// Location: app/(tabs)/pg-dashboard.tsx
// FamPay-Style Home Screen

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { PayGuardColors, PayGuardSpacing, PayGuardFontSize, PayGuardBorderRadius, PayGuardFontWeight } from '@/constants/payGuardTheme';
import { usePayGuardSession } from '@/store/payGuardSessionStore';
import { formatPayGuardCurrency, timeAgo } from '@/utils/payGuardFormatters';
import { getThreatColorForScore } from '@/utils/payGuardRiskEvaluator';
import { MOCK_TRANSFERS, MOCK_TELEMETRY } from '@/utils/mockData';

export default function PgHomeScreen() {
  const { activeIdentity } = usePayGuardSession();
  const recentTransfers = MOCK_TRANSFERS.slice(0, 3);
  const firstName = activeIdentity?.fullName?.split(' ')[0] ?? 'User';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>👋 Hi {firstName}</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Text style={styles.bellIcon}>🔔</Text>
            {MOCK_TELEMETRY.activeAlerts > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{MOCK_TELEMETRY.activeAlerts}</Text></View>
            )}
          </TouchableOpacity>
        </View>

        {/* BALANCE CARD */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>PayGuard Balance</Text>
            <Text style={styles.cardBalance}>$2,847.50</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.cardNumber}>**** **** **** 4521</Text>
              <Text style={styles.cardLogo}>🛡️ PayGuard</Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTIONS GRID */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/secure-transfer/pg-initiate')}>
            <Text style={styles.actionIcon}>💸</Text>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>📥</Text>
            <Text style={styles.actionText}>Receive</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/pg-threat-center')}>
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionText}>Scan QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* SECURITY STATUS PILL */}
        <View style={styles.securityPill}>
          <Text style={styles.securityPillIcon}>🛡️</Text>
          <Text style={styles.securityPillText}>PayGuard Shield Active · Risk: LOW</Text>
        </View>

        {/* RECENT TRANSACTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/pg-ledger')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {recentTransfers.map((t) => (
            <View key={t.transferId} style={styles.txRow}>
              <View style={[styles.txIcon, { backgroundColor: getThreatColorForScore(t.riskAssessmentScore) }]} />
              <View style={styles.txInfo}>
                <Text style={styles.txName}>{t.beneficiaryName}</Text>
                <Text style={styles.txTime}>{timeAgo(t.initiatedAt)}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txAmount}>-{formatPayGuardCurrency(t.amount, t.currencyCode)}</Text>
                <Text style={styles.txStatus}>
                  {t.transferStatus === 'COMPLETED' ? '✅' : t.transferStatus === 'BLOCKED_BY_SHIELD' ? '🛡️ Blocked' : '⏳'}
                </Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PayGuardColors.background.dark },
  scroll: { padding: PayGuardSpacing.lg, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: PayGuardSpacing.xl },
  greeting: { color: PayGuardColors.text.primary, fontSize: PayGuardFontSize.xl, fontWeight: PayGuardFontWeight.bold },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: PayGuardColors.background.card, justifyContent: 'center', alignItems: 'center' },
  bellIcon: { fontSize: 20 },
  badge: { position: 'absolute', top: -2, right: -2, backgroundColor: PayGuardColors.risk.critical, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardContainer: { shadowColor: PayGuardColors.brand.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8, marginBottom: PayGuardSpacing.xl },
  card: { backgroundColor: '#0B1E36', borderRadius: PayGuardBorderRadius.xl, padding: PayGuardSpacing.xl, borderWidth: 1, borderColor: '#1C5B9E' },
  cardLabel: { color: '#7E9BBF', fontSize: PayGuardFontSize.sm, marginBottom: 4 },
  cardBalance: { color: '#fff', fontSize: 32, fontWeight: PayGuardFontWeight.extrabold, marginBottom: PayGuardSpacing.xl },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardNumber: { color: '#7E9BBF', fontSize: PayGuardFontSize.sm, letterSpacing: 2 },
  cardLogo: { color: '#fff', fontSize: PayGuardFontSize.sm, fontWeight: PayGuardFontWeight.bold },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: PayGuardSpacing.xl },
  actionBtn: { width: '48%', backgroundColor: PayGuardColors.background.card, padding: PayGuardSpacing.md, borderRadius: PayGuardBorderRadius.lg, alignItems: 'center', marginBottom: PayGuardSpacing.sm, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  actionIcon: { fontSize: 20 },
  actionText: { color: PayGuardColors.text.primary, fontSize: PayGuardFontSize.md, fontWeight: PayGuardFontWeight.semibold },
  securityPill: { flexDirection: 'row', backgroundColor: '#064E3B', padding: PayGuardSpacing.md, borderRadius: PayGuardBorderRadius.lg, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: PayGuardSpacing.xl },
  securityPillIcon: { fontSize: 18 },
  securityPillText: { color: '#34D399', fontSize: PayGuardFontSize.sm, fontWeight: PayGuardFontWeight.bold },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: PayGuardSpacing.md },
  sectionTitle: { color: PayGuardColors.text.primary, fontSize: PayGuardFontSize.lg, fontWeight: PayGuardFontWeight.bold },
  seeAll: { color: PayGuardColors.brand.primary, fontSize: PayGuardFontSize.sm },
  list: { backgroundColor: PayGuardColors.background.card, borderRadius: PayGuardBorderRadius.lg, padding: PayGuardSpacing.md },
  txRow: { flexDirection: 'row', alignItems: 'center', marginBottom: PayGuardSpacing.md },
  txIcon: { width: 12, height: 12, borderRadius: 6, marginRight: PayGuardSpacing.md },
  txInfo: { flex: 1 },
  txName: { color: PayGuardColors.text.primary, fontSize: PayGuardFontSize.md, fontWeight: PayGuardFontWeight.medium },
  txTime: { color: PayGuardColors.text.muted, fontSize: PayGuardFontSize.xs, marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { color: PayGuardColors.text.primary, fontSize: PayGuardFontSize.md, fontWeight: PayGuardFontWeight.bold },
  txStatus: { fontSize: PayGuardFontSize.xs, marginTop: 4 },
});
