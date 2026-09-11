// Location: app/secure-transfer/pg-initiate.tsx
// PayGuard New Payment Screen — multi-step form with live risk assessment
// TODO: Wire up PayGuardTransferForm, PayGuardRiskMeter, PayGuardNetworkClient

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PayGuardColors, PayGuardSpacing } from '@/constants/payGuardTheme';

export default function PgInitiateTransferScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Send Payment</Text>
        <Text style={styles.subtitle}>Secured by PayGuard Shield</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.placeholder}>Transfer Form — Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PayGuardColors.background.dark },
  header: { paddingHorizontal: PayGuardSpacing.lg, paddingTop: PayGuardSpacing.md },
  title: { color: PayGuardColors.text.primary, fontSize: 22, fontWeight: '700' },
  subtitle: { color: PayGuardColors.brand.accent, fontSize: 13, marginTop: 2 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { color: PayGuardColors.text.muted, fontSize: 15 },
});
