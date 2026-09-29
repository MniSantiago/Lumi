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
import { tr } from '@/i18n';

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
      thiefApps: THIEF_APP_CATALOG.filter((a) => (a.id === id ? !selected.has(id) : selected.has(a.id))).map(
        (a) => a.id,
      ),
    });

  return (
    <StepShell
      step={2}
      title={tr({
        es: 'Apps ladronas',
        en: 'Thief apps',
        zh: '偷时间的 App',
        hi: 'चोर ऐप्स',
        fr: 'Applis voleuses',
      })}
      subtitle={tr({
        es: `Son las que le roban la luz a ${lumiName}. No pasa nada por usarlas: solo se cansa un poquito.`,
        en: `They’re the ones that steal ${lumiName}’s light. Using them is fine: she just gets a little tired.`,
        zh: `它们会偷走${lumiName}的光。用它们没关系：她只是会有点累。`,
        hi: `ये वो ऐप्स हैं जो ${lumiName} की रोशनी चुराती हैं। इन्हें इस्तेमाल करना ठीक है: वो बस थोड़ी थक जाती है।`,
        fr: `Ce sont celles qui volent la lumière de ${lumiName}. Les utiliser, ce n’est pas grave : elle se fatigue juste un peu.`,
      })}
      cta={{
        label: tr({ es: 'Continuar', en: 'Continue', zh: '继续', hi: 'आगे बढ़ो', fr: 'Continuer' }),
        disabled: count === 0,
        hint:
          count === 0
            ? tr({
                es: 'Elige al menos una para seguir',
                en: 'Pick at least one to continue',
                zh: '至少选一个才能继续',
                hi: 'आगे बढ़ने के लिए कम से कम एक चुनो',
                fr: 'Choisis-en au moins une pour continuer',
              })
            : count === 1
              ? tr({
                  es: '1 app elegida',
                  en: '1 app picked',
                  zh: '已选 1 个 App',
                  hi: '1 ऐप चुनी',
                  fr: '1 appli choisie',
                })
              : tr({
                  es: `${count} apps elegidas`,
                  en: `${count} apps picked`,
                  zh: `已选 ${count} 个 App`,
                  hi: `${count} ऐप्स चुनीं`,
                  fr: `${count} applis choisies`,
                }),
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
        <AppText variant="label">
          {tr({
            es: '¿Cuáles te roban más tiempo?',
            en: 'Which ones steal the most time?',
            zh: '哪些最偷你的时间？',
            hi: 'कौन-सी सबसे ज़्यादा समय चुराती हैं?',
            fr: 'Lesquelles te volent le plus de temps ?',
          })}
        </AppText>
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
          {tr({
            es: `En tu iPhone, esta lista será el selector de Apple. ${lumiName} solo se entera de cuándo te acercas a tu límite, nunca de lo que haces dentro de las apps.`,
            en: `On your iPhone, this list will be Apple’s picker. ${lumiName} only learns when you’re getting close to your limit, never what you do inside the apps.`,
            zh: `在你的 iPhone 上，这个列表会是 Apple 的选择器。${lumiName}只知道你什么时候接近上限，永远不知道你在 App 里做什么。`,
            hi: `तुम्हारे iPhone पर यह सूची Apple का चयनकर्ता होगी। ${lumiName} को बस यह पता चलता है कि तुम अपनी सीमा के पास कब पहुँचते हो, कभी नहीं कि ऐप्स के अंदर क्या करते हो।`,
            fr: `Sur ton iPhone, cette liste sera le sélecteur d’Apple. ${lumiName} sait seulement quand tu approches de ta limite, jamais ce que tu fais dans les applis.`,
          })}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  privacy: { flexDirection: 'row', gap: 10, paddingHorizontal: 6 },
  privacyText: { flex: 1, fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.textTertiary },
});
