// Location: app/money/pg-receive.tsx
// Receive — share your PayGuard ID so senders can route funds through the shield.

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  IconArrowLeft,
  IconArrowDownLeft,
  IconCheck,
  IconShieldCheck,
} from '@/components/icons/PayGuardIcons';
import { usePayGuardSession } from '@/store/payGuardSessionStore';
import { PayGuardColors as C, PayGuardAlpha as A, PayGuardMonoFont } from '@/constants/payGuardTheme';

export default function PgReceiveScreen() {
  const { activeIdentity } = usePayGuardSession();
  const pgId = activeIdentity?.pgId ?? '—';
  const fullName = activeIdentity?.fullName ?? 'PayGuard User';
  const email = activeIdentity?.emailAddress ?? '—';

  const shareId = async () => {
    try {
      await Share.share({
        title: 'Receive via PayGuard',
        message: `Pay me via the PayGuard Shield Engine\n\nName: ${fullName}\nPayGuard ID: ${pgId}`,
      });
    } catch {
      // share dismissed / unsupported (web) — the ID box is selectable for copy
    }
  };

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
          <Text style={styles.topBarTitle}>RECEIVE</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardIconRow}>
            <View style={styles.badge}>
              <IconArrowDownLeft size={18} color={C.gray.black} />
            </View>
            <Text style={styles.cardHint}>SHARE YOUR PAYGUARD ID</Text>
          </View>

          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{email}</Text>

          <Pressable
            style={({ pressed }) => [styles.idBox, pressed && styles.btnPressed]}
            onPress={shareId}
            accessibilityLabel="Share your PayGuard ID"
            accessibilityRole="button"
          >
            <Text style={styles.idLabel}>PAYGUARD ID</Text>
            <Text style={styles.idValue} selectable>
              {pgId}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
            onPress={shareId}
            accessibilityLabel="Share PayGuard ID"
            accessibilityRole="button"
          >
            <IconCheck size={16} color={C.gray.black} />
            <Text style={styles.primaryText}>SHARE PAYGUARD ID</Text>
          </Pressable>
        </View>

        <View style={styles.noteCard}>
          <IconShieldCheck size={16} color={C.risk.safe} />
          <Text style={styles.noteText}>
            Incoming payments are matched by your PayGuard ID and pass through the same AI
            shield — the sender is screened before funds reach you.
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
  card: {
    backgroundColor: C.gray.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: A.white(0.16),
    marginBottom: 16,
  },
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.gray.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHint: {
    color: C.gray[600],
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  name: {
    color: C.gray.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  email: {
    color: C.text.secondary,
    fontSize: 12,
    marginBottom: 20,
  },
  idBox: {
    backgroundColor: C.gray[975],
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: A.white(0.1),
    marginBottom: 16,
  },
  idLabel: {
    color: C.gray[600],
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  idValue: {
    color: C.gray.white,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: PayGuardMonoFont,
    letterSpacing: 1.5,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.gray.white,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  primaryText: {
    color: C.gray.black,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
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