// Location: app/(tabs)/pg-dashboard.tsx
// Rethought with UI-UX-Pro-Max, Anti-UI-Slop & Web Design Guidelines

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
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
import { formatPayGuardCurrency, timeAgo } from '@/utils/payGuardFormatters';
import { MOCK_TRANSFERS, MOCK_TELEMETRY } from '@/utils/mockData';

export default function PgDashboardScreen() {
  const { activeIdentity } = usePayGuardSession();
  const firstName = activeIdentity?.fullName?.split(' ')[0] ?? 'Alex';
  const recentTransfers = MOCK_TRANSFERS.slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
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
            <IconBell size={20} color="#FFFFFF" strokeWidth={2} />
            {MOCK_TELEMETRY.activeAlerts > 0 && (
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>{MOCK_TELEMETRY.activeAlerts}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* FAMPAY TITANIUM CARD */}
        <View style={styles.cardContainer}>
          <View style={styles.titaniumCard}>
            {/* Top row */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardBrand}>PAYGUARD</Text>
                <Text style={styles.cardSubtitle}>TITANIUM // AI RAIL</Text>
              </View>
              <View style={styles.cardChipGroup}>
                <IconWifi size={18} color="#888888" style={{ transform: [{ rotate: '90deg' }] }} />
                <View style={styles.emvChip}>
                  <View style={styles.emvInnerGrid} />
                </View>
              </View>
            </View>

            {/* Balance */}
            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
              <Text style={styles.balanceNumber}>$4,950.00</Text>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <Text style={styles.cardNumber}>•••• •••• •••• 4521</Text>
              <Text style={styles.cardExpiry}>08/29</Text>
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
            <IconQrCode size={22} color="#000000" strokeWidth={2.2} />
            <Text style={styles.actionTextPrimary}>Scan QR</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.btnPressed]}
            onPress={() => router.push('/secure-transfer/pg-initiate')}
            accessibilityLabel="Send payment"
            accessibilityRole="button"
          >
            <IconArrowUpRight size={22} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.actionText}>Send</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.btnPressed]}
            accessibilityLabel="Receive payment"
            accessibilityRole="button"
          >
            <IconArrowDownLeft size={22} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.actionText}>Receive</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.btnPressed]}
            accessibilityLabel="Add funds to balance"
            accessibilityRole="button"
          >
            <IconPlus size={22} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.actionText}>Add</Text>
          </Pressable>
        </View>

        {/* AI DEFENSE STATUS PILL */}
        <View style={styles.statusPill}>
          <IconShieldCheck size={18} color="#00FF66" strokeWidth={2.2} />
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
            <IconChevronRight size={14} color="#888888" />
          </Pressable>
        </View>

        <View style={styles.txListContainer}>
          {recentTransfers.map((t, idx) => {
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
                    <IconX size={16} color="#FF2A2A" strokeWidth={2.5} />
                  ) : (
                    <IconCheck size={16} color="#00FF66" strokeWidth={2.5} />
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
    backgroundColor: '#000000',
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
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  userGreeting: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0C0C0C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    backgroundColor: '#FF2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // TITANIUM CARD
  cardContainer: {
    marginBottom: 24,
  },
  titaniumCard: {
    backgroundColor: '#0C0C0C',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  cardBrand: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  cardSubtitle: {
    color: '#666666',
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
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emvInnerGrid: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  balanceSection: {
    marginBottom: 32,
  },
  balanceLabel: {
    color: '#777777',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  balanceNumber: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
  },
  cardNumber: {
    color: '#AAAAAA',
    fontSize: 13,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardExpiry: {
    color: '#888888',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextPrimary: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#0C0C0C',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionText: {
    color: '#FFFFFF',
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
    backgroundColor: '#0C0C0C',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
    marginBottom: 24,
  },
  statusText: {
    color: '#AAAAAA',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    color: '#888888',
    fontSize: 12,
  },
  txListContainer: {
    backgroundColor: '#0C0C0C',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    gap: 14,
  },
  txItemBlocked: {
    backgroundColor: 'rgba(255, 42, 42, 0.04)',
  },
  txIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  txIconBlocked: {
    borderColor: 'rgba(255, 42, 42, 0.4)',
    backgroundColor: 'rgba(255, 42, 42, 0.1)',
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  txSubtitle: {
    color: '#666666',
    fontSize: 10,
    letterSpacing: 0.4,
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  txAmountBlocked: {
    color: '#FF2A2A',
    textDecorationLine: 'line-through',
  },
  txBadge: {
    color: '#00FF66',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 3,
  },
  txBadgeBlocked: {
    color: '#FF2A2A',
  },
});
