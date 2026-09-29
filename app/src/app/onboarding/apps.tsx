import { router, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { List, SelectRow } from '@/components/onboarding/controls';
import { useLumiName, useOnboardingDraft } from '@/components/onboarding/draft';
import { StepShell } from '@/components/onboarding/step-shell';
import { ThiefAppsPicker } from '@/components/thief-apps-picker';
import { AppText } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { THIEF_APP_CATALOG } from '@/lumi/data';
import { realScreenTime } from '@/screen-time';
import { thiefAppsCount } from '@/screen-time/native';

/**
 * Paso 2: apps ladronas. Maqueta del `FamilyActivityPicker` de Apple, que es
 * quien las elige de verdad en el iPhone.
 */
export default function ThiefAppsStep() {
  const { draft, setDraft } = useOnboardingDraft();
  const lumiName = useLumiName();
  const selected = new Set(draft.thiefApps);
  // Con Screen Time de verdad elige el selector de Apple; si no, la maqueta.
  const [nativeCount, setNativeCount] = useState(() => (realScreenTime ? thiefAppsCount() : 0));
  const count = realScreenTime ? nativeCount : selected.size;

  const toggle = (id: string) =>
    setDraft({
      // Mantiene el orden del catálogo, como lo enseña Ajustes.
      thiefApps: THIEF_APP_CATALOG.filter((a) => (a.id === id ? !selected.has(id) : selected.has(a.id))).map((a) => a.id),
    });

  return (
    <StepShell
      step={2}
      title="Apps ladronas"
      subtitle={`Son las que le roban la luz a ${lumiName}. No pasa nada por usarlas: solo se cansa un poquito.`}
      cta={{
        label: 'Continuar',
        disabled: count === 0,
        hint: count === 0 ? 'Elige al menos una para seguir' : `${count} ${count === 1 ? 'app elegida' : 'apps elegidas'}`,
        onPress: () => router.push('/onboarding/limite' as Href),
      }}>
      {realScreenTime ? (
        <ThiefAppsPicker lumiName={lumiName} onChange={setNativeCount} />
      ) : (
        <MockThiefApps selected={selected} onToggle={toggle} lumiName={lumiName} />
      )}
    </StepShell>
  );
}

/** Maqueta del `FamilyActivityPicker` (Expo Go y web): una lista fija de apps. */
function MockThiefApps({
  selected,
  onToggle,
  lumiName,
}: {
  selected: Set<string>;
  onToggle: (id: string) => void;
  lumiName: string;
}) {
  return (
    <>
      <View style={{ gap: 10 }}>
        <AppText variant="label">¿Cuáles te roban más tiempo?</AppText>
        <List>
          {THIEF_APP_CATALOG.map((app, i) => (
            <SelectRow
              key={app.id}
              app={app}
              selected={selected.has(app.id)}
              onToggle={() => onToggle(app.id)}
              last={i === THIEF_APP_CATALOG.length - 1}
            />
          ))}
        </List>
      </View>

      <View style={styles.privacy}>
        <SymbolView name="lock.fill" size={15} tintColor={Colors.lavender} style={{ marginTop: 2 }} />
        <Text style={styles.privacyText}>
          En tu iPhone, esta lista será el selector de Apple. {lumiName} solo se entera de cuándo te acercas a tu
          límite, nunca de lo que haces dentro de las apps.
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  privacy: { flexDirection: 'row', gap: 10, paddingHorizontal: 6 },
  privacyText: { flex: 1, fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.textTertiary },
});
