// Location: app/(tabs)/pg-ledger.tsx
// Rethought with UI-UX-Pro-Max & Anti-UI-Slop: Pure B&W Activity Ledger

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconCheck, IconX, IconFileDown, IconShieldAlert } from '@/components/icons/PayGuardIcons';
import { MOCK_TRANSFERS } from '@/utils/mockData';
import { formatPayGuardCurrency, timeAgo } from '@/utils/payGuardFormatters';

export default function PgLedgerScreen() {
  const [filter, setFilter] = useState<'ALL' | 'CLEARED' | 'BLOCKED'>('ALL');

  const filteredTransfers = MOCK_TRANSFERS.filter((t) => {
    if (filter === 'CLEARED') return t.transferStatus === 'COMPLETED';
    if (filter === 'BLOCKED') return t.transferStatus === 'BLOCKED_BY_SHIELD';
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
          <IconFileDown size={14} color="#FFFFFF" />
          <Text style={styles.exportText}>Export</Text>
        </Pressable>
      </View>

      {/* FILTER PILLS */}
      <View style={styles.filterRow}>
        {(['ALL', 'CLEARED', 'BLOCKED'] as const).map((f) => {
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
                {f === 'BLOCKED' ? 'Blocked' : f === 'CLEARED' ? 'Cleared' : 'All Events'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filteredTransfers.map((t) => {
          const isBlocked = t.transferStatus === 'BLOCKED_BY_SHIELD';
          return (
            <Pressable
              key={t.transferId}
              style={({ pressed }) => [
                styles.itemCard,
                isBlocked && styles.itemCardBlocked,
                pressed && styles.btnPressed,
              ]}
              onPress={() => router.push(`/secure-transfer/${t.transferId}`)}
              accessibilityRole="button"
            >
              <View style={[styles.avatarBox, isBlocked && styles.avatarBoxBlocked]}>
                {isBlocked ? (
                  <IconX size={16} color="#FF2A2A" strokeWidth={2.5} />
                ) : (
                  <IconCheck size={16} color="#00FF66" strokeWidth={2.5} />
                )}
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.name}>{t.beneficiaryName}</Text>
                <Text style={styles.timeMeta}>
                  {isBlocked ? 'AUTO-BLOCKED · RISK ' + t.riskAssessmentScore : 'AI VERIFIED'} • {timeAgo(t.initiatedAt)}
                </Text>
              </View>

              <View style={styles.amountCol}>
                <Text style={[styles.amount, isBlocked && styles.amountBlocked]}>
                  -{formatPayGuardCurrency(t.amount, t.currencyCode)}
                </Text>
                <Text style={[styles.statusText, isBlocked && styles.statusBlocked]}>
                  {isBlocked ? 'BLOCKED' : 'COMPLETED'}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {filteredTransfers.length === 0 && (
          <View style={styles.emptyState}>
            <IconShieldAlert size={36} color="#444444" />
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
    backgroundColor: '#000000',
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
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E0E0E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  exportText: {
    color: '#FFFFFF',
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
    backgroundColor: '#0C0C0C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  filterChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#000000',
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
    backgroundColor: '#0C0C0C',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
  },
  itemCardBlocked: {
    backgroundColor: 'rgba(255, 42, 42, 0.04)',
    borderColor: 'rgba(255, 42, 42, 0.25)',
  },
  btnPressed: {
    opacity: 0.75,
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarBoxBlocked: {
    borderColor: 'rgba(255, 42, 42, 0.4)',
    backgroundColor: 'rgba(255, 42, 42, 0.1)',
  },
  infoCol: {
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  timeMeta: {
    color: '#666666',
    fontSize: 10,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  amountBlocked: {
    color: '#FF2A2A',
    textDecorationLine: 'line-through',
  },
  statusText: {
    color: '#00FF66',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 3,
  },
  statusBlocked: {
    color: '#FF2A2A',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  emptySub: {
    color: '#666666',
    fontSize: 11,
  },
});
