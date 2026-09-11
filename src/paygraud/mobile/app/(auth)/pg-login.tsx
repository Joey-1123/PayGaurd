// Location: app/(auth)/pg-login.tsx
// Pure Black & White Minimalist Login Screen

import { useState } from 'react';
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
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconShieldCheck,
} from '@/components/icons/PayGuardIcons';
import { usePayGuardSession } from '@/store/payGuardSessionStore';
import { MOCK_IDENTITY } from '@/utils/mockData';

type LoginFormData = {
  emailAddress: string;
  password: string;
};

export default function PgLoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { authenticateIdentity } = usePayGuardSession();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { emailAddress: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      throw new Error('Local backend offline. Tap Demo Mode below.');
    } catch (e: any) {
      setApiError(e.message ?? 'Login failed. Check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDemoLogin = () => {
    authenticateIdentity(MOCK_IDENTITY);
    router.replace('/(tabs)/pg-dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* MINIMALIST BRAND HEADER */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoSymbol}>⬡</Text>
            </View>
            <Text style={styles.brandTitle}>PAYGUARD</Text>
            <Text style={styles.brandSub}>SECURE PAYMENT RAILS // AI DEFENSE</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Authenticate your identity to begin session
            </Text>

            {apiError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>✕ {apiError}</Text>
              </View>
            )}

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
                <View style={styles.field}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <View
                    style={[
                      styles.inputBox,
                      errors.emailAddress && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="alex@payguard.ai"
                      placeholderTextColor="#555555"
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
                <View style={styles.field}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <Pressable hitSlop={8}>
                      <Text style={styles.forgotLink}>Reset Key?</Text>
                    </Pressable>
                  </View>
                  <View
                    style={[
                      styles.inputBox,
                      errors.password && styles.inputError,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#555555"
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      style={styles.eyeBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <IconEyeOff size={18} color="#888888" />
                      ) : (
                        <IconEye size={18} color="#888888" />
                      )}
                    </Pressable>
                  </View>
                  {errors.password && (
                    <Text style={styles.errorText}>
                      {errors.password.message}
                    </Text>
                  )}
                </View>
              )}
            />

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
                  <Text style={styles.primaryBtnText}>Authenticate</Text>
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
              onPress={onDemoLogin}
              accessibilityRole="button"
            >
              <Text style={styles.demoBtnText}>CONTINUE IN DEMO MODE</Text>
            </Pressable>
            <Text style={styles.demoNote}>
              Bypasses server & initializes mock financial telemetry
            </Text>
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>No Keypair? </Text>
            <Link href="/(auth)/pg-register" asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.registerLink}>Create Identity</Text>
              </Pressable>
            </Link>
          </View>

          <View style={styles.securityFooter}>
            <Text style={styles.securityText}>
              256-BIT POST-QUANTUM ENCRYPTION · AUTO-DEFENSE SAGA
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0C0C0C',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoSymbol: {
    color: '#FFFFFF',
    fontSize: 26,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
  },
  brandSub: {
    color: '#666666',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0C0C0C',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 42, 42, 0.1)',
    borderWidth: 1,
    borderColor: '#FF2A2A',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#FF2A2A',
    fontSize: 12,
    fontWeight: '600',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#666666',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotLink: {
    color: '#AAAAAA',
    fontSize: 10,
    fontWeight: 'bold',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    height: 50,
  },
  inputError: {
    borderColor: '#FF2A2A',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  eyeBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF2A2A',
    fontSize: 10,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnPressed: {
    opacity: 0.75,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#000000',
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    color: '#555555',
    fontSize: 10,
  },
  demoBtn: {
    backgroundColor: '#161616',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  demoBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  demoNote: {
    color: '#555555',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#666666',
    fontSize: 12,
  },
  registerLink: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  securityFooter: {
    marginTop: 28,
  },
  securityText: {
    color: '#444444',
    fontSize: 9,
    letterSpacing: 1,
  },
});
