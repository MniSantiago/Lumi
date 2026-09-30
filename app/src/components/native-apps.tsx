import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SelectedAppsView, SELECTED_APP_ROW_HEIGHT } from '../../modules/lampi-screen-time';
import { List } from '@/components/onboarding/controls';
import { PillButton, TextLink } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { tr } from '@/i18n';
import { useLumi } from '@/lumi/store';
import { screenTimeControl } from '@/screen-time/control';

export const thiefAppsTitle = tr({
  es: 'Apps ladronas',
  en: 'Thief apps',
  zh: '偷时间的 App',
  hi: 'चोर ऐप्स',
  fr: 'Applis voleuses',
});

/** «3 apps elegidas», contando apps, categorías y webs del selector de Apple. */
export function pickedCountLabel(count: number) {
  return count === 1
    ? tr({ es: '1 app elegida', en: '1 app picked', zh: '已选 1 个 App', hi: '1 ऐप चुनी', fr: '1 appli choisie' })
    : tr({
        es: `${count} apps elegidas`,
        en: `${count} apps picked`,
        zh: `已选 ${count} 个 App`,
        hi: `${count} ऐप्स चुनीं`,
        fr: `${count} applis choisies`,
      });
}

/**
 * Estado del selector real de Apple (FamilyActivityPicker). Los tokens son opacos:
 * la app solo sabe cuántos hay y deja que Apple dibuje sus nombres e iconos.
 */
export function useNativeApps() {
  const { settings } = useLumi();
  const [summary, setSummary] = useState(() => screenTimeControl.selectionSummary());
  const [status, setStatus] = useState(() => screenTimeControl.authorizationStatus());
  const [revision, setRevision] = useState(0);

  // Al volver a la pantalla (por ejemplo, tras editar en la hoja) se relee.
  useFocusEffect(
    useCallback(() => {
      setSummary(screenTimeControl.selectionSummary());
      setStatus(screenTimeControl.authorizationStatus());
      setRevision((r) => r + 1);
    }, []),
  );

  const pick = useCallback(async () => {
    const result = await screenTimeControl.pickApps({
      title: thiefAppsTitle,
      done: tr({ es: 'Listo', en: 'Done', zh: '完成', hi: 'हो गया', fr: 'Terminé' }),
      cancel: tr({ es: 'Cancelar', en: 'Cancel', zh: '取消', hi: 'रद्द करें', fr: 'Annuler' }),
    });
    setStatus(screenTimeControl.authorizationStatus());
    if (!result) return;
    setSummary(result);
    setRevision((r) => r + 1);
    // Durante el onboarding se configura al terminar; después, al momento.
    if (settings.onboarded) {
      screenTimeControl.configure(settings).catch((e) => console.warn('Screen Time: no se pudo configurar', e));
    }
  }, [settings]);

  const total = summary.apps + summary.categories + summary.webDomains;
  return { status, total, revision, pick };
}

export type NativeApps = ReturnType<typeof useNativeApps>;

/** Las apps elegidas (dibujadas por Apple) y el botón para elegir o cambiar. */
export function NativeAppsPanel({ native }: { native: NativeApps }) {
  const { status, total, revision, pick } = native;

  return (
    <View style={{ gap: 12 }}>
      {total > 0 && SelectedAppsView ? (
        <List>
          <SelectedAppsView revision={revision} style={{ height: total * SELECTED_APP_ROW_HEIGHT, marginHorizontal: 16 }} />
        </List>
      ) : null}

      <View style={styles.actions}>
        <PillButton
          label={
            total > 0
              ? tr({ es: 'Cambiar apps', en: 'Change apps', zh: '更改 App', hi: 'ऐप्स बदलो', fr: 'Changer les applis' })
              : tr({ es: 'Elegir apps', en: 'Pick apps', zh: '选择 App', hi: 'ऐप्स चुनो', fr: 'Choisir les applis' })
          }
          onPress={pick}
        />
      </View>

      {status === 'denied' ? (
        <View style={{ gap: 6, paddingHorizontal: 6 }} accessibilityLiveRegion="polite">
          <Text style={styles.note}>
            {tr({
              es: 'Lampi necesita tu permiso de Tiempo de uso para saber cuándo te acercas a tu límite. Puedes darlo en Ajustes.',
              en: 'Lampi needs your Screen Time permission to know when you’re getting close to your limit. You can allow it in Settings.',
              zh: 'Lampi 需要你的“屏幕使用时间”权限，才能知道你什么时候接近上限。你可以在设置里允许。',
              hi: 'Lampi को तुम्हारी स्क्रीन टाइम की अनुमति चाहिए ताकि वो जान सके कि तुम अपनी सीमा के पास कब पहुँचते हो। तुम इसे सेटिंग्स में दे सकते हो।',
              fr: 'Lampi a besoin de ton autorisation Temps d’écran pour savoir quand tu approches de ta limite. Tu peux la donner dans Réglages.',
            })}
          </Text>
          <TextLink
            label={tr({ es: 'Abrir Ajustes', en: 'Open Settings', zh: '打开设置', hi: 'सेटिंग्स खोलो', fr: 'Ouvrir Réglages' })}
            onPress={() => void screenTimeControl.openSystemSettings()}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', paddingHorizontal: 6 },
  note: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.textTertiary },
});
