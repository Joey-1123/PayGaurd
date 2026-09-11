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
            <IconShieldCheck size={12} color="#00FF66" />
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
                <IconZap size={16} color="#FFFFFF" />
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
              <IconQrCode size={18} color="#FFFFFF" />
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
              <IconCpu size={18} color="#FFFFFF" />
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
              <IconShieldCheck size={18} color="#00FF66" />
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
            <IconArrowRight size={18} color="#000000" strokeWidth={2.5} />
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
    backgroundColor: '#000000',
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
    backgroundColor: '#0C0C0C',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSymbol: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSub: {
    color: '#666666',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C0C0C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    gap: 6,
  },
  statusPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF66',
  },
  statusText: {
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  defenseBadgeText: {
    color: '#00FF66',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroTitleMain: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  heroTitleSub: {
    color: '#888888',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 48,
    marginBottom: 16,
  },
  heroDescription: {
    color: '#AAAAAA',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 340,
  },
  cardPreview: {
    marginBottom: 32,
  },
  cardGlowBorder: {
    backgroundColor: '#000000',
    borderRadius: 24,
    padding: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardInner: {
    backgroundColor: '#0C0C0C',
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
    color: '#666666',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardMetricBox: {
    marginVertical: 16,
  },
  metricLabel: {
    color: '#777777',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  metricBig: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 1,
  },
  metricSub: {
    color: '#00FF66',
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
    color: '#555555',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardHolderName: {
    color: '#DDDDDD',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  trustScorePill: {
    alignItems: 'flex-end',
  },
  trustScoreNum: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  trustScoreLabel: {
    color: '#666666',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  featuresSection: {
    backgroundColor: '#0C0C0C',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDesc: {
    color: '#888888',
    fontSize: 12,
    lineHeight: 18,
  },
  featureDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 16,
  },
  ctaContainer: {
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
  },
  btnPressed: {
    opacity: 0.75,
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0C0C0C',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  trustDisclaimer: {
    color: '#555555',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
