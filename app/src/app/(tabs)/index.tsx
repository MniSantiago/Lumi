import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptic } from '@/haptics';
import { Fireflies } from '@/components/fireflies';
import { LivingBackground } from '@/components/living-background';
import { LightMeter } from '@/components/light-meter';
import { LumiAvatar } from '@/components/lumi-avatar';
import { AppText, Card, Pill, WEB_TABS_INSET } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useGame, type GameApi } from '@/game/store';
import type { Destination } from '@/game/types';
import { tr } from '@/i18n';
import { clockTime } from '@/i18n/dates';
import { meterNote } from '@/lumi/meter';
import { EVOLUTION } from '@/lumi/data';
import { LUMI_STATES, THRESHOLDS, type LumiState, type Threshold } from '@/lumi/states';
import { useLumi } from '@/lumi/store';
import { isNightTime } from '@/lumi/time';
import { nightlyCopy } from '@/nightly/copy';
import { screenTime } from '@/screen-time';
import { TourTarget } from '@/tour/target';
import { useTourOnFocus } from '@/tour/store';

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return tr({ es: 'Ya es tarde', en: 'It’s late', zh: '夜深了', hi: 'रात काफ़ी हो गई', fr: 'Il est tard' });
  if (h >= 6 && h < 13)
    return tr({ es: 'Buenos días', en: 'Good morning', zh: '早上好', hi: 'सुप्रभात', fr: 'Bonjour' });
  if (h >= 13 && h < 20)
    return tr({ es: 'Buenas tardes', en: 'Good afternoon', zh: '下午好', hi: 'नमस्ते', fr: 'Bon après-midi' });
  return tr({ es: 'Buenas noches', en: 'Good evening', zh: '晚上好', hi: 'शुभ संध्या', fr: 'Bonsoir' });
}

const broughtFrom = (d: Destination) =>
  tr({
    es: `Trae recuerdos ${d.from}`,
    en: `Bringing keepsakes ${d.from}`,
    zh: `带回了${d.from}的纪念品`,
    hi: `${d.from} से यादें लाई है`,
    fr: `Rapporte des souvenirs ${d.from}`,
  });

