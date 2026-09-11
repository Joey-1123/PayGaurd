// Location: app/(tabs)/pg-threat-center.tsx
// PayGuard Threat Center — Security alerts categorized by severity
// TODO: Wire up usePayGuardThreats, useThreatIntelligence

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PayGuardColors, PayGuardSpacing } from '@/constants/payGuardTheme';

export default function PgThreatCenterScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Threat Center</Text>
        <Text style={styles.subtitle}>Active Security Alerts</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.placeholder}>Threat Feed — Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PayGuardColors.background.dark },
  header: { paddingHorizontal: PayGuardSpacing.lg, paddingTop: PayGuardSpacing.md },
  title: { color: PayGuardColors.text.primary, fontSize: 22, fontWeight: '700' },
  subtitle: { color: PayGuardColors.text.secondary, fontSize: 13, marginTop: 2 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholder: { color: PayGuardColors.text.muted, fontSize: 15 },
});
