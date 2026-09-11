// Location: app/secure-transfer/pg-signal-capture.tsx
// SMS Signal Capture — paste or preset demo SMS → backend verdict

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  IconArrowLeft,
  IconShieldCheck,
  IconShieldAlert,
  IconCheckCircle,
  IconXCircle,
  IconAlertOctagon,
  IconZap,
} from '@/components/icons/PayGuardIcons';
import { PayGuardNetworkClient } from '@/services/PayGuardNetworkClient';
import { PayGuardColors as C } from '@/constants/payGuardTheme';
import type { PayGuardInboundSignal } from '@/types/payGuardModels';

const PRESETS: { label: string; sender: string; body: string }[] = [
  {
    label: 'Phishing Link',
    sender: 'VM-HDFCBK',
    body: 'URGENT: Your HDFC account will be blocked! Click http://hdfc-verify.link/pay to update KYC immediately.',
  },
  {
    label: 'OTP Scam',
    sender: 'VK-ICICIB',
    body: 'Dear Customer, OTP for transaction is 482910. Do NOT share with anyone. If you did not request this, call 1800-266-0000.',
  },
  {
    label: 'UPI Scam',
    sender: 'JX-PAYTMB',
    body: 'You have received Rs.2,50,000 from Rajesh Kumar. To accept, send Rs.1 as verification to UPI ID rajesh.kumar@ybl.',
  },
  {
    label: 'Unknown Sender',
    sender: '+919876543210',
    body: 'Hey, I changed my number. Save this as Priya. Also can you send 5000 to this UPI? urgent.',
  },
];

function getVerdictColor(score: number): string {
  if (score <= 30) return C.risk.safe;
  if (score <= 60) return C.risk.warn;
  return C.risk.critical;
}

function getVerdictLabel(score: number): string {
  if (score <= 30) return 'CLEARED';
  if (score <= 60) return 'CAUTION';
  if (score <= 85) return 'REJECT';
  return 'CRITICAL';
}

