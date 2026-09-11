// Location: app/(auth)/pg-login.tsx
// PayGuard Login Screen — fully built with form validation & demo mode

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import {
  PayGuardColors,
  PayGuardSpacing,
  PayGuardFontSize,
  PayGuardBorderRadius,
  PayGuardFontWeight,
} from '@/constants/payGuardTheme';
import { usePayGuardSession } from '@/store/payGuardSessionStore';
import { MOCK_IDENTITY } from '@/utils/mockData';

// ─── FORM SCHEMA ──────────────────────────────
// What data the login form collects
type LoginFormData = {
  emailAddress: string;
  password: string;
};

// ─── SHIELD LOGO (pure View-based, no image needed) ─────
function ShieldLogo() {
  return (
    <View style={styles.logoContainer}>
      {/* Outer glow ring */}
      <View style={styles.logoGlow} />
      {/* Shield shape */}
      <View style={styles.logoShield}>
        <Text style={styles.logoIcon}>🛡️</Text>
      </View>
      <Text style={styles.logoTitle}>PayGuard</Text>
      <Text style={styles.logoSubtitle}>Secure Payment Intelligence</Text>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────
export default function PgLoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { authenticateIdentity } = usePayGuardSession();

  const {
    control,      // connects inputs to the form
    handleSubmit, // wraps our submit function with validation
    formState: { errors }, // contains validation errors per field
  } = useForm<LoginFormData>({
    defaultValues: { emailAddress: '', password: '' },
  });

  // ─── REAL LOGIN (hits backend) ──────────────
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // TODO: swap this with real API call when backend is ready:
      // const response = await PayGuardNetworkClient.login(data);
      // authenticateIdentity({ ...response.identity, token: response.accessToken });

      // For now — simulate a network call
      await new Promise((r) => setTimeout(r, 1200));
      throw new Error('Backend not connected yet. Use Demo Mode below.');
    } catch (e: any) {
      setApiError(e.message ?? 'Login failed. Check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── DEMO LOGIN (no backend needed) ─────────
  // WHY: For the hackathon demo, judges will tap this button
  // to skip auth and go straight to the dashboard with mock data.
  const onDemoLogin = () => {
    authenticateIdentity(MOCK_IDENTITY); // put demo user in Zustand store
    router.replace('/(tabs)/pg-dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // iOS: move screen up when keyboard opens
        // Android: handled natively
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── LOGO ── */}
          <ShieldLogo />

          {/* ── FORM CARD ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>
              Sign in to your PayGuard account
            </Text>

            {/* ── API ERROR ── */}
            {apiError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {apiError}</Text>
              </View>
            )}

            {/* ── EMAIL FIELD ── */}
            {/* Controller connects the TextInput to react-hook-form */}
            <Controller
              control={control}
              name="emailAddress"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              }}
              render={({ field: { onChange, value, onBlur } }) => (
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <View
                    style={[
                      styles.inputRow,
                      errors.emailAddress && styles.inputRowError,
                    ]}
                  >
                    <Text style={styles.inputIcon}>✉️</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      placeholderTextColor={PayGuardColors.text.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </View>
                  {errors.emailAddress && (
                    <Text style={styles.fieldError}>
                      {errors.emailAddress.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* ── PASSWORD FIELD ── */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              }}
              render={({ field: { onChange, value, onBlur } }) => (
                <View style={styles.fieldWrapper}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.fieldLabel}>Password</Text>
                    <TouchableOpacity>
                      <Text style={styles.forgotLink}>Forgot?</Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      styles.inputRow,
                      errors.password && styles.inputRowError,
                    ]}
                  >
                    <Text style={styles.inputIcon}>🔒</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor={PayGuardColors.text.muted}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                    {/* Show / hide password toggle */}
                    <TouchableOpacity
                      onPress={() => setShowPassword((v) => !v)}
                      style={styles.eyeButton}
                    >
                      <Text style={styles.eyeIcon}>
                        {showPassword ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {errors.password && (
                    <Text style={styles.fieldError}>
                      {errors.password.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* ── SIGN IN BUTTON ── */}
            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && styles.primaryBtnDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* ── DIVIDER ── */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ── DEMO MODE BUTTON (hackathon) ── */}
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={onDemoLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.demoBtnIcon}>⚡</Text>
              <Text style={styles.demoBtnText}>Continue in Demo Mode</Text>
            </TouchableOpacity>
            <Text style={styles.demoNote}>
              Loads mock data — no backend needed
            </Text>
          </View>

          {/* ── REGISTER LINK ── */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>New to PayGuard? </Text>
            <Link href="/(auth)/pg-register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Create account</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* ── SECURITY BADGE ── */}
          <View style={styles.securityBadge}>
            <Text style={styles.securityBadgeText}>
              🔐 256-bit encrypted · AI-powered fraud detection
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PayGuardColors.background.dark,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: PayGuardSpacing.lg,
    paddingBottom: PayGuardSpacing.xl,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginTop: PayGuardSpacing.xxl,
    marginBottom: PayGuardSpacing.xl,
  },
  logoGlow: {
    position: 'absolute',
    top: -10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: PayGuardColors.brand.primary,
    opacity: 0.12,
  },
  logoShield: {
    width: 72,
    height: 72,
    borderRadius: PayGuardBorderRadius.xl,
    backgroundColor: PayGuardColors.background.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: PayGuardColors.brand.primary,
    marginBottom: PayGuardSpacing.md,
  },
  logoIcon: { fontSize: 34 },
  logoTitle: {
    color: PayGuardColors.text.primary,
    fontSize: PayGuardFontSize.xxl,
    fontWeight: PayGuardFontWeight.extrabold,
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    color: PayGuardColors.text.secondary,
    fontSize: PayGuardFontSize.sm,
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: PayGuardColors.background.card,
    borderRadius: PayGuardBorderRadius.xl,
    padding: PayGuardSpacing.xl,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  cardTitle: {
    color: PayGuardColors.text.primary,
    fontSize: PayGuardFontSize.xl,
    fontWeight: PayGuardFontWeight.bold,
    marginBottom: 4,
  },
  cardSubtitle: {
    color: PayGuardColors.text.secondary,
    fontSize: PayGuardFontSize.sm,
    marginBottom: PayGuardSpacing.lg,
  },

  // Error banner
  errorBanner: {
    backgroundColor: '#2D1515',
    borderWidth: 1,
    borderColor: PayGuardColors.risk.critical,
    borderRadius: PayGuardBorderRadius.md,
    padding: PayGuardSpacing.sm,
    marginBottom: PayGuardSpacing.md,
  },
  errorBannerText: {
    color: PayGuardColors.risk.critical,
    fontSize: PayGuardFontSize.sm,
  },

  // Fields
  fieldWrapper: { marginBottom: PayGuardSpacing.md },
  fieldLabel: {
    color: PayGuardColors.text.secondary,
    fontSize: PayGuardFontSize.sm,
    fontWeight: PayGuardFontWeight.medium,
    marginBottom: 6,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotLink: {
    color: PayGuardColors.brand.primary,
    fontSize: PayGuardFontSize.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PayGuardColors.background.input,
    borderRadius: PayGuardBorderRadius.md,
    borderWidth: 1,
    borderColor: '#2D3748',
    paddingHorizontal: PayGuardSpacing.md,
    height: 52,
  },
  inputRowError: {
    borderColor: PayGuardColors.risk.critical,
  },
  inputIcon: { fontSize: 16, marginRight: PayGuardSpacing.sm },
  input: {
    flex: 1,
    color: PayGuardColors.text.primary,
    fontSize: PayGuardFontSize.md,
  },
  eyeButton: { padding: 4 },
  eyeIcon: { fontSize: 16 },
  fieldError: {
    color: PayGuardColors.risk.critical,
    fontSize: PayGuardFontSize.xs,
    marginTop: 4,
  },

  // Primary button
  primaryBtn: {
    backgroundColor: PayGuardColors.brand.primary,
    borderRadius: PayGuardBorderRadius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: PayGuardSpacing.sm,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: '#fff',
    fontSize: PayGuardFontSize.md,
    fontWeight: PayGuardFontWeight.semibold,
    letterSpacing: 0.3,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: PayGuardSpacing.lg,
    gap: PayGuardSpacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1F2937',
  },
  dividerText: {
    color: PayGuardColors.text.muted,
    fontSize: PayGuardFontSize.sm,
  },

  // Demo button
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A2035',
    borderRadius: PayGuardBorderRadius.md,
    height: 52,
    borderWidth: 1,
    borderColor: PayGuardColors.brand.accent,
    gap: PayGuardSpacing.sm,
  },
  demoBtnIcon: { fontSize: 18 },
  demoBtnText: {
    color: PayGuardColors.brand.accent,
    fontSize: PayGuardFontSize.md,
    fontWeight: PayGuardFontWeight.semibold,
  },
  demoNote: {
    color: PayGuardColors.text.muted,
    fontSize: PayGuardFontSize.xs,
    textAlign: 'center',
    marginTop: 6,
  },

  // Register row
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: PayGuardSpacing.lg,
  },
  registerText: {
    color: PayGuardColors.text.secondary,
    fontSize: PayGuardFontSize.sm,
  },
  registerLink: {
    color: PayGuardColors.brand.primary,
    fontSize: PayGuardFontSize.sm,
    fontWeight: PayGuardFontWeight.semibold,
  },

  // Security badge
  securityBadge: {
    marginTop: PayGuardSpacing.xl,
    paddingHorizontal: PayGuardSpacing.md,
    paddingVertical: PayGuardSpacing.sm,
    borderRadius: PayGuardBorderRadius.full,
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  securityBadgeText: {
    color: PayGuardColors.text.muted,
    fontSize: PayGuardFontSize.xs,
    textAlign: 'center',
  },
});
