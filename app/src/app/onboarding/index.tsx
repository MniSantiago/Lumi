import { View } from 'react-native';

import { AppText, PillButton } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useLumi } from '@/lumi/store';

/** Provisional: lo sustituye el flujo de onboarding. */
export default function OnboardingStart() {
  const { updateSettings } = useLumi();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: Colors.night }}>
      <AppText variant="display">Hola</AppText>
      <PillButton label="Empezar" onPress={() => updateSettings({ onboarded: true })} />
    </View>
  );
}
