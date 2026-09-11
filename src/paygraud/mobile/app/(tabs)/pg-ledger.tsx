// Location: app/(tabs)/pg-ledger.tsx
// PayGuard Ledger — Full transaction history with status indicators
// TODO: Wire up usePayGuardLedger

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PayGuardColors, PayGuardSpacing } from '@/constants/payGuardTheme';

export default function PgLedgerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Ledger</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.placeholder}>Transaction History — Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PayGuardColors.background.dark },
  header: { paddingHorizontal: PayGuardSpacing.lg, paddingTop: PayGuardSpacing.md },
  title: { color: PayGuardColors.text.primary, fontSize: 22, fontWeight: '700' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { color: PayGuardColors.text.muted, fontSize: 15 },
});
