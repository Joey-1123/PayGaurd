// Location: app/secure-transfer/pg-case-study.tsx
// Guided live case study — "Invoice phishing" end-to-end, all real API calls.

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  IconArrowLeft,
  IconZap,
  IconShieldCheck,
  IconShieldAlert,
  IconRadio,
} from '@/components/icons/PayGuardIcons';
import { PayGuardColors as C, PayGuardAlpha as A, PayGuardMonoFont } from '@/constants/payGuardTheme';

const SAMPLE_SMS = {
  sender: 'VM-HDFCBK',
  body: 'URGENT: Your HDFC account will be blocked! Click http://hdfc-verify.link/pay to update KYC immediately.',
};

const SAMPLE_QR = {
  name: 'Invoice Desk LLC',
  account:
    'upi://pay?pa=fake.invoice.desk@okhdfcbank&pn=Invoice%20Desk%20LLC&am=75000&tn=Rent%20for%20September',
};

export default function PgCaseStudyScreen() {
  const [copying, setCopying] = useState(false);

  const copySmsToClipboard = async () => {
    setCopying(true);
    try {
      await Clipboard.setStringAsync(`${SAMPLE_SMS.sender}: ${SAMPLE_SMS.body}`);
      router.push('/secure-transfer/pg-signal-capture');
    } finally {
      setCopying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [styles.topBtn, pressed && styles.btnPressed]}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <IconArrowLeft size={20} color={C.gray.white} />
        </Pressable>
        <Text style={styles.topTitle}>CASE STUDY</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>LIVE DEMO · INVOICE PHISHING</Text>
        <Text style={styles.title}>Stop a fake "rent" payment before it moves.</Text>
        <Text style={styles.subtitle}>
          PayGuard intercepts the scam in two real ways — an SMS with a phishing link, and a
          malicious UPI QR. Every verdict below comes from the live backend pipeline; nothing is
          simulated.
        </Text>

        <View style={styles.stepCard}>
          <View style={styles.stepHead}>
            <Text style={styles.stepNum}>01</Text>
            <Text style={styles.stepTitle}>INGEST THE PHISHING SMS</Text>
          </View>
          <Text style={styles.stepBody}>
            The scammer texts "URGENT — verify your KYC" with a phishing link. The case study ships
            ships the exact payload to your clipboard, then opens Signal Lab which auto-ingests it
            and runs it through the multi-model scorer.
          </Text>
          <View style={styles.payloadBox}>
            <Text style={styles.payloadKey}>VM-HDFCBK</Text>
            <Text style={styles.payloadBody} numberOfLines={3}>
              {SAMPLE_SMS.body}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.btnPressed]}
            onPress={copySmsToClipboard}
            disabled={copying}
          >
            {copying ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <>
                <IconRadio size={16} color="#000000" />
                <Text style={styles.actionBtnText}>Copy SMS → Open Signal Lab</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepHead}>
            <Text style={styles.stepNum}>02</Text>
            <Text style={styles.stepTitle}>SCAN THE MALICIOUS QR</Text>
          </View>
          <Text style={styles.stepBody}>
            A QR on the fake invoice asks for ₹75,000 "rent". Scan it in Shield Center — the
            backend flags it critical and permanently blacklists the payee UPI ID as a real,
            stored recipient record.
          </Text>
          <View style={styles.payloadBox}>
            <Text style={styles.payloadKey}>Invoice Desk LLC</Text>
            <Text style={styles.payloadBody} numberOfLines={2}>
              {SAMPLE_QR.account}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.btnPressed]}
            onPress={() => router.push('/(tabs)/pg-threat-center')}
          >
            <IconShieldCheck size={16} color="#000000" />
            <Text style={styles.actionBtnText}>Open QR Scanner</Text>
          </Pressable>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepHead}>
            <Text style={styles.stepNum}>03</Text>
            <Text style={styles.stepTitle}>ATTEMPT THE PAYMENT</Text>
          </View>
          <Text style={styles.stepBody}>
            Tap "Demonstrate Payment Attempt". PayGuard runs the real payment saga — the payee is
            still blacklisted from the scan, so the transfer is blocked before any authorize call
            ever reaches the gateway.
          </Text>
          <View style={styles.flowBox}>
            <IconZap size={14} color={C.risk.critical} />
            <Text style={styles.flowText}>
              Clipboard/QR signal → backend scorer → blacklist recipient → saga blocks before
              authorize
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.btnPressed]}
            onPress={() => router.push('/(tabs)/pg-threat-center')}
          >
            <IconZap size={16} color="#000000" />
            <Text style={styles.actionBtnText}>Run Live Attempt</Text>
          </Pressable>
        </View>

        <View style={styles.defenseRow}>
          <IconShieldAlert size={16} color={C.risk.critical} />
          <Text style={styles.defenseText}>
            Every gate in this demo is wired to the real FastAPI pipeline visible in the Threat
            Center alert feed.
          </Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.gray.black },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.gray[900],
  },
  topBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  topTitle: { color: C.gray.white, fontSize: 13, fontWeight: 'bold', letterSpacing: 1.5 },
  scroll: { paddingHorizontal: 20, paddingTop: 24 },
  eyebrow: { color: C.risk.critical, fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  title: { color: C.gray.white, fontSize: 22, fontWeight: '900', marginTop: 6, lineHeight: 28 },
  subtitle: { color: C.gray[500], fontSize: 12, lineHeight: 18, marginTop: 8, marginBottom: 24 },
  stepCard: {
    backgroundColor: C.gray.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: A.white(0.1),
    padding: 18,
    marginBottom: 16,
  },
  stepHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  stepNum: {
    color: C.risk.critical,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: PayGuardMonoFont,
  },
  stepTitle: { color: C.gray.white, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  stepBody: { color: C.gray[400], fontSize: 12, lineHeight: 18 },
  payloadBox: {
    backgroundColor: C.gray[950],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: A.white(0.08),
    padding: 12,
    marginTop: 12,
    marginBottom: 14,
  },
  payloadKey: { color: C.risk.critical, fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  payloadBody: { color: C.gray[300], fontSize: 11, lineHeight: 16, fontFamily: PayGuardMonoFont },
  actionBtn: {
    flexDirection: 'row',
    backgroundColor: C.gray.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnText: { color: C.gray.black, fontSize: 13, fontWeight: 'bold' },
  flowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: A.danger(0.12),
    borderWidth: 1,
    borderColor: A.danger(0.3),
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    marginBottom: 14,
  },
  flowText: { color: C.gray[200], fontSize: 11, lineHeight: 16, flex: 1 },
  defenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.gray[900],
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  defenseText: { color: C.gray[500], fontSize: 11, lineHeight: 16, flex: 1 },
  btnPressed: { opacity: 0.75 },
});