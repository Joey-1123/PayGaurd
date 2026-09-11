// Location: app/(tabs)/pg-threat-center.tsx
// FamPay-Style QR Scan Screen (Mock)

import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import { PayGuardColors, PayGuardSpacing, PayGuardFontSize, PayGuardBorderRadius, PayGuardFontWeight } from '@/constants/payGuardTheme';

export default function PgScanScreen() {
  const scanLine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 260, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanLine, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [scanLine]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan to Pay</Text>
      </View>

      <View style={styles.content}>
        {/* VIEW FINDER */}
        <View style={styles.viewFinderContainer}>
          <View style={styles.viewFinder}>
            {/* Corners */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLine }] }]} />
            
            <Text style={styles.scanText}>Align QR code within the frame</Text>
          </View>
        </View>

        {/* SECURITY INFO */}
        <View style={styles.securityInfo}>
          <Text style={styles.securityIcon}>🛡️</Text>
          <Text style={styles.securityText}>PayGuard analyzes risk before every payment</Text>
          <Text style={styles.securitySubtext}>Fraud detection runs automatically</Text>
        </View>

        {/* MANUAL ENTRY */}
        <TouchableOpacity style={styles.manualBtn}>
          <Text style={styles.manualBtnText}>Enter Code Manually</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PayGuardColors.background.dark },
  header: { alignItems: 'center', padding: PayGuardSpacing.lg },
  title: { color: PayGuardColors.text.primary, fontSize: PayGuardFontSize.lg, fontWeight: PayGuardFontWeight.bold },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: PayGuardSpacing.xl },
  viewFinderContainer: { width: 260, height: 260, marginBottom: PayGuardSpacing.xxl, position: 'relative' },
  viewFinder: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: PayGuardBorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: PayGuardColors.brand.primary },
  topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: PayGuardBorderRadius.lg },
  topRight: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: PayGuardBorderRadius.lg },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: PayGuardBorderRadius.lg },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: PayGuardBorderRadius.lg },
  scanLine: { position: 'absolute', top: 0, left: 10, right: 10, height: 2, backgroundColor: PayGuardColors.brand.primary, shadowColor: PayGuardColors.brand.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 4 },
  scanText: { color: PayGuardColors.text.muted, fontSize: PayGuardFontSize.sm },
  securityInfo: { alignItems: 'center', marginBottom: PayGuardSpacing.xxl },
  securityIcon: { fontSize: 32, marginBottom: 8 },
  securityText: { color: PayGuardColors.text.primary, fontSize: PayGuardFontSize.md, fontWeight: PayGuardFontWeight.semibold, textAlign: 'center', marginBottom: 4 },
  securitySubtext: { color: PayGuardColors.text.muted, fontSize: PayGuardFontSize.sm, textAlign: 'center' },
  manualBtn: { width: '100%', padding: PayGuardSpacing.lg, borderRadius: PayGuardBorderRadius.full, borderWidth: 1, borderColor: PayGuardColors.brand.primary, alignItems: 'center' },
  manualBtnText: { color: PayGuardColors.brand.primary, fontSize: PayGuardFontSize.md, fontWeight: PayGuardFontWeight.bold },
});
