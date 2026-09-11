// Location: app/(tabs)/pg-preferences.tsx
// PayGuard Preferences — Security settings, BioAuth toggle, session management
// TODO: Wire up usePayGuardSession, usePayGuardBioAuth

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PayGuardColors, PayGuardSpacing } from '@/constants/payGuardTheme';

export default function PgPreferencesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.placeholder}>Preferences — Coming Soon</Text>
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