export default function PgSignalCaptureScreen() {
  const [sender, setSender] = useState('');
  const [body, setBody] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PayGuardInboundSignal | null>(null);
  const [recentSignals, setRecentSignals] = useState<PayGuardInboundSignal[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    PayGuardNetworkClient.fetchSignals()
      .then((sigs) => setRecentSignals(sigs.slice(0, 10)))
      .catch(() => {})
      .finally(() => setLoadingRecent(false));
  }, []);

  const handlePreset = (preset: (typeof PRESETS)[number]) => {
    setSender(preset.sender);
    setBody(preset.body);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!body.trim()) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const signal = await PayGuardNetworkClient.captureSignal({
        sender: sender.trim() || 'UNKNOWN',
        body: body.trim(),
        channel: 'sms',
      });
      setResult(signal);
      setRecentSignals((prev) => [signal, ...prev].slice(0, 10));
    } catch {
      setResult(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const score = result?.riskScore ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <IconArrowLeft size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.topBarTitle}>SIGNAL LAB</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* DEMO PRESETS */}
        <Text style={styles.sectionLabel}>DEMO PRESETS</Text>
        <View style={styles.presetGrid}>
          {PRESETS.map((p) => (
            <Pressable
              key={p.label}
              style={({ pressed }) => [styles.presetBtn, pressed && styles.btnPressed]}
              onPress={() => handlePreset(p)}
            >
              <Text style={styles.presetText}>{p.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* INPUT */}
        <Text style={styles.sectionLabel}>SMS BODY</Text>
        <TextInput
          style={styles.input}
          value={sender}
          onChangeText={setSender}
          placeholder="Sender (e.g. VM-HDFCBK)"
          placeholderTextColor={C.gray[750]}
          autoCapitalize="characters"
        />
        <TextInput
          style={[styles.input, styles.bodyInput]}
          value={body}
          onChangeText={setBody}
          placeholder="Paste or type SMS content..."
          placeholderTextColor={C.gray[750]}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <Pressable
          style={({ pressed }) => [styles.analyzeBtn, pressed && styles.btnPressed]}
          onPress={handleAnalyze}
          disabled={analyzing || !body.trim()}
        >
          {analyzing ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <>
              <IconZap size={16} color="#000000" />
              <Text style={styles.analyzeBtnText}>Analyze Signal</Text>
            </>
          )}
        </Pressable>

        {/* VERDICT CARD */}
        {result && (
          <View style={[styles.verdictCard, { borderColor: getVerdictColor(score) }]}>
            <View style={styles.verdictHeader}>
              {score <= 30 ? (
                <IconCheckCircle size={20} color={C.risk.safe} />
              ) : score <= 60 ? (
                <IconAlertOctagon size={20} color={C.risk.warn} />
              ) : (
                <IconXCircle size={20} color={C.risk.critical} />
              )}
              <Text style={[styles.verdictTitle, { color: getVerdictColor(score) }]}>
                {getVerdictLabel(score)}
              </Text>
              <Text style={styles.verdictScore}>{score}/100</Text>
            </View>

            <Text style={styles.verdictSender}>From: {result.sender}</Text>

            {result.flags.length > 0 && (
              <View style={styles.flagsRow}>
                {result.flags.map((f) => (
                  <View key={f} style={styles.flagPill}>
                    <Text style={styles.flagText}>{f}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.verdictReason}>
              {score <= 30
                ? 'Legitimate OTP — no threat signals detected. Ignored.'
                : score <= 60
                  ? 'Uncertain sender reputation. Marked for monitoring.'
                  : 'Phishing / scam signals detected. Alert raised and relayed.'}
            </Text>
          </View>
        )}

        {/* RECENT SIGNALS */}
        <Text style={[styles.sectionLabel, { marginTop: 28 }]}>RECENT SIGNALS</Text>
        {loadingRecent ? (
          <ActivityIndicator color={C.gray[500]} style={{ marginTop: 16 }} />
        ) : recentSignals.length === 0 ? (
          <Text style={styles.emptyText}>No signals captured yet.</Text>
        ) : (
          recentSignals.map((sig) => (
            <View key={sig.signalId} style={styles.signalRow}>
              <View style={styles.signalHeader}>
                <Text style={styles.signalSender}>{sig.sender}</Text>
                <Text style={[styles.signalScore, { color: getVerdictColor(sig.riskScore) }]}>
                  {sig.riskScore}/100
                </Text>
              </View>
              <Text style={styles.signalBody} numberOfLines={2}>{sig.body}</Text>
              {sig.flags.length > 0 && (
                <View style={styles.flagsRow}>
                  {sig.flags.map((f) => (
                    <View key={f} style={styles.flagPill}>
                      <Text style={styles.flagText}>{f}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}

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
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  topBarTitle: { color: C.gray.white, fontSize: 13, fontWeight: 'bold', letterSpacing: 1.5 },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  sectionLabel: { color: C.gray[600], fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 10 },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  presetBtn: {
    borderWidth: 1,
    borderColor: C.gray[800],
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  presetText: { color: C.gray.white, fontSize: 11, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: C.gray[800],
    borderRadius: 10,
    padding: 12,
    color: C.gray.white,
    fontSize: 13,
    marginBottom: 10,
  },
  bodyInput: { height: 120 },
  analyzeBtn: {
    flexDirection: 'row',
    backgroundColor: C.gray.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  analyzeBtnText: { color: C.gray.black, fontSize: 14, fontWeight: 'bold' },
  verdictCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  verdictHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  verdictTitle: { fontSize: 16, fontWeight: 'bold' },
  verdictScore: { color: C.gray.white, fontSize: 13, fontWeight: 'bold', marginLeft: 'auto' },
  verdictSender: { color: C.gray[500], fontSize: 11, marginBottom: 8 },
  flagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  flagPill: { backgroundColor: C.gray[900], borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  flagText: { color: C.gray[500], fontSize: 10, fontWeight: '600' },
  verdictReason: { color: C.gray[300], fontSize: 12, lineHeight: 18 },
  emptyText: { color: C.gray[600], fontSize: 12, textAlign: 'center', marginTop: 16 },
  signalRow: {
    borderWidth: 1,
    borderColor: C.gray[900],
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  signalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  signalSender: { color: C.gray.white, fontSize: 11, fontWeight: 'bold' },
  signalScore: { fontSize: 11, fontWeight: 'bold' },
  signalBody: { color: C.gray[500], fontSize: 11, lineHeight: 16 },
  btnPressed: { opacity: 0.7 },
});
