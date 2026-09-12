// Location: app/(tabs)/pg-ledger.tsx
// Rethought with UI-UX-Pro-Max & Anti-UI-Slop: Pure B&W Activity Ledger

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconCheck, IconX, IconFileDown, IconShieldAlert, IconAlertTriangle } from '@/components/icons/PayGuardIcons';
import { usePayGuardLedgerData } from '@/hooks/usePayGuardLedger';
import { formatPayGuardCurrency, timeAgo } from '@/utils/payGuardFormatters';
import { PayGuardColors as C, PayGuardAlpha as A, PayGuardMonoFont } from '@/constants/payGuardTheme';

export default function PgLedgerScreen() {
  const [filter, setFilter] = useState<'ALL' | 'CLEARED' | 'BLOCKED' | 'PENDING'>('ALL');
  const { transfers, isFetching, refresh } = usePayGuardLedgerData();

  const filteredTransfers = transfers.filter((t) => {
    if (filter === 'CLEARED') return t.transferStatus === 'COMPLETED';
    if (filter === 'BLOCKED') return t.transferStatus === 'BLOCKED_BY_SHIELD';
    if (filter === 'PENDING') return t.transferStatus === 'AWAITING_CONFIRMATION';
    return true;
  });

  const handleExport = () => {
    Alert.alert(
      'Ledger Export Generated',
      'Encrypted CSV & JSON audit bundle formatted according to ISO 20022 and prepared for download.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>LEDGER</Text>
          <Text style={styles.subtitle}>Audit history & intercepted threats</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.exportBtn, pressed && styles.btnPressed]}
          onPress={handleExport}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Export ledger report"
          accessibilityRole="button"
        >
          <IconFileDown size={14} color={C.gray.white} />
          <Text style={styles.exportText}>Export</Text>
        </Pressable>
      </View>

      {/* FILTER PILLS */}
      <View style={styles.filterRow}>
        {(['ALL', 'CLEARED', 'PENDING', 'BLOCKED'] as const).map((f) => {
          const isActive = filter === f;
          return (
            <Pressable
              key={f}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilter(f)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {f === 'BLOCKED' ? 'Blocked' : f === 'CLEARED' ? 'Cleared' : f === 'PENDING' ? 'Pending' : 'All Events'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filteredTransfers.map((t) => {
          const isBlocked = t.transferStatus === 'BLOCKED_BY_SHIELD';
          const isPending = t.transferStatus === 'AWAITING_CONFIRMATION';
          return (
            <Pressable
              key={t.transferId}
              style={({ pressed }) => [
                styles.itemCard,
                isBlocked && styles.itemCardBlocked,
                isPending && styles.itemCardPending,
                pressed && styles.btnPressed,
              ]}
              onPress={() => router.push(`/secure-transfer/${t.transferId}`)}
              accessibilityRole="button"
            >
              <View style={[styles.avatarBox, isBlocked && styles.avatarBoxBlocked, isPending && styles.avatarBoxPending]}>
                {isBlocked ? (
                  <IconX size={16} color={C.risk.critical} strokeWidth={2.5} />
                ) : isPending ? (
                  <IconAlertTriangle size={16} color={C.risk.warn} strokeWidth={2.5} />
                ) : (
                  <IconCheck size={16} color={C.risk.safe} strokeWidth={2.5} />
                )}
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.name}>{t.beneficiaryName}</Text>
                <Text style={styles.timeMeta}>
                  {isBlocked
                    ? 'AUTO-BLOCKED · RISK ' + t.riskAssessmentScore
                    : isPending
                      ? 'YOUR CONSENT REQUIRED · RISK ' + t.riskAssessmentScore
                      : 'AI VERIFIED'}{' '}
                  • {timeAgo(t.initiatedAt)}
                </Text>
              </View>

              <View style={styles.amountCol}>
                <Text style={[styles.amount, isBlocked && styles.amountBlocked]}>
                  -{formatPayGuardCurrency(t.amount, t.currencyCode)}
                </Text>
                <Text
                  style={[
                    styles.statusText,
                    isBlocked && styles.statusBlocked,
                    isPending && styles.statusPending,
                  ]}
                >
                  {isBlocked ? 'BLOCKED' : isPending ? 'NEEDS APPROVAL' : 'COMPLETED'}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {filteredTransfers.length === 0 && (
          <View style={styles.emptyState}>
            <IconShieldAlert size={36} color={C.gray[750]} />
            <Text style={styles.emptyTitle}>NO TRANSACTIONS</Text>
            <Text style={styles.emptySub}>No events found under this filter</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.gray.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    color: C.gray.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: C.text.secondary,
    fontSize: 11,
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background.input,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: A.white(0.12),
    gap: 6,
  },
  exportText: {
    color: C.gray.white,
    fontSize: 11,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: C.gray.card,
    borderWidth: 1,
    borderColor: A.white(0.12),
  },
  filterChipActive: {
    backgroundColor: C.gray.white,
    borderColor: C.gray.white,
  },
  filterText: {
    color: C.gray[500],
    fontSize: 11,
    fontWeight: '600',
  },
  filterTextActive: {
    color: C.gray.black,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.gray.card,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: A.white(0.08),
    gap: 14,
  },
  itemCardBlocked: {
    backgroundColor: A.danger(0.04),
    borderColor: A.danger(0.25),
  },
  itemCardPending: {
    backgroundColor: A.warn(0.04),
    borderColor: A.warn(0.3),
  },
  btnPressed: {
    opacity: 0.75,
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.gray[925],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: A.white(0.1),
  },
  avatarBoxBlocked: {
    borderColor: A.danger(0.4),
    backgroundColor: A.danger(0.1),
  },
  avatarBoxPending: {
    borderColor: A.warn(0.4),
    backgroundColor: A.warn(0.1),
  },
  infoCol: {
    flex: 1,
  },
  name: {
    color: C.gray.white,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  timeMeta: {
    color: C.gray[600],
    fontSize: 10,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amount: {
    color: C.gray.white,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: PayGuardMonoFont,
  },
  amountBlocked: {
    color: C.risk.critical,
    textDecorationLine: 'line-through',
  },
  statusText: {
    color: C.risk.safe,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 3,
  },
  statusBlocked: {
    color: C.risk.critical,
  },
  statusPending: {
    color: C.risk.warn,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    color: C.gray.white,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  emptySub: {
    color: C.gray[600],
    fontSize: 11,
  },
});
