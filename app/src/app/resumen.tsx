import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText, PillButton } from '@/components/ui';
import { Colors } from '@/constants/theme';

/** Provisional: lo sustituye el resumen semanal vertical para compartir. */
export default function WeeklySummaryScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: Colors.nightDeep }}>
      <AppText variant="display">Resumen</AppText>
      <PillButton label="Cerrar" onPress={() => router.back()} />
    </View>
  );
}
