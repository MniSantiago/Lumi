import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import { NativeAppsPanel, pickedCountLabel, thiefAppsTitle, useNativeApps } from '@/components/native-apps';
import { List, SelectRow } from '@/components/onboarding/controls';
import { closeSheet, Sheet } from '@/components/sheet';
import { Colors, Fonts } from '@/constants/theme';
import { THIEF_APP_CATALOG } from '@/lumi/data';
import { useLumi } from '@/lumi/store';
import { useParental } from '@/parental/store';
import { tr } from '@/i18n';
import { screenTimeControl } from '@/screen-time/control';

/**
 * Editar las apps ladronas desde Ajustes. Es lo mismo que en el onboarding: el
 * selector de Apple en un iPhone y la maqueta con el catálogo en Expo Go y en web.
 */
export default function ThiefAppsSheet() {
  const parental = useParental();
  // Con PIN parental, esta hoja no se abre sin él (tampoco por un enlace o el tutorial).
  const { loaded, locked, protect } = parental;
  useEffect(() => {
    if (loaded && locked) {
      closeSheet();
      protect(() => router.push('/apps'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `protect` cambia en cada render; solo importa cuándo se bloquea
  }, [loaded, locked]);
  if (parental.locked) return null;
  return screenTimeControl.available ? <NativeThiefAppsSheet /> : <MockThiefAppsSheet />;
}

function NativeThiefAppsSheet() {
  const { settings } = useLumi();
  const native = useNativeApps();
  const name = settings.lumiName;

  return (
    <Sheet
      title={thiefAppsTitle}
      subtitle={tr({
        es: `Las que le roban la luz a ${name}. Los cambios se guardan solos.`,
        en: `The ones that steal ${name}’s light. Changes save automatically.`,
        zh: `偷走${name}的光的 App。修改会自动保存。`,
        hi: `जो ${name} की रोशनी चुराती हैं। बदलाव अपने आप सहेजे जाते हैं।`,
        fr: `Celles qui volent la lumière de ${name}. Les changements s’enregistrent tout seuls.`,
      })}>
      <NativeAppsPanel native={native} />
      {native.total > 0 ? (
        <Text style={styles.note} accessibilityLiveRegion="polite">
          {pickedCountLabel(native.total)}
        </Text>
      ) : null}
    </Sheet>
  );
}

function MockThiefAppsSheet() {
  const { settings, updateSettings } = useLumi();
  const name = settings.lumiName;
  const selected = new Set(settings.thiefApps);
  const count = selected.size;

  const toggle = (id: string) => {
    // Siempre queda al menos una: sin apps ladronas, Lampi no tendría nada que medir.
    if (count === 1 && selected.has(id)) return;
    updateSettings({
      thiefApps: THIEF_APP_CATALOG.filter((a) => (a.id === id ? !selected.has(id) : selected.has(a.id))).map(
        (a) => a.id,
      ),
    });
  };

  return (
    <Sheet
      title={tr({
        es: 'Apps ladronas',
        en: 'Thief apps',
        zh: '偷时间的 App',
        hi: 'चोर ऐप्स',
        fr: 'Applis voleuses',
      })}
      subtitle={tr({
        es: `Las que le roban la luz a ${name}. Los cambios se guardan solos.`,
        en: `The ones that steal ${name}’s light. Changes save automatically.`,
        zh: `偷走${name}的光的 App。修改会自动保存。`,
        hi: `जो ${name} की रोशनी चुराती हैं। बदलाव अपने आप सहेजे जाते हैं।`,
        fr: `Celles qui volent la lumière de ${name}. Les changements s’enregistrent tout seuls.`,
      })}>
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
          ? tr({
              es: 'Necesita al menos una. Elige otra antes de quitar esta.',
              en: 'She needs at least one. Pick another before removing this one.',
              zh: '至少需要一个。先选另一个再移除这个。',
              hi: 'कम से कम एक चाहिए। इसे हटाने से पहले कोई और चुनो।',
              fr: 'Il en faut au moins une. Choisis-en une autre avant d’enlever celle-ci.',
            })
          : tr({
              es: `${count} apps elegidas. En tu iPhone, esta lista será el selector de Apple.`,
              en: `${count} apps picked. On your iPhone, this list will be Apple’s picker.`,
              zh: `已选 ${count} 个 App。在你的 iPhone 上，这个列表会是 Apple 的选择器。`,
              hi: `${count} ऐप्स चुनीं। तुम्हारे iPhone पर यह सूची Apple का चयनकर्ता होगी।`,
              fr: `${count} applis choisies. Sur ton iPhone, cette liste sera le sélecteur d’Apple.`,
            })}
      </Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  note: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.textTertiary, paddingHorizontal: 6 },
});
