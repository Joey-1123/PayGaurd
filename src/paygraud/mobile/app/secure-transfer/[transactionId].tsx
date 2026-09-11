// Location: app/secure-transfer/[transactionId].tsx
// PayGuard Transaction Detail — shows full risk report for a specific transfer
// TODO: Wire up PayGuardNetworkClient.getTransferById

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { PayGuardColors, PayGuardSpacing } from '@/constants/payGuardTheme';

export default function TransactionDetailScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction Detail</Text>
        <Text style={styles.id}>ID: {transactionId}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.placeholder}>Transaction Detail — Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PayGuardColors.background.dark },
  header: { paddingHorizontal: PayGuardSpacing.lg, paddingTop: PayGuardSpacing.md },
  title: { color: PayGuardColors.text.primary, fontSize: 22, fontWeight: '700' },
  id: { color: PayGuardColors.text.muted, fontSize: 12, marginTop: 4 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { color: PayGuardColors.text.muted, fontSize: 15 },
});
