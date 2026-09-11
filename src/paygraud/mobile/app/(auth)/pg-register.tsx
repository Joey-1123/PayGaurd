// Location: app/(auth)/pg-register.tsx
// PayGuard Registration Screen — new account creation
// TODO: Wire up to PayGuardNetworkClient

import { View, Text, StyleSheet } from 'react-native';
import { PayGuardColors } from '@/constants/payGuardTheme';

export default function PgRegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>PayGuard Registration — Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PayGuardColors.background.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: PayGuardColors.text.primary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: PayGuardColors.text.secondary,
    fontSize: 15,
    marginTop: 8,
  },
});
