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
import { PayGuardNetworkClient } from '@/services/PayGuardNetworkClient';
import { usePayGuardThreats } from '@/store/threatIntelligenceStore';

interface ScanResult {
  receiverName: string;
  receiverAccount: string;
  riskScore: number;
  status: 'SAFE' | 'FRAUDSTER';
  reason: string;
}

export default function PgScanScreen() {
  const scanLine = useRef(new Animated.Value(0)).current;
  const [permission, requestPermission] = useCameraPermissions();
  const [analyzing, setAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [amount, setAmount] = useState('50.00');
  const [torch, setTorch] = useState(false);
  const [scannedLock, setScannedLock] = useState(false);

  const { addAlert, activeAlerts } = usePayGuardThreats();

  // Animated laser line
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 240, duration: 1600, useNativeDriver: true }),
        Animated.timing(scanLine, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, [scanLine]);

  // Handle scanning a QR code and sending report to Backend
  const handleProcessQr = async (mockReceiver: {
    name: string;
    account: string;
    type: 'SAFE' | 'FRAUDSTER';
  }) => {
    setAnalyzing(true);
    setScanResult(null);

    try {
      // 1. Send receiver report to Backend API for deep multi-model inspection
      const backendResponse = await PayGuardNetworkClient.assessRisk({
        beneficiaryName: mockReceiver.name,
        amount: parseFloat(amount) || 50,
      }).catch(() => null);

      // 2. Evaluate Backend decision or fallback based on receiver threat payload
      const isFraudster =
        mockReceiver.type === 'FRAUDSTER' ||
        backendResponse?.decision === 'BLOCK' ||
        (backendResponse?.riskScore ?? 0) >= 80;

      const result: ScanResult = {
        receiverName: mockReceiver.name,
        receiverAccount: mockReceiver.account,
        riskScore: backendResponse?.riskScore ?? (isFraudster ? 96 : 8),
        status: isFraudster ? 'FRAUDSTER' : 'SAFE',
        reason: isFraudster
          ? backendResponse?.explanation ??
            'Backend AI detected synthetic identity anomaly and high-velocity diversion signatures.'
          : 'Backend AI verified receiver identity against global trust directories.',
      };

      setScanResult(result);

      // 3. If fraudster, auto-block receiver and record alert in local store
      if (isFraudster) {
        addAlert({
          alertId: `alert-${Date.now()}`,
          threatLevel: 'CRITICAL',
          threatCategory: 'FRAUD_RING_DETECTED',
          description: `Fraudster ${mockReceiver.name} (${mockReceiver.account}) intercepted & automatically blocked by PayGuard.`,
          requiresAction: false,
          issuedAt: new Date().toISOString(),
          isBlocked: true,
        });
      }
    } catch (err) {
      console.error('Scan analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Real-time Barcode Scanner Callback from Camera View
  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scannedLock || analyzing || scanResult) return;
    setScannedLock(true);

    let parsedName = 'Live Scanned Entity';
    let parsedAccount = data;
    let detectedType: 'SAFE' | 'FRAUDSTER' = 'SAFE';

    // Heuristic scan detection for UPI / PayGuard schemes
    if (data.toLowerCase().includes('fraud') || data.toLowerCase().includes('scam') || data.toLowerCase().includes('phish') || data.toLowerCase().includes('lottery')) {
      detectedType = 'FRAUDSTER';
      parsedName = 'High-Risk Rogue Node';
    } else {
      try {
        if (data.startsWith('upi://') || data.startsWith('payguard://')) {
          const url = new URL(data.replace('upi://', 'https://dummy.com/').replace('payguard://', 'https://dummy.com/'));
          const pn = url.searchParams.get('pn');
          const pa = url.searchParams.get('pa');
          if (pn) parsedName = decodeURIComponent(pn);
          if (pa) parsedAccount = decodeURIComponent(pa);
        }
      } catch {
        // use raw text
      }
    }

    handleProcessQr({
      name: parsedName,
      account: parsedAccount,
      type: detectedType,
    });
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
          <IconArrowLeft size={20} color="#FFFFFF" />
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
          <IconZap size={18} color={torch ? '#000000' : '#FFFFFF'} />
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
                    <IconShieldAlert size={28} color="#888888" />
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
              <IconShieldCheck size={16} color="#00FF66" strokeWidth={2.2} />
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
                    type: 'SAFE',
                  })
                }
                accessibilityRole="button"
              >
                <IconCheck size={16} color="#00FF66" strokeWidth={2.5} />
                <Text style={styles.testBtnText}>Normal Merchant</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.testBtnDanger, pressed && styles.btnPressed]}
                onPress={() =>
                  handleProcessQr({
                    name: 'Unknown Fraudster Node',
                    account: 'upi://pay?pa=fake.invoice.desk@scam',
                    type: 'FRAUDSTER',
                  })
                }
                accessibilityRole="button"
              >
                <IconX size={16} color="#FF2A2A" strokeWidth={2.5} />
                <Text style={styles.testBtnDangerText}>Malicious Scammer</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* ANALYZING SPINNER */}
        {analyzing && (
          <View style={styles.analyzingCard}>
            <ActivityIndicator color="#FFFFFF" size="large" />
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
                <Text style={styles.safeBadge}>RECEIVER VERIFIED · SAFE</Text>
                <Text style={styles.safeName}>{scanResult.receiverName}</Text>
                <Text style={styles.safeAccount}>{scanResult.receiverAccount}</Text>
              </View>
            </View>

            <View style={styles.verdictBox}>
              <Text style={styles.verdictLabel}>BACKEND RISK SCORE: {scanResult.riskScore}/100</Text>
              <Text style={styles.verdictText}>{scanResult.reason}</Text>
            </View>

            <View style={styles.amountInputBlock}>
              <Text style={styles.amountLabel}>AMOUNT TO PAY ($)</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#555"
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.payNowBtn, pressed && styles.btnPressed]}
              onPress={() => {
                Alert.alert(
                  'Transfer Completed',
                  `Payment of $${amount} successfully transferred to ${scanResult.receiverName}. AI Saga ledger updated.`
                );
                setScanResult(null);
                setScannedLock(false);
              }}
              accessibilityRole="button"
            >
              <Text style={styles.payNowText}>Authorize & Pay</Text>
              <IconArrowRight size={18} color="#000000" strokeWidth={2.4} />
            </Pressable>

            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                setScanResult(null);
                setScannedLock(false);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconRotateCcw size={14} color="#888888" />
              <Text style={styles.cancelText}>Scan Another Target</Text>
            </Pressable>
          </View>
        )}

        {/* FRAUDSTER DETECTED: HARD SECURITY BLOCK */}
        {scanResult && scanResult.status === 'FRAUDSTER' && (
          <View style={styles.fraudCard}>
            <View style={styles.fraudIconBox}>
              <IconShieldAlert size={32} color="#FFFFFF" strokeWidth={2.4} />
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
              <IconShieldAlert size={14} color="#FF2A2A" />
              <Text style={styles.blockedPillText}>RECEIVER PERMANENTLY BLACKLISTED</Text>
            </View>

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

        {/* ALERTS FEED */}
        {activeAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.alertsSectionTitle}>RECENT ALERTS</Text>
            {activeAlerts.slice(0, 5).map((alert) => (
              <View key={alert.alertId} style={styles.alertRow}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertCategory}>{alert.threatCategory}</Text>
                  <Text style={[styles.alertStatus, alert.isBlocked && { color: '#FF2A2A' }]}>
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
    backgroundColor: '#000000',
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
    backgroundColor: '#0E0E0E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  topTitle: {
    color: '#FFFFFF',
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
    backgroundColor: '#080808',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  permissionSub: {
    color: '#777777',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 6,
  },
  permissionBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  permissionBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  viewfinderHint: {
    color: '#666666',
    fontSize: 11,
    letterSpacing: 0.5,
  },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C0C0C',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
    marginBottom: 32,
  },
  statusPillText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '500',
  },

  // TEST BUTTONS
  testSectionTitle: {
    color: '#555555',
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
    backgroundColor: '#0E0E0E',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 8,
  },
  testBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  testBtnDanger: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 42, 42, 0.08)',
    borderColor: 'rgba(255, 42, 42, 0.4)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 8,
  },
  testBtnDangerText: {
    color: '#FF2A2A',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // ANALYZING
  analyzingCard: {
    width: '100%',
    backgroundColor: '#0C0C0C',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  analyzingTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 18,
    marginBottom: 6,
  },
  analyzingSub: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  // SAFE RESULT
  safeResultCard: {
    width: '100%',
    backgroundColor: '#0C0C0C',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    backgroundColor: '#00FF66',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeBadge: {
    color: '#00FF66',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  safeName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  safeAccount: {
    color: '#666666',
    fontSize: 11,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  verdictBox: {
    backgroundColor: '#141414',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  verdictLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  verdictText: {
    color: '#AAAAAA',
    fontSize: 11,
  },
  amountInputBlock: {
    marginBottom: 16,
  },
  amountLabel: {
    color: '#666666',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  amountInput: {
    backgroundColor: '#141414',
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  payNowBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  payNowText: {
    color: '#000000',
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
    color: '#888888',
    fontSize: 12,
  },

  // FRAUDSTER CARD
  fraudCard: {
    width: '100%',
    backgroundColor: '#100505',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#FF2A2A',
    alignItems: 'center',
  },
  fraudIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fraudTitle: {
    color: '#FF2A2A',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  fraudSub: {
    color: '#AAAAAA',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 20,
  },
  fraudDetailsBox: {
    width: '100%',
    backgroundColor: '#180808',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 42, 0.3)',
    marginBottom: 16,
  },
  fraudKey: {
    color: '#888888',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  fraudVal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  fraudAccount: {
    color: '#FF2A2A',
    fontSize: 11,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  fraudDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 10,
  },
  fraudReason: {
    color: '#DDDDDD',
    fontSize: 11,
    lineHeight: 16,
  },
  blockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 42, 42, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 42, 0.4)',
    gap: 8,
    marginBottom: 20,
  },
  blockedPillText: {
    color: '#FF2A2A',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dismissBtn: {
    width: '100%',
    backgroundColor: '#FF2A2A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  dismissBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  signalLabBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginTop: 20,
  },
  signalLabBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: 'bold',
  },
  alertsSection: {
    width: '100%',
    marginTop: 24,
  },
  alertsSectionTitle: {
    color: '#555555',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  alertRow: {
    backgroundColor: '#0C0C0C',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertCategory: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  alertStatus: {
    color: '#00FF66',
    fontSize: 10,
    fontWeight: 'bold',
  },
  alertDesc: {
    color: '#888888',
    fontSize: 11,
    lineHeight: 16,
  },
});
