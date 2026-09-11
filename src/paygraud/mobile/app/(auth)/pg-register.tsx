// Location: app/(auth)/pg-register.tsx
// Pure Black & White Minimalist Keypair Identity Creation Screen
// Aligned with anti-ui-slop principles: clear form states, zero emoji slop, instant demo access

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
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
  IconArrowLeft,
  IconArrowRight,
  IconShieldCheck,
  IconEye,
  IconEyeOff,
} from '@/components/icons/PayGuardIcons';
import { usePayGuardAuth } from '@/hooks/usePayGuardSession';
import { DEMO_CREDENTIALS } from '@/constants/apiConfig';
import { PayGuardColors as C, PayGuardAlpha as A } from '@/constants/payGuardTheme';

type RegisterFormData = {
  fullName: string;
  emailAddress: string;
  password: string;
};

export default function PgRegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { login, register, error: authError } = usePayGuardAuth();

  useEffect(() => {
    if (authError) setApiError(authError);
  }, [authError]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      fullName: '',
      emailAddress: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Real backend register (POST /auth/register) then auto-login.
      // Navigates to the dashboard on success; errors surface via authError.
      await register({
        fullName: data.fullName,
        emailAddress: data.emailAddress,
        password: data.password,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // "Demo" onboarding signs into the shared demo account (no mock identity —
  // the session must be a real backend session so API calls are authenticated).
  const onDemoRegister = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      await login(DEMO_CREDENTIALS);
    } catch {
      setApiError('Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
          <View style={styles.securityPill}>
            <IconShieldCheck size={12} color={C.risk.safe} />
            <Text style={styles.securityPillText}>ZERO-KNOWLEDGE</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Identity</Text>
            <Text style={styles.headerSubtitle}>
              Mint a decentralized 256-bit security keypair for protected payment rails.
            </Text>
          </View>

          <View style={styles.card}>
            {apiError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>✕ {apiError}</Text>
              </View>
            )}

            {/* FULL NAME FIELD */}
            <Controller
              control={control}
              name="fullName"
              rules={{ required: 'Legal name or alias is required' }}
              render={({ field: { onChange, value, onBlur } }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>IDENTITY ALIAS</Text>
                  <View
                    style={[
                      styles.inputBox,
                      errors.fullName && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Alex Chen"
                      placeholderTextColor={C.gray[700]}
                      autoCapitalize="words"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </View>
                  {errors.fullName && (
                    <Text style={styles.errorText}>{errors.fullName.message}</Text>
                  )}
                </View>
              )}
            />

            {/* EMAIL FIELD */}
            <Controller
              control={control}
              name="emailAddress"
              rules={{
                required: 'Email address is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              }}
              render={({ field: { onChange, value, onBlur } }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>COMMUNICATION NODE (EMAIL)</Text>
                  <View
                    style={[
                      styles.inputBox,
                      errors.emailAddress && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="alex@payguard.ai"
                      placeholderTextColor={C.gray[700]}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </View>
                  {errors.emailAddress && (
                    <Text style={styles.errorText}>
                      {errors.emailAddress.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* PASSWORD FIELD */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Passphrase is required',
                minLength: {
                  value: 8,
                  message: 'Passphrase must be at least 8 characters',
                },
              }}
              render={({ field: { onChange, value, onBlur } }) => (
                <View style={styles.field}>
                  <Text style={styles.label}>MASTER PASSPHRASE</Text>
                  <View
                    style={[
                      styles.inputBox,
                      errors.password && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••••••"
                      placeholderTextColor={C.gray[700]}
                      secureTextEntry={!showPassword}
                      autoComplete="password-new"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      style={styles.eyeBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityRole="button"
                    >
                      {showPassword ? (
                        <IconEyeOff size={18} color={C.gray[500]} />
                      ) : (
                        <IconEye size={18} color={C.gray[500]} />
                      )}
                    </Pressable>
                  </View>
                  {errors.password && (
                    <Text style={styles.errorText}>{errors.password.message}</Text>
                  )}
                </View>
              )}
            />

            {/* MINT BUTTON */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <View style={styles.btnContentRow}>
                  <Text style={styles.primaryBtnText}>Mint Security Keypair</Text>
                  <IconArrowRight size={16} color="#000000" strokeWidth={2.4} />
                </View>
              )}
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* DEMO BUTTON */}
            <Pressable
              style={({ pressed }) => [
                styles.demoBtn,
                pressed && styles.btnPressed,
              ]}
              onPress={onDemoRegister}
              accessibilityRole="button"
            >
              <Text style={styles.demoBtnText}>INSTANT MOCK ONBOARDING</Text>
            </Pressable>
            <Text style={styles.demoNote}>
              Generates a verified demo identity with mock transaction telemetry
            </Text>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already possess a keypair? </Text>
            <Link href="/(auth)/pg-login" asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.loginLink}>Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: A.safe(0.08),
    borderWidth: 1,
    borderColor: A.safe(0.25),
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  securityPillText: {
    color: C.risk.safe,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  header: {
    width: '100%',
    maxWidth: 420,
    marginBottom: 24,
  },
  headerTitle: {
    color: C.gray.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSubtitle: {
    color: C.gray[500],
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: C.gray.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: A.white(0.12),
  },
  errorBanner: {
    backgroundColor: A.danger(0.1),
    borderWidth: 1,
    borderColor: C.risk.critical,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    color: C.risk.critical,
    fontSize: 12,
    fontWeight: '600',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: C.gray[600],
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface.elevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: A.white(0.1),
    paddingHorizontal: 14,
    height: 50,
  },
  inputError: {
    borderColor: C.risk.critical,
  },
  input: {
    flex: 1,
    color: C.gray.white,
    fontSize: 14,
  },
  eyeBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: C.risk.critical,
    fontSize: 10,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: C.gray.white,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: C.gray.black,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: A.white(0.08),
  },
  dividerText: {
    color: C.gray[700],
    fontSize: 10,
  },
  demoBtn: {
    backgroundColor: C.gray[925],
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: A.white(0.2),
  },
  demoBtnText: {
    color: C.gray.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  demoNote: {
    color: C.gray[700],
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    color: C.gray[600],
    fontSize: 12,
  },
  loginLink: {
    color: C.gray.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

