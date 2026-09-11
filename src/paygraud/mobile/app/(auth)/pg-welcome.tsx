// Location: app/(auth)/pg-welcome.tsx
// Pure Black & White Minimalist Landing Hero
// Grounded in FamPay aesthetic & anti-ui-slop guidelines: real interaction, zero emoji slop

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  IconShieldCheck,
  IconQrCode,
  IconCpu,
  IconArrowRight,
  IconZap,
} from '@/components/icons/PayGuardIcons';
import { PayGuardColors as C, PayGuardAlpha as A, PayGuardMonoFont } from '@/constants/payGuardTheme';

export default function PgWelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* BRAND TOP BAR */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoSymbol}>⬡</Text>
            </View>
            <View>
              <Text style={styles.brandName}>PAYGUARD</Text>
              <Text style={styles.brandSub}>AI PAYMENT FIREWALL</Text>
            </View>
          </View>
          <View style={styles.statusChip}>
            <View style={styles.statusPulse} />
            <Text style={styles.statusText}>RAILS LIVE</Text>
          </View>
        </View>

        {/* HERO TYPOGRAPHY */}
        <View style={styles.heroSection}>
          <View style={styles.defenseBadge}>
            <IconShieldCheck size={12} color={C.risk.safe} />
            <Text style={styles.defenseBadgeText}>POST-QUANTUM PAYMENT SHIELD</Text>
          </View>
          <Text style={styles.heroTitleMain}>Stop fraud</Text>
          <Text style={styles.heroTitleSub}>before rails clear.</Text>
          <Text style={styles.heroDescription}>
            Every QR code and transfer route is inspected by multi-model consensus
            before money moves. Fraudsters are auto-blocked instantly.
          </Text>
        </View>

        {/* FAM-PAY TITANIUM HARDWARE CARD */}
        <View style={styles.cardPreview}>
          <View style={styles.cardGlowBorder}>
            <View style={styles.cardInner}>
              <View style={styles.cardTop}>
                <Text style={styles.cardType}>TITANIUM DEFENSE // ZERO-TRUST</Text>
                <IconZap size={16} color={C.gray.white} />
              </View>

              <View style={styles.cardMetricBox}>
                <Text style={styles.metricLabel}>PRE-FLIGHT FRAUD INTERCEPT</Text>
                <Text style={styles.metricBig}>0.00ms</Text>
                <Text style={styles.metricSub}>SAGA COMPENSATING ROLLBACK</Text>
              </View>

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.cardHolderLabel}>SECURITY PROTOCOL</Text>
                  <Text style={styles.cardHolderName}>MULTI-MODEL CONSENSUS</Text>
                </View>
                <View style={styles.trustScorePill}>
                  <Text style={styles.trustScoreNum}>100%</Text>
                  <Text style={styles.trustScoreLabel}>SHIELD</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* THREE CORE GROUNDED VALUE PROPS */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <IconQrCode size={18} color={C.gray.white} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Deep QR Optical Scan</Text>
              <Text style={styles.featureDesc}>
                Decodes recipient bank routes and checks account history against live threat databases in under 300ms.
              </Text>
            </View>
          </View>

          <View style={styles.featureDivider} />

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <IconCpu size={18} color={C.gray.white} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Dual AI Consensus Engine</Text>
              <Text style={styles.featureDesc}>
                OpenAI + Anthropic parallel risk heuristics evaluate velocity, deviation, and known phishing patterns.
              </Text>
            </View>
          </View>

          <View style={styles.featureDivider} />

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <IconShieldCheck size={18} color={C.risk.safe} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Automated Threat Quarantine</Text>
              <Text style={styles.featureDesc}>
                Flagged bad actors trigger a hard-lock protocol, freezing the transaction before authorization occurs.
              </Text>
            </View>
          </View>
        </View>

        {/* PRIMARY CTA & DEMO ACCESS */}
        <View style={styles.ctaContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => router.push('/(auth)/pg-login')}
            accessibilityRole="button"
            accessibilityLabel="Authenticate identity"
          >
            <Text style={styles.primaryBtnText}>Launch Terminal</Text>
            <IconArrowRight size={18} color={C.gray.black} strokeWidth={2.5} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={() => router.push('/(auth)/pg-register')}
            accessibilityRole="button"
            accessibilityLabel="Create keypair identity"
          >
            <Text style={styles.secondaryBtnText}>Create New Identity Keypair</Text>
          </Pressable>

          <Text style={styles.trustDisclaimer}>
            Simulated payment rails · No fiat custody · Instant local demo sandbox
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
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.gray.card,
    borderWidth: 1.5,
    borderColor: C.gray.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSymbol: {
    color: C.gray.white,
    fontSize: 16,
    fontWeight: '900',
  },
  brandName: {
    color: C.gray.white,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSub: {
    color: C.gray[600],
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.gray.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: A.white(0.12),
    gap: 6,
  },
  statusPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.risk.safe,
  },
  statusText: {
    color: C.gray.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroSection: {
    marginBottom: 28,
  },
  defenseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: A.safe(0.08),
    borderWidth: 1,
    borderColor: A.safe(0.25),
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  defenseBadgeText: {
    color: C.risk.safe,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitleMain: {
    color: C.gray.white,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  heroTitleSub: {
    color: C.gray[500],
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 48,
    marginBottom: 16,
  },
  heroDescription: {
    color: C.gray[400],
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 340,
  },
  cardPreview: {
    marginBottom: 32,
  },
  cardGlowBorder: {
    backgroundColor: C.gray.black,
    borderRadius: 24,
    padding: 1,
    borderWidth: 1.5,
    borderColor: A.white(0.25),
  },
  cardInner: {
    backgroundColor: C.gray.card,
    borderRadius: 22,
    padding: 24,
    minHeight: 190,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    color: C.gray[600],
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: PayGuardMonoFont,
  },
  cardMetricBox: {
    marginVertical: 16,
  },
  metricLabel: {
    color: C.gray[700],
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  metricBig: {
    color: C.gray.white,
    fontSize: 32,
    fontWeight: '900',
    fontFamily: PayGuardMonoFont,
    letterSpacing: 1,
  },
  metricSub: {
    color: C.risk.safe,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolderLabel: {
    color: C.gray[700],
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardHolderName: {
    color: C.gray[200],
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  trustScorePill: {
    alignItems: 'flex-end',
  },
  trustScoreNum: {
    color: C.gray.white,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: PayGuardMonoFont,
  },
  trustScoreLabel: {
    color: C.gray[600],
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  featuresSection: {
    backgroundColor: C.gray.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: A.white(0.08),
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.gray[925],
    borderWidth: 1,
    borderColor: A.white(0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: C.gray.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDesc: {
    color: C.gray[500],
    fontSize: 12,
    lineHeight: 18,
  },
  featureDivider: {
    height: 1,
    backgroundColor: A.white(0.06),
    marginVertical: 16,
  },
  ctaContainer: {
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.gray.white,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  btnPressed: {
    opacity: 0.75,
  },
  primaryBtnText: {
    color: C.gray.black,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.gray.card,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: A.white(0.16),
  },
  secondaryBtnText: {
    color: C.gray.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  trustDisclaimer: {
    color: C.gray[700],
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
