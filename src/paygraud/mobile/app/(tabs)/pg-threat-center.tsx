// Location: app/(tabs)/pg-threat-center.tsx
// Rethought with UI-UX-Pro-Max & Anti-UI-Slop: Pure B&W Optical Scanner & Auto-Block Protocol

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ActivityIndicator,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import {
  IconArrowLeft,
  IconZap,
  IconShieldCheck,
  IconShieldAlert,
  IconCheck,
  IconX,
  IconArrowRight,
  IconRotateCcw,
  IconRadio,
} from '@/components/icons/PayGuardIcons';
import { PayGuardColors as C, PayGuardAlpha as A, PayGuardMonoFont } from '@/constants/payGuardTheme';
import { PayGuardNetworkClient, extractApiError } from '@/services/PayGuardNetworkClient';
import { usePayGuardThreats } from '@/store/threatIntelligenceStore';

interface ScanResult {
  receiverName: string;
  receiverAccount: string;
  riskScore: number;
  riskLevel: string;
  status: 'SAFE' | 'FRAUDSTER';
  flags: string[];
  reason: string;
  recipientId: string | null;
}

interface AttemptResult {
  status: string;
  message: string;
}

export default function PgScanScreen() {
  const scanLine = useRef(new Animated.Value(0)).current;
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [amount, setAmount] = useState('50.00');
  const [torch, setTorch] = useState(false);
  const [scannedLock, setScannedLock] = useState(false);
  const [attempting, setAttempting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);

  const { activeAlerts } = usePayGuardThreats();

  // Animated laser line
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 240, duration: 1600, useNativeDriver: true }),
        Animated.timing(scanLine, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, [scanLine]);

  // Real pipeline: QR payload → backend signal scorer → real blacklist + saga.
  const handleProcessQr = async (target: { name: string; account: string }) => {
    setAnalyzing(true);
    setScanResult(null);
    setAttemptResult(null);

    try {
      const signal = await PayGuardNetworkClient.captureSignal({
        sender: 'QR SCAN',
        body: target.account,
        channel: 'qr',
      });

      const isFraudster =
        signal.action === 'reject' ||
        signal.riskLevel === 'CRITICAL' ||
        signal.riskLevel === 'HIGH';

      let recipientId: string | null = null;
      if (target.account.startsWith('upi://pay') && isFraudster) {
        let payee = target.name;
        try {
          const pa = target.account.split('pa=')[1]?.split('&')[0];
          if (pa) payee = decodeURIComponent(pa);
        } catch {
          // reuse name
        }
        try {
          const rec = await PayGuardNetworkClient.createRecipient({
            name: target.name,
            accountNumber: payee,
            riskHint: 'critical',
          });
          recipientId = rec.id;
        } catch {
          const bens = await PayGuardNetworkClient.fetchBeneficiaries().catch(() => []);
          recipientId =
            bens.find((b) => b.accountNumber === payee || b.name === target.name)?.beneficiaryId ??
            null;
        }
      }

      setScanResult({
        receiverName: target.name,
        receiverAccount: target.account,
        riskScore: signal.riskScore,
        riskLevel: signal.riskLevel,
        status: isFraudster ? 'FRAUDSTER' : 'SAFE',
        flags: signal.flags,
        reason: signal.flags.length
          ? `Flagged: ${signal.flags.join(', ')}`
          : 'No hard fraud signals detected.',
        recipientId,
      });
    } catch (err) {
      console.error('Scan analysis error:', err);
      Alert.alert('Scan failed', 'Shield unreachable. Is the PayGuard backend running?');
    } finally {
      setAnalyzing(false);
    }
  };

  const runSagaPayment = async (): Promise<AttemptResult> => {
    const { transfer, risk } = await PayGuardNetworkClient.initiateSecureTransfer({
      beneficiaryId: scanResult?.recipientId ?? '',
      beneficiaryName: scanResult?.receiverName ?? 'Unknown',
      amount: parseFloat(amount) || 50,
      currencyCode: 'INR',
      note: 'QR scan payment',
    });
    return {
      status: transfer.transferStatus,
      message: `${transfer.transferStatus.toUpperCase()} · score ${risk.riskScore}/100 · ${risk.decision}`,
    };
  };

  const handlePaymentAttempt = async () => {
    setAttempting(true);
    setAttemptResult(null);
    try {
      setAttemptResult(await runSagaPayment());
    } catch (e) {
      setAttemptResult({ status: 'FAILED', message: extractApiError(e) });
    } finally {
      setAttempting(false);
    }
  };

  // Real-time Barcode Scanner Callback from Camera View
  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scannedLock || analyzing || scanResult) return;
    setScannedLock(true);

    let parsedName = 'Live Scanned Entity';
    if (data.startsWith('upi://') || data.startsWith('payguard://')) {
      try {
        const url = new URL(
          data.replace('upi://', 'https://dummy.com/').replace('payguard://', 'https://dummy.com/')
        );
        const pn = url.searchParams.get('pn');
        if (pn) parsedName = decodeURIComponent(pn);
      } catch {
        // use raw text
      }
    }

    handleProcessQr({ name: parsedName, account: data });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [styles.topBtn, pressed && styles.btnPressed]}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <IconArrowLeft size={20} color={C.gray.white} />
        </Pressable>
        <Text style={styles.topTitle}>SCAN & ANALYZE</Text>
        <Pressable
          style={({ pressed }) => [
            styles.topBtn,
            torch && styles.topBtnActive,
            pressed && styles.btnPressed,
          ]}
          onPress={() => setTorch(!torch)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Toggle Flashlight Torch"
          accessibilityRole="button"
        >
          <IconZap size={18} color={torch ? C.gray.black : C.gray.white} />
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* SCANNER VIEWFINDER */}
        {!scanResult && (
          <>
            <View style={styles.viewfinderWrapper}>
              <View style={styles.viewfinder}>
                {permission?.granted ? (
                  <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    enableTorch={torch}
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={scannedLock ? undefined : handleBarcodeScanned}
                  />
                ) : (
                  <View style={styles.permissionPlaceholder}>
                    <IconShieldAlert size={28} color={C.gray[500]} />
                    <Text style={styles.permissionTitle}>CAMERA PERMISSION</Text>
                    <Text style={styles.permissionSub}>Required to scan recipient QR codes</Text>
                    <Pressable
                      style={({ pressed }) => [styles.permissionBtn, pressed && styles.btnPressed]}
                      onPress={requestPermission}
                      accessibilityRole="button"
                    >
                      <Text style={styles.permissionBtnText}>Enable Camera</Text>
                    </Pressable>
                  </View>
                )}

                {/* 4 Corner Brackets */}
                <View style={[styles.corner, styles.cornerTL]} pointerEvents="none" />
                <View style={[styles.corner, styles.cornerTR]} pointerEvents="none" />
                <View style={[styles.corner, styles.cornerBL]} pointerEvents="none" />
                <View style={[styles.corner, styles.cornerBR]} pointerEvents="none" />

                {/* Laser Line */}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.laserLine,
                    { transform: [{ translateY: scanLine }] },
                  ]}
                />

                {permission?.granted && (
                  <Text style={styles.viewfinderHint} pointerEvents="none">
                    Align QR Code within target
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.statusPill}>
              <IconShieldCheck size={16} color={C.risk.safe} strokeWidth={2.2} />
              <Text style={styles.statusPillText}>
                {torch ? 'Torch Active · AI Radar Scanning' : 'AI Defense Guardrail Active · Live Radar'}
              </Text>
            </View>

            {/* SIMULATE SCAN TEST BUTTONS */}
            <Text style={styles.testSectionTitle}>OR SIMULATE KNOWN TARGETS:</Text>
            <View style={styles.testBtnsRow}>
              <Pressable
                style={({ pressed }) => [styles.testBtn, pressed && styles.btnPressed]}
                onPress={() =>
                  handleProcessQr({
                    name: 'Cyber Roast Labs',
                    account: 'upi://pay?pa=cyberroast@okaxis',
                  })
                }
                accessibilityRole="button"
              >
                <IconCheck size={16} color={C.risk.safe} strokeWidth={2.5} />
                <Text style={styles.testBtnText}>Normal Merchant</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.testBtnDanger, pressed && styles.btnPressed]}
                onPress={() =>
                  handleProcessQr({
                    name: 'Invoice Desk LLC',
                    account:
                      'upi://pay?pa=fake.invoice.desk@okhdfcbank&pn=Invoice%20Desk%20LLC&am=75000&tn=Rent%20for%20September',
                  })
                }
                accessibilityRole="button"
              >
                <IconX size={16} color={C.risk.critical} strokeWidth={2.5} />
                <Text style={styles.testBtnDangerText}>Malicious Scammer</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* ANALYZING SPINNER */}
        {analyzing && (
          <View style={styles.analyzingCard}>
            <ActivityIndicator color={C.gray.white} size="large" />
            <Text style={styles.analyzingTitle}>TRANSMITTING TO BACKEND AI...</Text>
            <Text style={styles.analyzingSub}>
              Evaluating receiver identity, velocity signatures & synthetic fraud models
            </Text>
          </View>
        )}

        {/* SAFE VERDICT RESULT */}
        {scanResult && scanResult.status === 'SAFE' && (
          <View style={styles.safeResultCard}>
            <View style={styles.safeHeader}>
              <View style={styles.verifiedIconBox}>
                <IconCheck size={24} color="#000000" strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.safeBadge}>
                  PAYMENT ALLOWED · {scanResult.riskLevel}
                </Text>
                <Text style={styles.safeName}>{scanResult.receiverName}</Text>
                <Text style={styles.safeAccount}>{scanResult.receiverAccount}</Text>
              </View>
            </View>

            <View style={styles.verdictBox}>
              <Text style={styles.verdictLabel}>BACKEND RISK SCORE: {scanResult.riskScore}/100</Text>
              <Text style={styles.verdictText}>{scanResult.reason}</Text>
            </View>

            <View style={styles.amountInputBlock}>
              <Text style={styles.amountLabel}>AMOUNT TO PAY (₹)</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={C.gray[700]}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.payNowBtn,
                attempting && styles.btnPressed,
                pressed && styles.btnPressed,
              ]}
              onPress={handlePaymentAttempt}
              disabled={attempting}
              accessibilityRole="button"
            >
              <Text style={styles.payNowText}>
                {attempting ? 'RUNNING SAGA...' : 'Authorize & Pay'}
              </Text>
              <IconArrowRight size={18} color="#000000" strokeWidth={2.4} />
            </Pressable>

            {attemptResult && (
              <View style={styles.heldResultBox}>
                <Text style={styles.heldResultStatus}>{attemptResult.status.toUpperCase()}</Text>
                <Text style={styles.heldResultText}>{attemptResult.message}</Text>
              </View>
            )}

            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                setScanResult(null);
                setScannedLock(false);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconRotateCcw size={14} color={C.gray[500]} />
              <Text style={styles.cancelText}>Scan Another Target</Text>
            </Pressable>
          </View>
        )}

        {/* FRAUDSTER DETECTED: HARD SECURITY BLOCK */}
        {scanResult && scanResult.status === 'FRAUDSTER' && (
          <View style={styles.fraudCard}>
            <View style={styles.fraudIconBox}>
              <IconShieldAlert size={32} color={C.gray.white} strokeWidth={2.4} />
            </View>

            <Text style={styles.fraudTitle}>FRAUDSTER DETECTED</Text>
            <Text style={styles.fraudSub}>
              PAYMENT AUTOMATICALLY INTERCEPTED & BLOCKED
            </Text>

            <View style={styles.fraudDetailsBox}>
              <Text style={styles.fraudKey}>FLAGGED RECIPIENT:</Text>
              <Text style={styles.fraudVal}>{scanResult.receiverName}</Text>
              <Text style={styles.fraudAccount}>{scanResult.receiverAccount}</Text>

              <View style={styles.fraudDivider} />

              <Text style={styles.fraudKey}>AI SAGA VERDICT (SCORE {scanResult.riskScore}/100):</Text>
              <Text style={styles.fraudReason}>{scanResult.reason}</Text>
            </View>

            <View style={styles.blockedPill}>
              <IconShieldAlert size={14} color={C.risk.critical} />
              <Text style={styles.blockedPillText}>RECEIVER PERMANENTLY BLACKLISTED</Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.attemptBtn,
                attempting && styles.btnPressed,
                pressed && styles.btnPressed,
              ]}
              onPress={handlePaymentAttempt}
              disabled={attempting}
              accessibilityRole="button"
            >
              <IconZap size={14} color="#000000" />
              <Text style={styles.attemptBtnText}>
                {attempting ? 'RUNNING SAGA...' : 'DEMONSTRATE PAYMENT ATTEMPT'}
              </Text>
            </Pressable>

            {attemptResult && (
              <View style={styles.heldResultBox}>
                <Text style={styles.heldResultStatus}>{attemptResult.status.toUpperCase()}</Text>
                <Text style={styles.heldResultText}>{attemptResult.message}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [styles.dismissBtn, pressed && styles.btnPressed]}
              onPress={() => {
                setScanResult(null);
                setScannedLock(false);
              }}
              accessibilityRole="button"
            >
              <Text style={styles.dismissBtnText}>Dismiss & Return to Safety</Text>
            </Pressable>
          </View>
        )}
        {/* SIGNAL LAB LINK */}
        <Pressable
          style={({ pressed }) => [styles.signalLabBtn, pressed && styles.btnPressed]}
          onPress={() => router.push('/secure-transfer/pg-signal-capture')}
          accessibilityRole="button"
        >
          <IconRadio size={16} color="#000000" />
          <Text style={styles.signalLabBtnText}>Open Signal Lab (SMS Capture)</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.caseStudyBtn, pressed && styles.btnPressed]}
          onPress={() => router.push('/secure-transfer/pg-case-study')}
          accessibilityRole="button"
        >
          <IconShieldAlert size={16} color={C.risk.critical} />
          <Text style={styles.caseStudyBtnText}>Run Guided Case Study</Text>
        </Pressable>

        {/* ALERTS FEED */}
        {activeAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.alertsSectionTitle}>RECENT ALERTS</Text>
            {activeAlerts.slice(0, 5).map((alert) => (
              <View key={alert.alertId} style={styles.alertRow}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertCategory}>{alert.threatCategory}</Text>
                  <Text style={[styles.alertStatus, alert.isBlocked && { color: C.risk.critical }]}>
                    {alert.isBlocked ? 'BLOCKED' : 'MONITORING'}
                  </Text>
                </View>
                <Text style={styles.alertDesc} numberOfLines={2}>{alert.description}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
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
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.background.input,
    borderWidth: 1,
    borderColor: A.white(0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBtnActive: {
    backgroundColor: C.gray.white,
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  topTitle: {
    color: C.gray.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },

  // VIEWFINDER
  viewfinderWrapper: {
    width: 260,
    height: 260,
    marginBottom: 24,
  },
  viewfinder: {
    flex: 1,
    backgroundColor: C.gray.deep,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: A.white(0.08),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  permissionPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  permissionTitle: {
    color: C.gray.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  permissionSub: {
    color: C.gray[700],
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 6,
  },
  permissionBtn: {
    backgroundColor: C.gray.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  permissionBtnText: {
    color: C.gray.black,
    fontSize: 11,
    fontWeight: 'bold',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: C.gray.white,
  },
  cornerTL: {
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 10,
  },
  cornerTR: {
    top: 10,
    right: 10,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 10,
  },
  cornerBL: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 10,
  },
  cornerBR: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 10,
  },
  laserLine: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: C.gray.white,
    shadowColor: C.gray.white,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  viewfinderHint: {
    color: C.gray[600],
    fontSize: 11,
    letterSpacing: 0.5,
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.gray.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: A.white(0.1),
    gap: 8,
    marginBottom: 32,
  },
  statusPillText: {
    color: C.gray[500],
    fontSize: 11,
    fontWeight: '500',
  },

  // TEST BUTTONS
  testSectionTitle: {
    color: C.gray[700],
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  testBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  testBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: C.background.input,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: A.white(0.15),
    gap: 8,
  },
  testBtnText: {
    color: C.gray.white,
    fontSize: 12,
    fontWeight: '600',
  },
  testBtnDanger: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: A.danger(0.08),
    borderColor: A.danger(0.4),
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 8,
  },
  testBtnDangerText: {
    color: C.risk.critical,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // ANALYZING
  analyzingCard: {
    width: '100%',
    backgroundColor: C.gray.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: A.white(0.15),
  },
  analyzingTitle: {
    color: C.gray.white,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 18,
    marginBottom: 6,
  },
  analyzingSub: {
    color: C.gray[500],
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  // SAFE RESULT
  safeResultCard: {
    width: '100%',
    backgroundColor: C.gray.card,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: A.white(0.2),
  },
  safeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  verifiedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.risk.safe,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeBadge: {
    color: C.risk.safe,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  safeName: {
    color: C.gray.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  safeAccount: {
    color: C.gray[600],
    fontSize: 11,
    marginTop: 2,
    fontFamily: PayGuardMonoFont,
  },
  verdictBox: {
    backgroundColor: C.gray[950],
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: A.white(0.08),
    marginBottom: 16,
  },
  verdictLabel: {
    color: C.gray.white,
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  verdictText: {
    color: C.gray[400],
    fontSize: 11,
  },
  amountInputBlock: {
    marginBottom: 16,
  },
  amountLabel: {
    color: C.gray[600],
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  amountInput: {
    backgroundColor: C.gray[950],
    color: C.gray.white,
    fontSize: 22,
    fontWeight: 'bold',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: A.white(0.1),
    fontFamily: PayGuardMonoFont,
  },
  payNowBtn: {
    flexDirection: 'row',
    backgroundColor: C.gray.white,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  payNowText: {
    color: C.gray.black,
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  cancelText: {
    color: C.gray[500],
    fontSize: 12,
  },

  // SAGA PAYMENT ATTEMPT RESULT
  attemptBtn: {
    flexDirection: 'row',
    backgroundColor: C.gray.white,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 12,
  },
  attemptBtnText: {
    color: C.gray.black,
    fontSize: 12,
    fontWeight: 'bold',
  },
  heldResultBox: {
    width: '100%',
    backgroundColor: C.gray[950],
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: A.white(0.12),
    marginBottom: 12,
  },
  heldResultStatus: {
    color: C.gray.white,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heldResultText: {
    color: C.gray[400],
    fontSize: 11,
    lineHeight: 16,
  },

  // FRAUDSTER CARD
  fraudCard: {
    width: '100%',
    backgroundColor: C.surface.dangerCard,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: C.risk.critical,
    alignItems: 'center',
  },
  fraudIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.risk.critical,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fraudTitle: {
    color: C.risk.critical,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  fraudSub: {
    color: C.gray[400],
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 20,
  },
  fraudDetailsBox: {
    width: '100%',
    backgroundColor: C.surface.dangerInset,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: A.danger(0.3),
    marginBottom: 16,
  },
  fraudKey: {
    color: C.gray[500],
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  fraudVal: {
    color: C.gray.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  fraudAccount: {
    color: C.risk.critical,
    fontSize: 11,
    marginBottom: 10,
    fontFamily: PayGuardMonoFont,
  },
  fraudDivider: {
    height: 1,
    backgroundColor: A.white(0.08),
    marginVertical: 10,
  },
  fraudReason: {
    color: C.gray[200],
    fontSize: 11,
    lineHeight: 16,
  },
  blockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: A.danger(0.15),
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: A.danger(0.4),
    gap: 8,
    marginBottom: 20,
  },
  blockedPillText: {
    color: C.risk.critical,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dismissBtn: {
    width: '100%',
    backgroundColor: C.risk.critical,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  dismissBtnText: {
    color: C.gray.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  signalLabBtn: {
    flexDirection: 'row',
    backgroundColor: C.gray.white,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginTop: 20,
  },
  signalLabBtnText: {
    color: C.gray.black,
    fontSize: 13,
    fontWeight: 'bold',
  },
  caseStudyBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: A.danger(0.4),
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginTop: 10,
  },
  caseStudyBtnText: {
    color: C.risk.critical,
    fontSize: 13,
    fontWeight: 'bold',
  },
  alertsSection: {
    width: '100%',
    marginTop: 24,
  },
  alertsSectionTitle: {
    color: C.gray[700],
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  alertRow: {
    backgroundColor: C.gray.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: A.white(0.08),
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertCategory: {
    color: C.gray.white,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  alertStatus: {
    color: C.risk.safe,
    fontSize: 10,
    fontWeight: 'bold',
  },
  alertDesc: {
    color: C.gray[500],
    fontSize: 11,
    lineHeight: 16,
  },
});
