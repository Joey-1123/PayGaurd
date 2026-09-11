// Location: app/(tabs)/pg-dashboard.tsx
// PayGuard Dashboard — Security Pulse, Recent Transfers, Alerts Summary
// TODO: Wire up usePayGuardLedger, usePayGuardThreats

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PayGuardColors, PayGuardSpacing } from '@/constants/payGuardTheme';

export default function PgDashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>PayGuard</Text>
        <Text style={styles.headerSub}>Security Dashboard</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.placeholder}>Dashboard — Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PayGuardColors.background.dark },
  header: { paddingHorizontal: PayGuardSpacing.lg, paddingTop: PayGuardSpacing.md },
  brand: { color: PayGuardColors.brand.primary, fontSize: 22, fontWeight: '700' },
  headerSub: { color: PayGuardColors.text.secondary, fontSize: 13, marginTop: 2 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { color: PayGuardColors.text.muted, fontSize: 15 },
});
