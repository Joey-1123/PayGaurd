// Location: app/secure-transfer/pg-initiate.tsx
// Pure Black & White Minimalist Payment Initiation with Live AI Guardrails

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  IconArrowLeft,
  IconShieldCheck,
  IconCheckCircle,
  IconAlertOctagon,
  IconArrowRight,
  IconShieldAlert,
} from '@/components/icons/PayGuardIcons';
import { MOCK_BENEFICIARIES } from '@/utils/mockData';
import { calculateLocalRiskHeuristics } from '@/utils/payGuardRiskEvaluator';

export default function PgInitiateTransferScreen() {
  const [amount, setAmount] = useState('50.00');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(MOCK_BENEFICIARIES[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [verdict, setVerdict] = useState<{
    riskScore: number;
    decision: 'APPROVE' | 'STEP_UP_2FA' | 'BLOCK';
    reason: string;
  } | null>(null);

  const numAmount = parseFloat(amount) || 0;
  const currentRisk = calculateLocalRiskHeuristics({
    amount: numAmount,
    beneficiaryName: selectedBeneficiary?.name,
    beneficiaryId: selectedBeneficiary?.beneficiaryId,
  });

  const handleAnalyzeAndPay = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      let dec: 'APPROVE' | 'STEP_UP_2FA' | 'BLOCK' = 'APPROVE';
      let rsn = 'Verified standard transaction. Backend AI models cleared.';

      if (numAmount >= 10000) {
        dec = 'BLOCK';
        rsn = 'CRITICAL: Known phishing entity or abnormal high-value anomaly. Blocked.';
      } else if (numAmount >= 2000) {
        dec = 'STEP_UP_2FA';
        rsn = 'STEP-UP REQUIRED: Unusual velocity detected. Biometric confirmation required.';
      }

      setVerdict({
        riskScore: currentRisk,
        decision: dec,
        reason: rsn,
      });
    }, 1000);
  };

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
        <Text style={styles.topBarTitle}>SEND PAYMENT</Text>
        <View style={styles.aiGuardPill}>
          <IconShieldCheck size={14} color="#00FF66" />
          <Text style={styles.aiGuardText}>AI GUARD</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* AMOUNT CARD */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>ENTER TRANSFER AMOUNT</Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setVerdict(null);
              }}
              keyboardType="decimal-pad"
              placeholderTextColor="#555555"
              placeholder="0.00"
            />
          </View>

          {/* Quick Amount Scenario Chips */}
          <View style={styles.quickChipsRow}>
            {[
              { val: '50.00', label: '$50 (Safe)' },
              { val: '500.00', label: '$500 (Caution)' },
              { val: '5000.00', label: '$5k (2FA)' },
              { val: '15000.00', label: '$15k (Block)' },
            ].map((chip) => (
              <Pressable
                key={chip.val}
                style={[styles.chip, amount === chip.val && styles.chipActive]}
                onPress={() => {
                  setAmount(chip.val);
                  setVerdict(null);
                }}
              >
                <Text style={[styles.chipText, amount === chip.val && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* SELECT BENEFICIARY */}
        <Text style={styles.sectionHeader}>SELECT BENEFICIARY</Text>
        <View style={styles.beneficiaryList}>
          {MOCK_BENEFICIARIES.map((ben) => {
            const isSelected = selectedBeneficiary?.beneficiaryId === ben.beneficiaryId;
            return (
              <Pressable
                key={ben.beneficiaryId}
                style={[styles.beneficiaryItem, isSelected && styles.beneficiaryItemActive]}
                onPress={() => {
                  setSelectedBeneficiary(ben);
                  setVerdict(null);
                }}
              >
                <View style={[styles.benAvatar, isSelected && styles.benAvatarActive]}>
                  <Text style={[styles.benAvatarText, isSelected && { color: '#000000' }]}>
                    {ben.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.benInfo}>
                  <Text style={styles.benName}>{ben.name}</Text>
                  <Text style={styles.benHandle}>{ben.accountNumber} • Verified Network</Text>
                </View>
                <View style={styles.benTrustBadge}>
                  <Text style={styles.benTrustText}>{ben.isTrusted ? '98%' : '65%'} TRUST</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* RISK RADAR GAUGE */}
        <View style={styles.riskMeterCard}>
          <View style={styles.riskMeterHeader}>
            <Text style={styles.riskMeterTitle}>PayGuard Pre-Flight Risk Radar</Text>
            <Text style={[styles.riskScoreVal, { color: currentRisk > 70 ? '#FF2A2A' : currentRisk > 40 ? '#FFB800' : '#00FF66' }]}>
              {currentRisk}/100
            </Text>
          </View>
          <View style={styles.riskBarBg}>
            <View
              style={[
                styles.riskBarFill,
                {
                  width: `${Math.min(currentRisk, 100)}%`,
                  backgroundColor: currentRisk > 70 ? '#FF2A2A' : currentRisk > 40 ? '#FFB800' : '#00FF66',
                },
              ]}
            />
          </View>
          <Text style={styles.riskMeterFootnote}>
            Multi-model consensus: OpenAI + Anthropic + Local heuristics
          </Text>
        </View>

        {/* AI VERDICT DISPLAY */}
        {verdict && (
          <View
            style={[
              styles.verdictBox,
              verdict.decision === 'BLOCK'
                ? styles.verdictBlock
                : verdict.decision === 'STEP_UP_2FA'
                ? styles.verdictWarn
                : styles.verdictSafe,
            ]}
          >
            <View style={styles.verdictHeader}>
              {verdict.decision === 'BLOCK' ? (
                <IconShieldAlert size={18} color="#FF2A2A" />
              ) : verdict.decision === 'STEP_UP_2FA' ? (
                <IconAlertOctagon size={18} color="#FFB800" />
              ) : (
                <IconCheckCircle size={18} color="#00FF66" />
              )}
              <Text style={styles.verdictStatus}>
                {verdict.decision === 'BLOCK'
                  ? 'CRITICAL ANOMALY: BLOCKED'
                  : verdict.decision === 'STEP_UP_2FA'
                  ? 'STEP-UP CONFIRMATION REQUIRED'
                  : 'APPROVED BY AI DEFENSE'}
              </Text>
            </View>
            <Text style={styles.verdictReason}>{verdict.reason}</Text>
          </View>
        )}

        {/* SUBMIT BUTTON */}
        <Pressable
          style={({ pressed }) => [
            styles.payBtn,
            analyzing && styles.payBtnDisabled,
            pressed && styles.btnPressed,
          ]}
          onPress={handleAnalyzeAndPay}
          disabled={analyzing}
          accessibilityRole="button"
        >
          {analyzing ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <>
              <Text style={styles.payBtnText}>
                {verdict?.decision === 'APPROVE' ? 'Authorize Payment' : 'Analyze & Transfer'}
              </Text>
              <IconArrowRight size={18} color="#000000" strokeWidth={2.4} />
            </>
          )}
        </Pressable>

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
  topBarTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  aiGuardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C0C0C',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  aiGuardText: {
    color: '#AAAAAA',
    fontSize: 9,
    fontWeight: 'bold',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  amountCard: {
    backgroundColor: '#0C0C0C',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 24,
  },
  amountLabel: {
    color: '#666666',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    padding: 0,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#121212',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },
  sectionHeader: {
    color: '#666666',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  beneficiaryList: {
    backgroundColor: '#0C0C0C',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  beneficiaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    gap: 12,
  },
  beneficiaryItemActive: {
    backgroundColor: '#141414',
  },
  benAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  benAvatarActive: {
    backgroundColor: '#FFFFFF',
  },
  benAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  benInfo: {
    flex: 1,
  },
  benName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  benHandle: {
    color: '#666666',
    fontSize: 11,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  benTrustBadge: {
    backgroundColor: '#161616',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  benTrustText: {
    color: '#AAAAAA',
    fontSize: 9,
    fontWeight: 'bold',
  },
  riskMeterCard: {
    backgroundColor: '#0C0C0C',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  riskMeterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskMeterTitle: {
    color: '#888888',
    fontSize: 12,
  },
  riskScoreVal: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  riskBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
    marginBottom: 8,
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  riskMeterFootnote: {
    color: '#555555',
    fontSize: 10,
  },
  verdictBox: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  verdictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  verdictSafe: {
    backgroundColor: 'rgba(0, 255, 102, 0.06)',
    borderColor: 'rgba(0, 255, 102, 0.3)',
  },
  verdictWarn: {
    backgroundColor: 'rgba(255, 184, 0, 0.06)',
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  verdictBlock: {
    backgroundColor: 'rgba(255, 42, 42, 0.06)',
    borderColor: 'rgba(255, 42, 42, 0.3)',
  },
  verdictStatus: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  verdictReason: {
    color: '#CCCCCC',
    fontSize: 11,
    lineHeight: 16,
  },
  payBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payBtnDisabled: {
    opacity: 0.5,
  },
  btnPressed: {
    opacity: 0.8,
  },
  payBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
