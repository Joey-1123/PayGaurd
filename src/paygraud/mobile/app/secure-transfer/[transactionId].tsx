// Location: app/secure-transfer/[transactionId].tsx
// Pure Black & White Minimalist Transaction Audit & Risk Breakdown

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
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
import { MOCK_TRANSFERS } from '@/utils/mockData';
import { formatPayGuardCurrency, formatPayGuardDate, formatPayGuardTime } from '@/utils/payGuardFormatters';

export default function TransactionDetailScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const transfer = MOCK_TRANSFERS.find((t) => t.transferId === transactionId) ?? MOCK_TRANSFERS[0];

  const isBlocked = transfer.transferStatus === 'BLOCKED_BY_SHIELD';

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
          <IconArrowLeft size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.topBarTitle}>AUDIT REPORT</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* HERO AMOUNT & STATUS */}
        <View style={styles.heroCard}>
          <View style={[styles.statusPill, isBlocked && styles.statusPillBlocked]}>
            {isBlocked ? (
              <IconXCircle size={14} color="#FF2A2A" />
            ) : (
              <IconCheckCircle size={14} color="#00FF66" />
            )}
            <Text style={[styles.statusPillText, isBlocked && { color: '#FF2A2A' }]}>
              {isBlocked ? 'BLOCKED BY AI SHIELD' : 'SETTLED & VERIFIED'}
            </Text>
          </View>

          <Text style={[styles.heroAmount, isBlocked && styles.heroAmountBlocked]}>
            -{formatPayGuardCurrency(transfer.amount, transfer.currencyCode)}
          </Text>

          <Text style={styles.beneficiaryName}>{transfer.beneficiaryName}</Text>
          <Text style={styles.timestamp}>
            {formatPayGuardDate(transfer.initiatedAt)} at {formatPayGuardTime(transfer.initiatedAt)}
          </Text>
        </View>

        {/* MULTI-MODEL AI RISK BREAKDOWN */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <IconCpu size={16} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>AI Multi-Model Consensus</Text>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Risk Score</Text>
              <Text style={[styles.scoreValue, isBlocked && { color: '#FF2A2A' }]}>
                {transfer.riskAssessmentScore}/100
              </Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>OpenAI Model</Text>
              <Text style={styles.scoreSubVal}>
                {isBlocked ? 'FLAGGED (98)' : 'CLEARED (12)'}
              </Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Anthropic Model</Text>
              <Text style={styles.scoreSubVal}>
                {isBlocked ? 'FLAGGED (95)' : 'CLEARED (15)'}
              </Text>
            </View>
          </View>

          <View style={styles.analysisBox}>
            <Text style={styles.analysisLabel}>SAGA REASONING:</Text>
            <Text style={styles.analysisText}>
              {isBlocked
                ? 'High-confidence correlation with known invoice diversion campaign. Compensating transaction automatically executed.'
                : 'Beneficiary bank route verified. Behavioral cadence matches account baseline.'}
            </Text>
          </View>
        </View>

        {/* METADATA */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Transaction ID</Text>
            <Text style={styles.metaVal}>{transfer.transferId}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaKey}>Beneficiary Account</Text>
            <Text style={styles.metaVal}>{transfer.beneficiaryAccount ?? '•••• 8831'}</Text>
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
            <IconFileDown size={16} color="#FFFFFF" />
            <Text style={styles.receiptBtnText}>Download Audit Certificate</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.disputeBtn, pressed && styles.btnPressed]}
            accessibilityRole="button"
          >
            <IconAlertTriangle size={16} color="#888888" />
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
    backgroundColor: '#000000',
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
    backgroundColor: '#0C0C0C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  btnPressed: {
    opacity: 0.75,
  },
  topBarTitle: {
    color: '#FFFFFF',
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
    backgroundColor: '#0C0C0C',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 20,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 16,
  },
  statusPillBlocked: {
    backgroundColor: 'rgba(255, 42, 42, 0.08)',
    borderColor: 'rgba(255, 42, 42, 0.3)',
  },
  statusPillText: {
    color: '#00FF66',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  heroAmount: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  heroAmountBlocked: {
    color: '#FF2A2A',
    textDecorationLine: 'line-through',
  },
  beneficiaryName: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timestamp: {
    color: '#666666',
    fontSize: 11,
  },
  breakdownCard: {
    backgroundColor: '#0C0C0C',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#666666',
    fontSize: 10,
    marginBottom: 4,
  },
  scoreValue: {
    color: '#00FF66',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  scoreSubVal: {
    color: '#DDDDDD',
    fontSize: 10,
    fontWeight: '600',
  },
  scoreDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  analysisBox: {
    backgroundColor: '#121212',
    borderLeftWidth: 3,
    borderLeftColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
  },
  analysisLabel: {
    color: '#AAAAAA',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  analysisText: {
    color: '#CCCCCC',
    fontSize: 11,
    lineHeight: 16,
  },
  metaCard: {
    backgroundColor: '#0C0C0C',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaKey: {
    color: '#666666',
    fontSize: 11,
  },
  metaVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonCol: {
    gap: 10,
  },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141414',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 8,
  },
  receiptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  disputeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0C0C0C',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  disputeBtnText: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
  },
});
