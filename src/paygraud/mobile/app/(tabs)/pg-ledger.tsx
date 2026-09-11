// Location: app/(tabs)/pg-ledger.tsx
// FamPay-Style History Screen

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { PayGuardColors, PayGuardSpacing, PayGuardFontSize, PayGuardBorderRadius, PayGuardFontWeight } from '@/constants/payGuardTheme';
import { MOCK_TRANSFERS } from '@/utils/mockData';
import { formatPayGuardCurrency, timeAgo } from '@/utils/payGuardFormatters';
import { getThreatColorForScore } from '@/utils/payGuardRiskEvaluator';

export default function PgHistoryScreen() {
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'BLOCKED'>('ALL');

  const filteredTransfers = MOCK_TRANSFERS.filter(t => {
    if (filter === 'COMPLETED') return t.transferStatus === 'COMPLETED';
    if (filter === 'BLOCKED') return t.transferStatus === 'BLOCKED_BY_SHIELD';
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      {/* FILTERS */}
      <View style={styles.filterRow}>
        {(['ALL', 'COMPLETED', 'BLOCKED'] as const).map(f => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'BLOCKED' ? '🛡️ Blocked' : f.charAt(0) + f.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filteredTransfers.map((t) => (
          <View key={t.transferId} style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: getThreatColorForScore(t.riskAssessmentScore) }]} />
            <View style={styles.txInfo}>
              <Text style={styles.txName}>{t.beneficiaryName}</Text>
              <Text style={styles.txTime}>{timeAgo(t.initiatedAt)}</Text>
            </View>
            <View style={styles.txRight}>
              <Text style={styles.txAmount}>-{formatPayGuardCurrency(t.amount, t.currencyCode)}</Text>
              <Text style={styles.txStatus}>
                {t.transferStatus === 'COMPLETED' ? '✅' : t.transferStatus === 'BLOCKED_BY_SHIELD' ? '🛡️ Blocked' : '⏳ Pending'}
              </Text>
            </View>
          </View>
        ))}
        {filteredTransfers.length === 0 && (
          <Text style={styles.emptyText}>No transactions found.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PayGuardColors.background.dark },
  header: { padding: PayGuardSpacing.lg },
  title: { color: PayGuardColors.text.primary, fontSize: PayGuardFontSize.xl, fontWeight: PayGuardFontWeight.bold },
  filterRow: { flexDirection: 'row', paddingHorizontal: PayGuardSpacing.lg, marginBottom: PayGuardSpacing.lg, gap: PayGuardSpacing.sm },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: PayGuardBorderRadius.full, backgroundColor: PayGuardColors.background.card, borderWidth: 1, borderColor: '#1F2937' },
  filterChipActive: { backgroundColor: PayGuardColors.brand.primary, borderColor: PayGuardColors.brand.primary },
  filterText: { color: PayGuardColors.text.secondary, fontSize: PayGuardFontSize.sm, fontWeight: PayGuardFontWeight.medium },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: PayGuardSpacing.lg, paddingBottom: 100 },
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: PayGuardColors.background.card, padding: PayGuardSpacing.md, borderRadius: PayGuardBorderRadius.lg, marginBottom: PayGuardSpacing.sm, borderWidth: 1, borderColor: '#1F2937' },
  txIcon: { width: 40, height: 40, borderRadius: 20, marginRight: PayGuardSpacing.md },
  txInfo: { flex: 1 },
  txName: { color: PayGuardColors.text.primary, fontSize: PayGuardFontSize.md, fontWeight: PayGuardFontWeight.semibold },
  txTime: { color: PayGuardColors.text.muted, fontSize: PayGuardFontSize.sm, marginTop: 4 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { color: PayGuardColors.text.primary, fontSize: PayGuardFontSize.md, fontWeight: PayGuardFontWeight.bold },
  txStatus: { color: PayGuardColors.text.secondary, fontSize: PayGuardFontSize.xs, marginTop: 4 },
  emptyText: { color: PayGuardColors.text.muted, textAlign: 'center', marginTop: PayGuardSpacing.xxl },
});
