// Location: app/(auth)/pg-login.tsx
// PayGuard Login Screen — credentials + biometric login
// TODO: Wire up to PayGuardNetworkClient and PayGuardBioAuthEngine

import { View, Text, StyleSheet } from 'react-native';
import { PayGuardColors } from '@/constants/payGuardTheme';

export default function PgLoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PayGuard</Text>
      <Text style={styles.subtitle}>Secure Login — Coming Soon</Text>
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
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: PayGuardColors.text.secondary,
    fontSize: 15,
    marginTop: 8,
  },
});
