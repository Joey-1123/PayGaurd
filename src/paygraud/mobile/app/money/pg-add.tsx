// Location: app/money/pg-add.tsx
// Add — honest explanation: PayGuard has no wallet/top-up rail.
// "Settled volume" grows from shielded payments that clear the AI audit.

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  IconArrowLeft,
  IconPlus,
  IconArrowUpRight,
  IconReceipt,
  IconShieldAlert,
  IconChevronRight,
} from '@/components/icons/PayGuardIcons';
import { PayGuardColors as C, PayGuardAlpha as A } from '@/constants/payGuardTheme';

export default function PgAddFundsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <IconArrowLeft size={20} color={C.gray.white} />
          </Pressable>
          <Text style={styles.topBarTitle}>ADD FUNDS</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.badge}>
            <IconPlus size={18} color={C.gray.black} />
          </View>
          <Text style={styles.title}>No wallet. No top-up rail.</Text>
          <Text style={styles.para}>
            PayGuard is a shield engine, not a bank — there is no balance to top up. The card on
            your dashboard shows settled volume, which grows each time a payment you send clears
            the AI audit and settles.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>HOW TO GROW IT</Text>

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.btnPressed]}
          onPress={() => router.push('/secure-transfer/pg-initiate')}
          accessibilityLabel="Send a shielded payment"
          accessibilityRole="button"
        >
          <View style={styles.rowIcon}>
            <IconArrowUpRight size={16} color={C.gray.white} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Send a shielded payment</Text>
            <Text style={styles.rowSub}>Initiate a transfer — settles when approved</Text>
          </View>
          <IconChevronRight size={14} color={C.gray[600]} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.btnPressed]}
          onPress={() => router.push('/(tabs)/pg-ledger')}
          accessibilityLabel="Review the ledger"
          accessibilityRole="button"
        >
          <View style={styles.rowIcon}>
            <IconReceipt size={16} color={C.gray.white} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Review the ledger</Text>
            <Text style={styles.rowSub}>Track settled, pending and blocked payments</Text>
          </View>
          <IconChevronRight size={14} color={C.gray[600]} />
        </Pressable>

        <View style={styles.noteCard}>
          <IconShieldAlert size={16} color={C.risk.warn} />
          <Text style={styles.noteText}>
            Receiving? Share your PayGuard ID from the Receive action — incoming funds are
            screened by the same AI shield.
          </Text>
        </View>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.gray.card,
    borderWidth: 1,
    borderColor: A.white(0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    color: C.gray.white,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  heroCard: {
    backgroundColor: C.gray.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: A.white(0.16),
    marginBottom: 28,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.gray.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: C.gray.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  para: {
    color: C.gray[400],
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    color: C.gray[600],
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.gray.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: A.white(0.08),
    marginBottom: 8,
    gap: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.gray[975],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: A.white(0.12),
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    color: C.gray.white,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowSub: {
    color: C.gray[600],
    fontSize: 10,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: C.gray.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: A.white(0.08),
    marginTop: 12,
  },
  noteText: {
    flex: 1,
    color: C.gray[400],
    fontSize: 11,
    lineHeight: 16,
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});