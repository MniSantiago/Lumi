import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { PillButton, TextLink } from '@/components/ui';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { realScreenTime } from '@/screen-time';
import { tr } from '@/i18n';
import { permissionDeniedCopy } from '@/notifications/copy';
import {
  getThiefAppsSelection,
  requestScreenTimeAuthorization,
  saveThiefAppsSelection,
  selectionSheetView,
  thiefAppsCount,
} from '@/screen-time/native';

/** La hoja nativa, cargada una vez y solo con Screen Time de verdad (no existe en Expo Go). */
const SelectionSheet = realScreenTime ? selectionSheetView() : null;

/**
 * Elegir las apps ladronas con el `FamilyActivityPicker` de Apple (solo con
 * Screen Time de verdad). Lumi nunca ve qué apps son: solo guarda el token.
 */
export function ThiefAppsPicker({ lumiName, onChange }: { lumiName: string; onChange?: (count: number) => void }) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(() => thiefAppsCount());
  const [denied, setDenied] = useState(false);

  const pick = async () => {
    const ok = await requestScreenTimeAuthorization().catch(() => false);
    setDenied(!ok);
    if (ok) setOpen(true);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityLiveRegion="polite">
        {count === 0
          ? tr({
              es: 'Aún no has elegido ninguna',
              en: 'You haven’t picked any yet',
              zh: '还没有选择',
              hi: 'अभी तक कोई नहीं चुनी',
              fr: 'Tu n’en as encore choisi aucune',
            })
          : count === 1
            ? tr({
                es: '1 app o categoría elegida',
                en: '1 app or category picked',
                zh: '已选 1 个 App 或类别',
                hi: '1 ऐप या श्रेणी चुनी',
                fr: '1 appli ou catégorie choisie',
              })
            : tr({
                es: `${count} apps y categorías elegidas`,
                en: `${count} apps and categories picked`,
                zh: `已选 ${count} 个 App 和类别`,
                hi: `${count} ऐप्स और श्रेणियाँ चुनीं`,
                fr: `${count} applis et catégories choisies`,
              })}
      </Text>
      <Text style={styles.sub}>
        {tr({
          es: `Se eligen con el selector de Apple. ${lumiName} solo se entera de cuándo te acercas a tu límite, nunca de qué apps son ni de lo que haces dentro.`,
          en: `They’re picked with Apple’s picker. ${lumiName} only learns when you’re getting close to your limit, never which apps they are or what you do inside.`,
          zh: `通过 Apple 的选择器选择。${lumiName}只知道你什么时候接近上限，永远不知道是哪些 App，也不知道你在里面做什么。`,
          hi: `ये Apple के चयनकर्ता से चुनी जाती हैं। ${lumiName} को बस यह पता चलता है कि तुम सीमा के पास कब पहुँचते हो, कभी नहीं कि कौन-सी ऐप्स हैं या तुम उनमें क्या करते हो।`,
          fr: `Elles se choisissent avec le sélecteur d’Apple. ${lumiName} sait seulement quand tu approches de ta limite, jamais de quelles applis il s’agit ni ce que tu y fais.`,
        })}
      </Text>
      <PillButton
        label={
          count === 0
            ? tr({ es: 'Elegir apps', en: 'Pick apps', zh: '选择 App', hi: 'ऐप्स चुनो', fr: 'Choisir des applis' })
            : tr({ es: 'Cambiar apps', en: 'Change apps', zh: '更换 App', hi: 'ऐप्स बदलो', fr: 'Changer les applis' })
        }
        onPress={() => void pick()} />
      {denied ? (
        <View style={{ gap: 4 }}>
          <Text style={styles.denied}>
            {tr({
              es: `Para que ${lumiName} funcione hace falta el permiso de Tiempo de uso. Puedes darlo en Ajustes.`,
              en: `${lumiName} needs Screen Time permission to work. You can grant it in Settings.`,
              zh: `${lumiName}需要屏幕使用时间权限才能工作。你可以在设置中开启。`,
              hi: `${lumiName} के काम करने के लिए स्क्रीन टाइम की अनुमति चाहिए। तुम इसे सेटिंग्स में दे सकते हो।`,
              fr: `${lumiName} a besoin de l’autorisation Temps d’écran pour fonctionner. Tu peux la donner dans Réglages.`,
            })}
          </Text>
          <TextLink label={permissionDeniedCopy.openSettings} onPress={() => void Linking.openSettings()} />
        </View>
      ) : null}
      {open && SelectionSheet ? (
        <SelectionSheet
          style={styles.anchor}
          familyActivitySelection={getThiefAppsSelection() ?? null}
          onDismissRequest={() => setOpen(false)}
          onSelectionChange={(e) => {
            const { familyActivitySelection, applicationCount, categoryCount, webDomainCount } = e.nativeEvent;
            if (!familyActivitySelection) return;
            saveThiefAppsSelection(familyActivitySelection);
            const next = applicationCount + categoryCount + webDomainCount;
            setCount(next);
            onChange?.(next);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 16,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'flex-start',
  },
  title: { fontFamily: Fonts.bodySemiBold, fontSize: 16, lineHeight: 22, color: Colors.text },
  sub: { fontFamily: Fonts.body, fontSize: 13.5, lineHeight: 19, color: Colors.textSecondary },
  denied: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.peach },
  // La hoja nativa se presenta sola; esto es solo su ancla invisible.
  anchor: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
