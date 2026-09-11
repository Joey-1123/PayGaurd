// Location: app/secure-transfer/pg-initiate.tsx
// Pure Black & White Minimalist Payment Initiation with Live AI Guardrails

import React, { useState, useEffect, useCallback } from 'react';
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
import { calculateLocalRiskHeuristics } from '@/utils/payGuardRiskEvaluator';
import { PayGuardNetworkClient } from '@/services/PayGuardNetworkClient';
import { PayGuardColors as C, PayGuardAlpha as A, PayGuardMonoFont } from '@/constants/payGuardTheme';
import type { PayGuardBeneficiary } from '@/types/payGuardModels';

export default function PgInitiateTransferScreen() {
  const [amount, setAmount] = useState('8000');
  const [beneficiaries, setBeneficiaries] = useState<PayGuardBeneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<PayGuardBeneficiary | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pendingConfirmTransferId, setPendingConfirmTransferId] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<{
    riskScore: number;
    decision: 'APPROVE' | 'STEP_UP_2FA' | 'BLOCK';
    reason: string;
  } | null>(null);

  // Load the real beneficiary list from the backend (falls back to mocks).
  useEffect(() => {
    PayGuardNetworkClient.fetchBeneficiaries()
      .then((bens) => {
        if (bens.length) {
          setBeneficiaries(bens);
          setSelectedBeneficiary(bens[0]);
        }
      })
      .catch(() => {
        // backend unreachable — beneficiary list stays empty (no mock injection)
      });
  }, []);

  const numAmount = parseFloat(amount) || 0;
  const currentRisk = calculateLocalRiskHeuristics({
    amount: numAmount,
    beneficiaryName: selectedBeneficiary?.name,
    beneficiaryId: selectedBeneficiary?.beneficiaryId,
  });

  const handleAnalyzeAndPay = useCallback(async () => {
    if (!numAmount) return;
    setAnalyzing(true);
    setVerdict(null);
    setPendingConfirmTransferId(null);
    try {
      // Real saga: POST /payments → POST /payments/:id/analyze.
      // LOW → completed · MEDIUM/HIGH → awaiting_confirmation · CRITICAL → blocked.
      const { transfer, risk } = await PayGuardNetworkClient.initiateSecureTransfer({
        beneficiaryId: selectedBeneficiary?.beneficiaryId ?? '',
        beneficiaryName: selectedBeneficiary?.name ?? '',
        amount: numAmount,
        currencyCode: 'INR',
        note: `Transfer to ${selectedBeneficiary?.name ?? 'beneficiary'}`,
      });

      if (risk.decision === 'BLOCK' || transfer.transferStatus === 'BLOCKED_BY_SHIELD') {
        setVerdict({
          riskScore: risk.riskScore,
          decision: 'BLOCK',
          reason: risk.explanation || 'Critical risk anomaly — blocked before authorize was ever called.',
        });
      } else if (transfer.transferStatus === 'COMPLETED' || risk.decision === 'APPROVE') {
        setVerdict({
          riskScore: risk.riskScore,
          decision: 'APPROVE',
          reason: risk.explanation || 'Payment settled. Authorize + capture succeeded automatically.',
        });
      } else {
        setPendingConfirmTransferId(transfer.transferId);
        setVerdict({
          riskScore: risk.riskScore,
          decision: 'STEP_UP_2FA',
          reason: risk.explanation || 'Human-in-the-loop: biometric confirmation required to settle.',
        });
      }
    } catch {
      setVerdict({
        riskScore: currentRisk,
        decision: 'BLOCK',
        reason: 'Shield engine unreachable — payment blocked for your protection.',
      });
    } finally {
      setAnalyzing(false);
    }
  }, [numAmount, selectedBeneficiary, currentRisk]);

  const handleConfirmAndSettle = useCallback(async () => {
    if (!pendingConfirmTransferId) return;
    setAnalyzing(true);
    try {
      await PayGuardNetworkClient.confirmTransfer(pendingConfirmTransferId);
      setVerdict({
        riskScore: verdict?.riskScore ?? 0,
        decision: 'APPROVE',
        reason: 'Confirmed by user. Payment captured and settled.',
      });
    } catch {
      setVerdict({
        riskScore: verdict?.riskScore ?? 0,
        decision: 'BLOCK',
        reason: 'Confirmation failed — transfer blocked.',
      });
    } finally {
      setPendingConfirmTransferId(null);
      setAnalyzing(false);
    }
  }, [pendingConfirmTransferId, verdict]);

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
        <Text style={styles.topBarTitle}>SEND PAYMENT</Text>
        <View style={styles.aiGuardPill}>
          <IconShieldCheck size={14} color={C.risk.safe} />
          <Text style={styles.aiGuardText}>AI GUARD</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* AMOUNT CARD */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>ENTER TRANSFER AMOUNT</Text>
          <View style={styles.amountInputRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setVerdict(null);
              }}
              keyboardType="decimal-pad"
              placeholderTextColor={C.gray[700]}
              placeholder="0.00"
            />
          </View>

          {/* Quick Amount Scenario Chips (INR demo ladder) */}
          <View style={styles.quickChipsRow}>
            {[
              { val: '8000', label: '₹8K (Safe)' },
              { val: '1800', label: '₹1.8K (2FA)' },
              { val: '25000', label: '₹25K (Caution)' },
              { val: '200000', label: '₹2L (Block)' },
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
        {beneficiaries.length === 0 && (
          <View style={styles.emptyBeneficiaries}>
            <Text style={styles.emptyBeneficiariesText}>
              No beneficiaries yet. Create a recipient in the dashboard first.
            </Text>
          </View>
        )}
        <View style={styles.beneficiaryList}>
          {beneficiaries.map((ben) => {
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
                  <Text style={[styles.benAvatarText, isSelected && { color: C.gray.black }]}>
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
            <Text style={[styles.riskScoreVal, { color: currentRisk > 70 ? C.risk.critical : currentRisk > 40 ? C.risk.warn : C.risk.safe }]}>
              {currentRisk}/100
            </Text>
          </View>
          <View style={styles.riskBarBg}>
            <View
              style={[
                styles.riskBarFill,
                {
                  width: `${Math.min(currentRisk, 100)}%`,
                  backgroundColor: currentRisk > 70 ? C.risk.critical : currentRisk > 40 ? C.risk.warn : C.risk.safe,
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
                <IconShieldAlert size={18} color={C.risk.critical} />
              ) : verdict.decision === 'STEP_UP_2FA' ? (
                <IconAlertOctagon size={18} color={C.risk.warn} />
              ) : (
                <IconCheckCircle size={18} color={C.risk.safe} />
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
            {pendingConfirmTransferId && (
              <Pressable
                style={({ pressed }) => [styles.confirmBtn, pressed && styles.btnPressed]}
                onPress={handleConfirmAndSettle}
                disabled={analyzing}
                accessibilityRole="button"
              >
                {analyzing ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <>
                    <Text style={styles.confirmBtnText}>Confirm & Settle with Shield</Text>
                    <IconShieldCheck size={16} color="#000000" />
                  </>
                )}
              </Pressable>
            )}
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
          disabled={analyzing || !selectedBeneficiary}
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
    backgroundColor: C.gray.black,
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
  topBarTitle: {
    color: C.gray.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  aiGuardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.gray.card,
    borderWidth: 1,
    borderColor: A.white(0.12),
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  aiGuardText: {
    color: C.gray[400],
    fontSize: 9,
    fontWeight: 'bold',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  amountCard: {
    backgroundColor: C.gray.card,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: A.white(0.12),
    marginBottom: 24,
  },
  amountLabel: {
    color: C.gray[600],
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
    color: C.gray.white,
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    color: C.gray.white,
    fontSize: 38,
    fontWeight: '800',
    padding: 0,
    fontFamily: PayGuardMonoFont,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: C.surface.elevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: A.white(0.08),
  },
  chipActive: {
    backgroundColor: C.gray.white,
    borderColor: C.gray.white,
  },
  chipText: {
    color: C.gray[500],
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: C.gray.black,
    fontWeight: 'bold',
  },
  sectionHeader: {
    color: C.gray[600],
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  emptyBeneficiaries: {
    backgroundColor: C.gray.card,
    borderWidth: 1,
    borderColor: A.white(0.08),
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  emptyBeneficiariesText: {
    color: C.gray[500],
    fontSize: 11,
    textAlign: 'center' as const,
  },
  beneficiaryList: {
    backgroundColor: C.gray.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: A.white(0.08),
    overflow: 'hidden',
    marginBottom: 24,
  },
  beneficiaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: A.white(0.04),
    gap: 12,
  },
  beneficiaryItemActive: {
    backgroundColor: C.gray[950],
  },
  benAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.gray[925],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: A.white(0.15),
  },
  benAvatarActive: {
    backgroundColor: C.gray.white,
  },
  benAvatarText: {
    color: C.gray.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  benInfo: {
    flex: 1,
  },
  benName: {
    color: C.gray.white,
    fontSize: 14,
    fontWeight: '600',
  },
  benHandle: {
    color: C.gray[600],
    fontSize: 11,
    marginTop: 2,
    fontFamily: PayGuardMonoFont,
  },
  benTrustBadge: {
    backgroundColor: C.gray[925],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: A.white(0.08),
  },
  benTrustText: {
    color: C.gray[400],
    fontSize: 9,
    fontWeight: 'bold',
  },
  riskMeterCard: {
    backgroundColor: C.gray.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: A.white(0.08),
    marginBottom: 24,
  },
  riskMeterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskMeterTitle: {
    color: C.gray[500],
    fontSize: 12,
  },
  riskScoreVal: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: PayGuardMonoFont,
  },
  riskBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.gray[900],
    overflow: 'hidden',
    marginBottom: 8,
  },
  riskBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  riskMeterFootnote: {
    color: C.gray[700],
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
    backgroundColor: A.safe(0.06),
    borderColor: A.safe(0.3),
  },
  verdictWarn: {
    backgroundColor: A.warn(0.06),
    borderColor: A.warn(0.3),
  },
  verdictBlock: {
    backgroundColor: A.danger(0.06),
    borderColor: A.danger(0.3),
  },
  verdictStatus: {
    color: C.gray.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  verdictReason: {
    color: C.gray[300],
    fontSize: 11,
    lineHeight: 16,
  },
  payBtn: {
    flexDirection: 'row',
    backgroundColor: C.gray.white,
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
    color: C.gray.black,
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmBtn: {
    flexDirection: 'row',
    backgroundColor: C.gray.white,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  confirmBtnText: {
    color: C.gray.black,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
