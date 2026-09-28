import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText, PillButton } from '@/components/ui';
import { Colors } from '@/constants/theme';

/** Provisional: lo sustituye el paywall de Lumi Plus. */
export default function PlusScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: Colors.night }}>
      <AppText variant="display">Lumi Plus</AppText>
      <PillButton label="Cerrar" onPress={() => router.back()} />
    </View>
  );
}
