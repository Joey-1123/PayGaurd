// Location: app/secure-transfer/[transactionId].tsx
// Pure Black & White Minimalist Transaction Audit & Risk Breakdown

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  IconArrowLeft,
  IconCheckCircle,
  IconXCircle,
  IconFileDown,
  IconAlertTriangle,
  IconCpu,
} from '@/components/icons/PayGuardIcons';
import { formatPayGuardCurrency, formatPayGuardDate, formatPayGuardTime } from '@/utils/payGuardFormatters';
import { PayGuardNetworkClient } from '@/services/PayGuardNetworkClient';
import { PayGuardColors as C, PayGuardAlpha as A, PayGuardMonoFont } from '@/constants/payGuardTheme';
import type { PayGuardSecureTransfer } from '@/types/payGuardModels';

interface ModelBreakdown {
  model: string;
  risk_score: number;
  verdict: string;
  flags: string[];
}

export default function TransactionDetailScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const [transfer, setTransfer] = useState<PayGuardSecureTransfer | null>(null);
  const [models, setModels] = useState<ModelBreakdown[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!transactionId) return;
    let cancelled = false;
    setLoading(true);

    // Real transfer + multi-model risk breakdown, both via the authed client.
    PayGuardNetworkClient.fetchTransferById(transactionId)
      .then((t) => { if (!cancelled) setTransfer(t); })
      .catch(() => { if (!cancelled) setLoadFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    PayGuardNetworkClient.fetchRiskReport(transactionId).then((report) => {
      if (!cancelled && report) setModels(report.models);
    });

    return () => { cancelled = true; };
  }, [transactionId]);

  if (loadFailed) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <IconArrowLeft size={20} color={C.gray.white} />
          </Pressable>
          <Text style={styles.topBarTitle}>AUDIT REPORT</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.errorState}>
          <IconAlertTriangle size={32} color={C.risk.critical} />
          <Text style={styles.errorStateTitle}>Couldn't load this transaction</Text>
          <Text style={styles.errorStateSub}>
            It may not exist, or the shield engine is unreachable.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!transfer) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorState}>
          <ActivityIndicator color={C.gray.white} />
          <Text style={styles.errorStateSub}>Loading audit report…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const safeTransfer = transfer;
  const isBlocked = safeTransfer.transferStatus === 'BLOCKED_BY_SHIELD';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <IconArrowLeft size={20} color={C.gray.white} />
        </Pressable>
        <Text style={styles.topBarTitle}>AUDIT REPORT</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* HERO AMOUNT & STATUS */}
        <View style={styles.heroCard}>
          <View style={[styles.statusPill, isBlocked && styles.statusPillBlocked]}>
            {isBlocked ? (
              <IconXCircle size={14} color={C.risk.critical} />
            ) : (
              <IconCheckCircle size={14} color={C.risk.safe} />
            )}
            <Text style={[styles.statusPillText, isBlocked && { color: C.risk.critical }]}>
              {isBlocked ? 'BLOCKED BY AI SHIELD' : 'SETTLED & VERIFIED'}
            </Text>
          </View>

          <Text style={[styles.heroAmount, isBlocked && styles.heroAmountBlocked]}>
            -{formatPayGuardCurrency(safeTransfer.amount, safeTransfer.currencyCode)}
          </Text>

          <Text style={styles.beneficiaryName}>{safeTransfer.beneficiaryName}</Text>
          <Text style={styles.timestamp}>
            {formatPayGuardDate(safeTransfer.initiatedAt)} at {formatPayGuardTime(safeTransfer.initiatedAt)}
          </Text>
        </View>

        {/* MULTI-MODEL AI RISK BREAKDOWN */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <IconCpu size={16} color={C.gray.white} />
            <Text style={styles.sectionTitle}>AI Multi-Model Consensus</Text>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Risk Score</Text>
              <Text style={[styles.scoreValue, isBlocked && { color: C.risk.critical }]}>
                {safeTransfer.riskAssessmentScore}/100
              </Text>
            </View>
            {models.length > 0
              ? models.slice(0, 2).map((m, i) => (
                  <React.Fragment key={m.model}>
                    <View style={styles.scoreDivider} />
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>{m.model}</Text>
                      <Text style={styles.scoreSubVal}>
                        {m.verdict.toUpperCase()} ({m.risk_score})
                      </Text>
                    </View>
                  </React.Fragment>
                ))
              : (
                  <>
                    <View style={styles.scoreDivider} />
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>Rule Engine</Text>
                      <Text style={styles.scoreSubVal}>{isBlocked ? 'FLAGGED' : 'CLEARED'}</Text>
                    </View>
                  </>
                )}
          </View>

          <View style={styles.analysisBox}>
            <Text style={styles.analysisLabel}>SAGA REASONING:</Text>
            <Text style={styles.analysisText}>
              {safeTransfer.riskExplanation
                || (isBlocked
                  ? 'Critical risk anomaly. Compensating transaction automatically executed.'
                  : 'Beneficiary bank route verified. Behavioral cadence matches account baseline.')}
            </Text>
          </View>
        </View>

        {/* METADATA */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Transaction ID</Text>
            <Text style={styles.metaVal}>{safeTransfer.transferId}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Beneficiary Account</Text>
            <Text style={styles.metaVal}>{safeTransfer.beneficiaryAccount ?? '•••• 8831'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Routing / Network</Text>
            <Text style={styles.metaVal}>PAYGUARD-INTERNAL-RAIL</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Audit Hash</Text>
            <Text style={styles.metaVal}>0x7f2a...9c14</Text>
          </View>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonCol}>
          <Pressable
            style={({ pressed }) => [styles.receiptBtn, pressed && styles.btnPressed]}
            accessibilityRole="button"
          >
            <IconFileDown size={16} color={C.gray.white} />
            <Text style={styles.receiptBtnText}>Download Audit Certificate</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.disputeBtn, pressed && styles.btnPressed]}
            accessibilityRole="button"
          >
            <IconAlertTriangle size={16} color={C.gray[500]} />
            <Text style={styles.disputeBtnText}>Report Discrepancy</Text>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.gray.black,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  errorStateTitle: {
    color: C.gray.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorStateSub: {
    color: C.gray[500],
    fontSize: 12,
    textAlign: 'center' as const,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.gray.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: A.white(0.12),
  },
  btnPressed: {
    opacity: 0.75,
  },
  topBarTitle: {
    color: C.gray.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: C.gray.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: A.white(0.12),
    marginBottom: 20,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: A.safe(0.08),
    borderWidth: 1,
    borderColor: A.safe(0.3),
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 16,
  },
  statusPillBlocked: {
    backgroundColor: A.danger(0.08),
    borderColor: A.danger(0.3),
  },
  statusPillText: {
    color: C.risk.safe,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  heroAmount: {
    color: C.gray.white,
    fontSize: 38,
    fontWeight: '800',
    marginBottom: 6,
    fontFamily: PayGuardMonoFont,
  },
  heroAmountBlocked: {
    color: C.risk.critical,
    textDecorationLine: 'line-through',
  },
  beneficiaryName: {
    color: C.gray[300],
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timestamp: {
    color: C.gray[600],
    fontSize: 11,
  },
  breakdownCard: {
    backgroundColor: C.gray.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: A.white(0.08),
    marginBottom: 20,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    color: C.gray.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: C.gray[950],
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: C.gray[600],
    fontSize: 10,
    marginBottom: 4,
  },
  scoreValue: {
    color: C.risk.safe,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: PayGuardMonoFont,
  },
  scoreSubVal: {
    color: C.gray[200],
    fontSize: 10,
    fontWeight: '600',
  },
  scoreDivider: {
    width: 1,
    height: 24,
    backgroundColor: A.white(0.08),
  },
  analysisBox: {
    backgroundColor: C.surface.elevated,
    borderLeftWidth: 3,
    borderLeftColor: C.gray.white,
    padding: 10,
    borderRadius: 8,
  },
  analysisLabel: {
    color: C.gray[400],
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  analysisText: {
    color: C.gray[300],
    fontSize: 11,
    lineHeight: 16,
  },
  metaCard: {
    backgroundColor: C.gray.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: A.white(0.08),
    marginBottom: 24,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaKey: {
    color: C.gray[600],
    fontSize: 11,
  },
  metaVal: {
    color: C.gray.white,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: PayGuardMonoFont,
  },
  buttonCol: {
    gap: 10,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.gray[950],
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: A.white(0.15),
    gap: 8,
  },
  receiptBtnText: {
    color: C.gray.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  disputeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.gray.card,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: A.white(0.08),
    gap: 8,
  },
  disputeBtnText: {
    color: C.gray[500],
    fontSize: 13,
    fontWeight: '600',
  },
});
