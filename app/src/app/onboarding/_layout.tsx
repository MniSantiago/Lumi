import { Stack } from 'expo-router';

import { OnboardingDraftProvider } from '@/components/onboarding/draft';
import { Colors } from '@/constants/theme';

/**
 * Onboarding en tres pasos (BRIEF.md, sección 4). Las respuestas viven en el
 * borrador hasta "Despertar a Lumi"; entonces se guardan de una vez y el
 * Stack.Protected del layout raíz lleva a las pestañas.
 */
export default function OnboardingLayout() {
  return (
    <OnboardingDraftProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.nightDeep } }} />
    </OnboardingDraftProvider>
  );
}
