import { StyleSheet, Text } from 'react-native';

import { List, SelectRow } from '@/components/onboarding/controls';
import { Sheet } from '@/components/sheet';
import { Colors, Fonts } from '@/constants/theme';
import { THIEF_APP_CATALOG } from '@/lumi/data';
import { useLumi } from '@/lumi/store';

/**
 * Editar las apps ladronas desde Ajustes. Es la misma lista del onboarding
 * (maqueta del `FamilyActivityPicker`); cada toque se guarda al momento.
 */
export default function ThiefAppsSheet() {
  const { settings, updateSettings } = useLumi();
  const name = settings.lumiName;
  const selected = new Set(settings.thiefApps);
  const count = selected.size;

  const toggle = (id: string) => {
    // Siempre queda al menos una: sin apps ladronas, Lumi no tendría nada que medir.
    if (count === 1 && selected.has(id)) return;
    updateSettings({
      thiefApps: THIEF_APP_CATALOG.filter((a) => (a.id === id ? !selected.has(id) : selected.has(a.id))).map((a) => a.id),
    });
  };

  return (
    <Sheet title="Apps ladronas" subtitle={`Las que le roban la luz a ${name}. Los cambios se guardan solos.`}>
      <List>
        {THIEF_APP_CATALOG.map((app, i) => (
          <SelectRow
            key={app.id}
            app={app}
            selected={selected.has(app.id)}
            onToggle={() => toggle(app.id)}
            last={i === THIEF_APP_CATALOG.length - 1}
          />
        ))}
      </List>
      <Text style={styles.note} accessibilityLiveRegion="polite">
        {count === 1
          ? 'Necesita al menos una. Elige otra antes de quitar esta.'
          : `${count} apps elegidas. En tu iPhone, esta lista será el selector de Apple.`}
      </Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  note: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.textTertiary, paddingHorizontal: 6 },
});