/** Lampi durmiendo en el horario de noche: la ilustración de apagadita con su frase de buenas noches. */
function nightState(wakesAt: string): LumiState {
  const at = clockTime(wakesAt);
  return {
    ...LUMI_STATES.apagadita,
    label: tr({ es: 'Durmiendo', en: 'Sleeping', zh: '睡觉中', hi: 'सो रही है', fr: 'Endormie' }),
    bubble: tr({
      es: `Zzz… Hasta las ${at}. Si dormimos del tirón, mañana traigo chispas de más.`,
      en: `Zzz… Sleeping until ${at}. If we sleep right through, I’ll bring extra sparks tomorrow.`,
      zh: `Zzz……睡到${at}。一觉睡到天亮的话，明天我会多带些火花回来。`,
      hi: `Zzz… ${at} तक सोऊँगी। रात भर नींद पूरी हुई, तो कल ज़्यादा चिंगारियाँ लाऊँगी।`,
      fr: `Zzz… Je dors jusqu’à ${at}. Si on dort d’une traite, demain je rapporte des étincelles en plus.`,
    }),
  };
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { state: dayState, threshold, settings } = useLumi();
  // En el horario de noche Lampi duerme (como promete el onboarding), sea cual sea su luz.
  const night = isNightTime(settings.nightStart, settings.nightEnd);
  const state = night ? nightState(settings.nightEnd) : dayState;
  const game = useGame();
  useTourOnFocus('home');
  // El primer día se explica la regla: sin pasar de la mitad del límite, hay postal.
  const firstDay = game.ready && game.history.length <= 1 && !game.pendingReturn && !night && dayState.lit > 2;
  // Al tocar a Lampi dice otra cosa; con cada cambio de estado vuelve a su frase principal.
  const [talk, setTalk] = useState<{ key: string; i: number }>({ key: state.key, i: -1 });
  const line = talk.key === state.key && talk.i >= 0 ? state.chatter[talk.i % state.chatter.length] : state.bubble;
  const onPokeLumi = () => {
    haptic.light();
    setTalk((prev) => ({ key: state.key, i: prev.key === state.key ? prev.i + 1 : 0 }));
  };

  return (
    <View style={styles.root}>
      <LivingBackground />
      <Fireflies glow={state.glow} />
      {/* El mundo se oscurece al gastarse la luz de Lampi. */}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: Colors.nightDeep, opacity: state.dim }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[`${Colors.nightDeep}E6`, `${Colors.nightDeep}00`]}
        style={[styles.topShade, { height: insets.top + 220 }]}
      />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + Spacing.two + WEB_TABS_INSET, paddingBottom: insets.bottom + Spacing.three },
        ]}>
        <View style={styles.header}>
          <View>
            <AppText variant="caption">
              {settings.userName ? `${greeting()}, ${settings.userName}` : greeting()}
            </AppText>
            <AppText variant="display">{settings.lumiName}</AppText>
          </View>
          <TourTarget id="home.sparks">
            <Pressable
              style={({ pressed }) => [styles.sparks, pressed && { opacity: 0.75 }]}
              accessibilityRole="button"
              accessibilityLabel={`${game.sparks} ${nightlyCopy.sparksUnit}`}
              accessibilityHint={tr({
                es: 'Qué son y cómo se consiguen',
                en: 'What they are and how to get them',
                zh: '火花是什么、怎么获得',
                hi: 'ये क्या हैं और कैसे मिलती हैं',
                fr: 'Ce que c’est et comment en gagner',
              })}
              hitSlop={8}
              onPress={() => router.push('/chispas')}>
              <Text style={styles.sparksText}>✦ {game.sparks}</Text>
            </Pressable>
          </TourTarget>
        </View>

        <TourTarget id="home.meter">
          <Card style={styles.meterCard}>
            <LightMeter lit={dayState.lit} note={meterNote(threshold, settings.limitMinutes)} />
            {firstDay ? (
              <AppText variant="caption">
                {tr({
                  es: 'Tus apps ladronas gastan su luz. Si hoy no pasas de la mitad de tu límite, esta noche vuelve con una postal.',
                  en: 'Your thief apps drain her light. Stay under half your limit today and she’ll bring you a postcard tonight.',
                  zh: '“偷时间”的应用会消耗她的光。今天用量不超过上限的一半，今晚她就会带着明信片回来。',
                  hi: 'चोर ऐप्स उसकी रोशनी खर्च करते हैं। आज सीमा का आधा भी पार न हो, तो आज रात वो पोस्टकार्ड लेकर लौटेगी।',
                  fr: 'Tes applis voleuses usent sa lumière. Reste sous la moitié de ta limite aujourd’hui et elle te rapporte une carte ce soir.',
                })}
              </AppText>
            ) : null}
            {__DEV__ && screenTime.simulate ? <ThresholdSimulator value={threshold} /> : null}
          </Card>
        </TourTarget>

        <View style={styles.stage}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText} accessibilityLiveRegion="polite">
              {line}
            </Text>
            <View style={styles.bubbleTail} />
          </View>
          <TourTarget id="home.lumi">
            <LumiAvatar
              state={state}
              size={190}
              halo={EVOLUTION.stages[game.evolution.stage]?.halo}
              onPress={onPokeLumi}
              accessibilityHint={tr({
                es: 'Le dice algo',
                en: 'Says something',
                zh: '跟你说句话',
                hi: 'कुछ कहती है',
                fr: 'Te dit quelque chose',
              })}
            />
          </TourTarget>
          <Pill tone={state.exploring ? 'amber' : 'lavender'} style={styles.statePill}>
            {state.label}
          </Pill>
        </View>

        {game.ready ? (
          <TourTarget id="home.expedition">
            <ExpeditionCard game={game} lumiName={settings.lumiName} asleep={state.key === 'apagadita'} night={night} />
          </TourTarget>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Qué hace Lampi hoy: de expedición (con la barra hacia las 21:00), en casa, o
 * de vuelta con una postal por abrir.
 */
function ExpeditionCard({
  game,
  lumiName,
  asleep,
  night,
}: {
  game: GameApi;
  lumiName: string;
  asleep: boolean;
  night: boolean;
}) {
  const { pendingReturn, currentDestination, todayRecord, returnsAt } = game;

  if (pendingReturn) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityHint={tr({
          es: 'Abre la postal nocturna',
          en: 'Opens tonight’s postcard',
          zh: '打开今晚的明信片',
          hi: 'आज रात का पोस्टकार्ड खोलता है',
          fr: 'Ouvre la carte du soir',
        })}
        onPress={() => router.push('/postal')}>
        <Card style={[{ gap: 6 }, styles.returnCard]}>
          <AppText variant="label">
            {tr({
              es: 'Postal nueva 🌙',
              en: 'New postcard 🌙',
              zh: '新明信片 🌙',
              hi: 'नया पोस्टकार्ड 🌙',
              fr: 'Nouvelle carte 🌙',
            })}
          </AppText>
          <AppText variant="heading">
            {tr({
              es: `¡${lumiName} ha vuelto! Toca para ver la postal`,
              en: `${lumiName} is back! Tap to see the postcard`,
              zh: `${lumiName}回来了！轻点查看明信片`,
              hi: `${lumiName} लौट आई! पोस्टकार्ड देखने के लिए टैप करो`,
              fr: `${lumiName} est rentrée ! Touche pour voir la carte`,
            })}
          </AppText>
          <AppText variant="caption">{broughtFrom(pendingReturn.destination)}</AppText>
        </Card>
      </Pressable>
    );
  }

  const back = todayRecord.closed && todayRecord.expedition;
  const exploring = !!currentDestination && !todayRecord.closed;

  // De madrugada el día ya ha empezado, pero Lampi aún duerme: sale al despertar.
  if (night && exploring && game.expeditionProgress === 0) {
    return (
      <Card style={{ gap: 6 }}>
        <AppText variant="label">
          {tr({ es: 'Esta noche', en: 'Tonight', zh: '今晚', hi: 'आज रात', fr: 'Cette nuit' })}
        </AppText>
        <AppText variant="heading">
          {tr({
            es: `${lumiName} está durmiendo`,
            en: `${lumiName} is asleep`,
            zh: `${lumiName}正在睡觉`,
            hi: `${lumiName} सो रही है`,
            fr: `${lumiName} dort`,
          })}
        </AppText>
        <AppText variant="caption">
          {tr({
            es: `Al despertar sale hacia ${currentDestination.the}`,
            en: `When she wakes up, she’s off to ${currentDestination.the}`,
            zh: `醒来后出发去${currentDestination.the}`,
            hi: `जागकर ${currentDestination.the} के सफ़र पर निकलेगी`,
            fr: `À son réveil, elle part vers ${currentDestination.the}`,
          })}
        </AppText>
      </Card>
    );
  }
  const label = exploring
    ? tr({
        es: 'Expedición en curso',
        en: 'On an expedition',
        zh: '探险中',
        hi: 'सफ़र जारी है',
        fr: 'Expédition en cours',
      })
    : back
      ? tr({ es: 'Ya está en casa', en: 'Back home', zh: '已经到家了', hi: 'घर आ गई है', fr: 'Déjà rentrée' })
      : tr({
          es: 'Hoy se queda en casa',
          en: 'Staying home today',
          zh: '今天待在家',
          hi: 'आज घर पर है',
          fr: 'Reste à la maison aujourd’hui',
        });
  const title = exploring
    ? tr({
        es: `Explorando ${currentDestination.the}`,
        en: `Exploring ${currentDestination.the}`,
        zh: `正在探索${currentDestination.the}`,
        hi: `${currentDestination.the} घूम रही है`,
        fr: `Explore ${currentDestination.the}`,
      })
    : back && currentDestination
      ? tr({
          es: `${lumiName} ha vuelto ${currentDestination.from}`,
          en: `${lumiName} is back ${currentDestination.from}`,
          zh: `${lumiName}从${currentDestination.from}回来了`,
          hi: `${lumiName} ${currentDestination.from} से लौट आई`,
          fr: `${lumiName} est rentrée ${currentDestination.from}`,
        })
      : night
        ? tr({
            es: `${lumiName} está durmiendo`,
            en: `${lumiName} is asleep`,
            zh: `${lumiName}正在睡觉`,
            hi: `${lumiName} सो रही है`,
            fr: `${lumiName} dort`,
          })
        : asleep
          ? tr({
              es: `${lumiName} duerme la siesta`,
              en: `${lumiName} is napping`,
              zh: `${lumiName}在睡午觉`,
              hi: `${lumiName} झपकी ले रही है`,
              fr: `${lumiName} fait la sieste`,
            })
          : tr({
              es: `${lumiName} está descansando en la madriguera`,
              en: `${lumiName} is resting in her burrow`,
              zh: `${lumiName}在小窝里休息`,
              hi: `${lumiName} अपने घर में आराम कर रही है`,
              fr: `${lumiName} se repose dans son terrier`,
            });
  const sub = exploring
    ? tr({
        es: `Vuelve a las ${returnsAt} con una postal`,
        en: `Back at ${returnsAt} with a postcard`,
        zh: `${returnsAt}带着明信片回来`,
        hi: `${returnsAt} को पोस्टकार्ड लेकर लौटेगी`,
        fr: `Rentre à ${returnsAt} avec une carte`,
      })
    : back
      ? tr({
          es: 'Mañana, otra aventura ✨',
          en: 'Another adventure tomorrow ✨',
          zh: '明天，新的冒险 ✨',
          hi: 'कल, एक और रोमांच ✨',
          fr: 'Demain, une autre aventure ✨',
        })
      : asleep
        ? tr({
            es: 'Mañana se despierta con la luz al máximo',
            en: 'Tomorrow she wakes up with full light',
            zh: '明天醒来时光会是满满的',
            hi: 'कल वो पूरी रोशनी के साथ जागेगी',
            fr: 'Demain, elle se réveille avec toute sa lumière',
          })
        : tr({
            es: 'Mañana sale de viaje con la luz llena',
            en: 'Tomorrow she sets off with full light',
            zh: '明天带着满满的光出发旅行',
            hi: 'कल वो पूरी रोशनी के साथ सफ़र पर निकलेगी',
            fr: 'Demain, elle part en voyage pleine de lumière',
          });
  return (
    <Card style={{ gap: 6 }}>
      <AppText variant="label">{label}</AppText>
      <AppText variant="heading">{title}</AppText>
      <AppText variant="caption">{sub}</AppText>
      {exploring ? (
        <View
          style={styles.track}
          accessible
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(game.expeditionProgress * 100) }}>
          <View style={[styles.trackFill, { width: `${game.expeditionProgress * 100}%` }]} />
        </View>
      ) : null}
    </Card>
  );
}

