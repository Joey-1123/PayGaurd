// Location: app/(tabs)/pg-dashboard.tsx
// Rethought with UI-UX-Pro-Max, Anti-UI-Slop & Web Design Guidelines
// All styling via payGuardTheme tokens — zero hardcoded hex values.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  IconBell,
  IconQrCode,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconPlus,
  IconShieldCheck,
  IconCheck,
  IconX,
  IconChevronRight,
  IconWifi,
} from '@/components/icons/PayGuardIcons';
import { usePayGuardSession } from '@/store/payGuardSessionStore';
import { usePayGuardLedgerData } from '@/hooks/usePayGuardLedger';
import { PayGuardNetworkClient } from '@/services/PayGuardNetworkClient';
import { formatPayGuardCurrency, timeAgo } from '@/utils/payGuardFormatters';
import type { PayGuardTelemetry } from '@/types/payGuardModels';
import { PayGuardColors as C, PayGuardAlpha as A, PayGuardMonoFont } from '@/constants/payGuardTheme';

export default function PgDashboardScreen() {
  const { activeIdentity } = usePayGuardSession();
  const { transfers, isFetching, error: ledgerError, refresh } = usePayGuardLedgerData();
  const [telemetry, setTelemetry] = useState<PayGuardTelemetry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadTelemetry = useCallback(async () => {
    try {
      const data = await PayGuardNetworkClient.fetchTelemetry();
      setTelemetry(data);
    } catch {
      // backend unreachable — surface a neutral state instead of fake numbers
      setTelemetry(null);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadTelemetry(), refresh()]);
    setRefreshing(false);
  }, [loadTelemetry, refresh]);

  useEffect(() => {
    loadTelemetry();
    const timer = setInterval(loadTelemetry, 30_000);
    return () => clearInterval(timer);
  }, [loadTelemetry]);

  const firstName = activeIdentity?.fullName?.split(' ')[0] ?? 'there';
  const recentTransfers = transfers.slice(0, 4);
  const activeAlerts = telemetry?.activeAlerts ?? 0;

  // Real settled volume from the ledger — no fabricated balance.
  const settledVolume = useMemo(() => {
    const settled = transfers.filter((t) => t.transferStatus === 'COMPLETED');
    if (settled.length === 0) return null;
    const currency = settled[0].currencyCode;
    const total = settled
      .filter((t) => t.currencyCode === currency)
      .reduce((sum, t) => sum + t.amount, 0);
    return { currency, total };
  }, [transfers]);

  // Masked identity card numbers derived from the real session.
  const maskedId = activeIdentity
    ? `PG · ${(activeIdentity.pgId || '').slice(-4).toUpperCase() || '····'}`
    : 'PG · ····';
  const memberSince = activeIdentity?.createdAt
    ? new Date(activeIdentity.createdAt).getFullYear().toString()
    : '—';

  const showSkeleton = isFetching && recentTransfers.length === 0;
  const showOffline = !isFetching && !!ledgerError && recentTransfers.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshAll} tintColor={C.gray.white} />
        }
      >
        {/* TOP APP BAR */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brandTitle}>PAYGUARD</Text>
            <Text style={styles.userGreeting}>Welcome, {firstName}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
            onPress={() => router.push('/(tabs)/pg-preferences')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="View Security Settings and Notifications"
            accessibilityRole="button"
          >
            <IconBell size={20} color={C.gray.white} strokeWidth={2} />
            {activeAlerts > 0 && (
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>{activeAlerts}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* IDENTITY CARD (real session data) */}
        <View style={styles.cardContainer}>
          <View style={styles.titaniumCard}>
            {/* Top row */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardBrand}>PAYGUARD</Text>
                <Text style={styles.cardSubtitle}>SECURE RAIL // AI DEFENSE</Text>
              </View>
              <View style={styles.cardChipGroup}>
                <IconWifi size={18} color={C.gray[500]} style={{ transform: [{ rotate: '90deg' }] }} />
                <View style={styles.emvChip}>
                  <View style={styles.emvInnerGrid} />
                </View>
              </View>
            </View>

            {/* Balance */}
            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>SETTLED VOLUME</Text>
              <Text style={styles.balanceNumber}>
                {settledVolume
                  ? formatPayGuardCurrency(settledVolume.total, settledVolume.currency)
                  : '—'}
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <Text style={styles.cardNumber}>{maskedId}</Text>
              <Text style={styles.cardExpiry}>{memberSince}</Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTIONS ROW (Minimum 44x44px touch targets) */}
        <View style={styles.actionsGrid}>
          <Pressable
            style={({ pressed }) => [styles.actionBtnPrimary, pressed && styles.btnPressed]}
            onPress={() => router.push('/(tabs)/pg-threat-center')}
            accessibilityLabel="Scan QR code to pay"
            accessibilityRole="button"
          >
            <IconQrCode size={22} color={C.gray.black} strokeWidth={2.2} />
            <Text style={styles.actionTextPrimary}>Scan QR</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.btnPressed]}
            onPress={() => router.push('/secure-transfer/pg-initiate')}
            accessibilityLabel="Send payment"
            accessibilityRole="button"
          >
            <IconArrowUpRight size={22} color={C.gray.white} strokeWidth={2} />
            <Text style={styles.actionText}>Send</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.btnPressed]}
            accessibilityLabel="Receive payment"
            accessibilityRole="button"
          >
            <IconArrowDownLeft size={22} color={C.gray.white} strokeWidth={2} />
            <Text style={styles.actionText}>Receive</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.btnPressed]}
            accessibilityLabel="Add funds to balance"
            accessibilityRole="button"
          >
            <IconPlus size={22} color={C.gray.white} strokeWidth={2} />
            <Text style={styles.actionText}>Add</Text>
          </Pressable>
        </View>

        {/* AI DEFENSE STATUS PILL */}
        <View style={styles.statusPill}>
          <IconShieldCheck size={18} color={C.risk.safe} strokeWidth={2.2} />
          <Text style={styles.statusText}>
            AI Defense Rails Active · Automated Fraud Interlock
          </Text>
        </View>

        {/* RECENT ACTIVITY SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/pg-ledger')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.viewAllRow}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <IconChevronRight size={14} color={C.gray[500]} />
          </Pressable>
        </View>

        <View style={styles.txListContainer}>
          {showSkeleton && (
            <Text style={styles.listNote}>Loading transactions…</Text>
          )}
          {showOffline && (
            <Text style={styles.listNote}>
              Can't reach the shield engine — check the backend connection.
            </Text>
          )}
          {!showSkeleton && !showOffline && recentTransfers.length === 0 && (
            <Text style={styles.listNote}>No transactions yet — send your first payment.</Text>
          )}
          {recentTransfers.map((t) => {
            const isBlocked = t.transferStatus === 'BLOCKED_BY_SHIELD';
            return (
              <Pressable
                key={t.transferId}
                style={({ pressed }) => [
                  styles.txItem,
                  isBlocked && styles.txItemBlocked,
                  pressed && styles.btnPressed,
                ]}
                onPress={() => router.push(`/secure-transfer/${t.transferId}`)}
                accessibilityRole="button"
                accessibilityLabel={`View audit report for ${t.beneficiaryName}`}
              >
                <View style={[styles.txIconWrapper, isBlocked && styles.txIconBlocked]}>
                  {isBlocked ? (
                    <IconX size={16} color={C.risk.critical} strokeWidth={2.5} />
                  ) : (
                    <IconCheck size={16} color={C.risk.safe} strokeWidth={2.5} />
                  )}
                </View>

                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{t.beneficiaryName}</Text>
                  <Text style={styles.txSubtitle}>
                    {isBlocked ? 'AUTO-BLOCKED BY AI' : 'VERIFIED TRANSACTION'} • {timeAgo(t.initiatedAt)}
                  </Text>
                </View>

                <View style={styles.txAmountCol}>
                  <Text style={[styles.txAmount, isBlocked && styles.txAmountBlocked]}>
                    -{formatPayGuardCurrency(t.amount, t.currencyCode)}
                  </Text>
                  <Text style={[styles.txBadge, isBlocked && styles.txBadgeBlocked]}>
                    {isBlocked ? 'BLOCKED' : 'CLEARED'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
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

  // TOP BAR
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    color: C.gray.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  userGreeting: {
    color: C.text.secondary,
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.gray.card,
    borderWidth: 1,
    borderColor: A.white(0.15),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.risk.critical,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: C.gray.white,
    fontSize: 9,
    fontWeight: 'bold',
  },

  // TITANIUM CARD
  cardContainer: {
    marginBottom: 24,
  },
  titaniumCard: {
    backgroundColor: C.gray.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: A.white(0.16),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  cardBrand: {
    color: C.gray.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  cardSubtitle: {
    color: C.gray[600],
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 3,
  },
  cardChipGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emvChip: {
    width: 32,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: A.white(0.25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emvInnerGrid: {
    width: 20,
    height: 1,
    backgroundColor: A.white(0.35),
  },
  balanceSection: {
    marginBottom: 32,
  },
  balanceLabel: {
    color: C.gray[700],
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  balanceNumber: {
    color: C.gray.white,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    fontFamily: PayGuardMonoFont,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: A.white(0.08),
    paddingTop: 16,
  },
  cardNumber: {
    color: C.gray[400],
    fontSize: 13,
    letterSpacing: 2,
    fontFamily: PayGuardMonoFont,
  },
  cardExpiry: {
    color: C.gray[500],
    fontSize: 12,
    fontWeight: '600',
  },

  // ACTIONS
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  actionBtnPrimary: {
    flex: 1.2,
    backgroundColor: C.gray.white,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextPrimary: {
    color: C.gray.black,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: C.gray.card,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: A.white(0.12),
  },
  actionText: {
    color: C.gray.white,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  // STATUS PILL
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.gray.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: A.white(0.08),
    gap: 10,
    marginBottom: 24,
  },
  statusText: {
    color: C.gray[400],
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  // RECENT TRANSACTIONS
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: C.gray.white,
    fontSize: 16,
    fontWeight: '700',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    color: C.gray[500],
    fontSize: 12,
  },
  txListContainer: {
    backgroundColor: C.gray.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: A.white(0.08),
    overflow: 'hidden',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: A.white(0.04),
    gap: 14,
  },
  txItemBlocked: {
    backgroundColor: A.danger(0.04),
  },
  txIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.gray[925],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: A.white(0.1),
  },
  txIconBlocked: {
    borderColor: A.danger(0.4),
    backgroundColor: A.danger(0.1),
  },
  txInfo: {
    flex: 1,
  },
  listNote: {
    color: C.gray[600],
    fontSize: 12,
    textAlign: 'center' as const,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  txTitle: {
    color: C.gray.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  txSubtitle: {
    color: C.gray[600],
    fontSize: 10,
    letterSpacing: 0.4,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    color: C.gray.white,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: PayGuardMonoFont,
  },
  txAmountBlocked: {
    color: C.risk.critical,
    textDecorationLine: 'line-through',
  },
  txBadge: {
    color: C.risk.safe,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 3,
  },
  txBadgeBlocked: {
    color: C.risk.critical,
  },
});