/** Solo en desarrollo: simula los avisos de umbral de Screen Time. */
function ThresholdSimulator({ value }: { value: Threshold }) {
  return (
    <View style={styles.sim}>
      <AppText variant="caption">Simular uso</AppText>
      <View style={styles.simRow}>
        {THRESHOLDS.map((t) => (
          <Pressable
            key={t}
            onPress={() => screenTime.simulate?.(t)}
            accessibilityRole="button"
            accessibilityState={{ selected: t === value }}
            style={[styles.simBtn, t === value && styles.simBtnOn]}>
            <Text style={[styles.simText, t === value && { color: Colors.onAmber }]}>{t} %</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.night },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0 },
  content: { flex: 1, paddingHorizontal: Spacing.three + 4, gap: Spacing.three },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sparks: {
    backgroundColor: 'rgba(255, 201, 107, 0.16)',
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 6,
  },
  sparksText: { fontFamily: Fonts.bodyBold, color: Colors.amberPale, fontSize: 15, fontVariant: ['tabular-nums'] },
  meterCard: { gap: Spacing.three },
  statePill: { alignSelf: 'center', backgroundColor: 'rgba(19, 17, 46, 0.78)' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: Spacing.two },
  bubble: {
    backgroundColor: Colors.lavenderPale,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 300,
    marginBottom: -4,
  },
  bubbleText: { fontFamily: Fonts.bodyMedium, fontSize: 15, lineHeight: 21, color: Colors.night, textAlign: 'center' },
  bubbleTail: {
    position: 'absolute',
    bottom: -7,
    alignSelf: 'center',
    width: 14,
    height: 14,
    backgroundColor: Colors.lavenderPale,
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
  },
  returnCard: { borderColor: 'rgba(255, 201, 107, 0.45)', borderWidth: 1 },
  track: {
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(201, 191, 242, 0.14)',
    marginTop: 6,
    overflow: 'hidden',
  },
  trackFill: { height: '100%', borderRadius: Radius.pill, backgroundColor: Colors.amber },
  sim: { gap: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.hairline, paddingTop: 12 },
  simRow: { flexDirection: 'row', gap: 6 },
  simBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(201, 191, 242, 0.12)',
  },
  simBtnOn: { backgroundColor: Colors.amber },
  simText: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.lavender, fontVariant: ['tabular-nums'] },
});
