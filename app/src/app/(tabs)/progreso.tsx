import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Card, PillButton, SectionTitle, Screen } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { MAX_REST_DAYS_PER_WEEK } from '@/game/engine';
import { rangeLabel, whenLabel } from '@/game/format';
import { useGame, type GameApi } from '@/game/store';
import { EVOLUTION } from '@/lumi/data';
import { LUMI_STATES } from '@/lumi/states';
import { useLumi } from '@/lumi/store';
import { tr } from '@/i18n';
import { weekdayName, weekLetter } from '@/i18n/dates';

const WEEK_HEIGHT = 130;
const LABEL_SPACE = 22;

/** Lugares visitados por primera vez esta semana. */
function newPlacesThisWeek(game: GameApi): number {
  const first = new Map<string, string>();
  for (const day of game.history) {
    const id = day.expedition?.destinationId;
    if (id && !first.has(id)) first.set(id, day.date);
  }
  const monday = game.week[0]?.date ?? game.today;
  return [...first.values()].filter((date) => date >= monday).length;
}

function restNote(game: GameApi, restDaysOn: boolean): string {
  if (!restDaysOn)
    return tr({
      es: 'Cada día empieza de cero.',
      en: 'Every day starts fresh.',
      zh: '每天都是新的开始。',
      hi: 'हर दिन नई शुरुआत है।',
      fr: 'Chaque jour repart de zéro.',
    });
  const used = game.restDaysThisWeek;
  const left = MAX_REST_DAYS_PER_WEEK - used.length;
  if (used.length === 0)
    return tr({
      es: 'Si algún día lo necesitas, esta semana tienes 2 días de descanso.',
      en: 'If you ever need it, you have 2 rest days this week.',
      zh: '如果需要，这周你有 2 天休息日。',
      hi: 'अगर कभी ज़रूरत हो, तो इस हफ़्ते तुम्हारे पास 2 आराम के दिन हैं।',
      fr: 'Si un jour tu en as besoin, tu as 2 jours de repos cette semaine.',
    });
  const when = used
    .map((d) => whenLabel(d, game.today))
    .join(tr({ es: ' y ', en: ' and ', zh: '和', hi: ' और ', fr: ' et ' }));
  if (left <= 0)
    return tr({
      es: `Usaste los días de descanso de esta semana (${when}). El lunes vuelven.`,
      en: `You used this week’s rest days (${when}). They’re back on Monday.`,
      zh: `这周的休息日已经用完了（${when}）。周一会重新有。`,
      hi: `तुमने इस हफ़्ते के आराम के दिन ले लिए (${when})। सोमवार को फिर मिलेंगे।`,
      fr: `Tu as utilisé les jours de repos de la semaine (${when}). Ils reviennent lundi.`,
    });
  return tr({
    es: `Usaste 1 día de descanso ${when}. Te queda otro esta semana.`,
    en: `You used 1 rest day ${when}. You have one more this week.`,
    zh: `你${when}用了 1 天休息日。这周还剩一天。`,
    hi: `तुमने ${when} 1 आराम का दिन लिया। इस हफ़्ते एक और बचा है।`,
    fr: `Tu as pris 1 jour de repos ${when}. Il t’en reste un cette semaine.`,
  });
}

export default function ProgressScreen() {
  const game = useGame();
  const { settings } = useLumi();
  const { week, evolution } = game;
  const brightDays = week.filter(
    (d) => !d.future && game.history.some((h) => h.date === d.date && h.expedition),
  ).length;
  const places = newPlacesThisWeek(game);
  const name = settings.lumiName;
  const summary =
    places === 1
      ? tr({
          es: `${name} brilló ${brightDays} de 7 días y visitó 1 lugar nuevo`,
          en: `${name} shone ${brightDays} of 7 days and visited 1 new place`,
          zh: `${name}在 7 天里亮了 ${brightDays} 天，去了 1 个新地方`,
          hi: `${name} 7 में से ${brightDays} दिन चमकी और 1 नई जगह घूमी`,
          fr: `${name} a brillé ${brightDays} jours sur 7 et a visité 1 nouveau lieu`,
        })
      : tr({
          es: `${name} brilló ${brightDays} de 7 días y visitó ${places} lugares nuevos`,
          en: `${name} shone ${brightDays} of 7 days and visited ${places} new places`,
          zh: `${name}在 7 天里亮了 ${brightDays} 天，去了 ${places} 个新地方`,
          hi: `${name} 7 में से ${brightDays} दिन चमकी और ${places} नई जगहें घूमी`,
          fr: `${name} a brillé ${brightDays} jours sur 7 et a visité ${places} nouveaux lieux`,
        });
  const range = week.length ? rangeLabel(week[0].date, week[week.length - 1].date) : '';
  const subtitle = week.length
    ? tr({
        es: `Semana ${range}`,
        en: `Week of ${range}`,
        zh: `${range}这周`,
        hi: `हफ़्ता: ${range}`,
        fr: `Semaine ${range}`,
      })
    : undefined;

  return (
    <Screen title={tr({ es: 'Progreso', en: 'Progress', zh: '进度', hi: 'प्रगति', fr: 'Progrès' })} subtitle={subtitle}>
      <View style={{ gap: 12 }}>
        <Card style={styles.streak}>
          <Text style={styles.streakNum}>{game.streak}</Text>
          <View style={styles.streakTxt}>
            <Text style={styles.streakTitle}>
              {game.streak === 0
                ? tr({
                    es: 'Hoy puede empezar una racha nueva',
                    en: 'A new streak can start today',
                    zh: '今天可以开始新的连续记录',
                    hi: 'आज एक नया सिलसिला शुरू हो सकता है',
                    fr: 'Une nouvelle série peut commencer aujourd’hui',
                  })
                : game.streak === 1
                  ? tr({
                      es: 'día seguido brillando',
                      en: 'day shining in a row',
                      zh: '天连续发光',
                      hi: 'दिन लगातार चमक',
                      fr: 'jour de lumière d’affilée',
                    })
                  : tr({
                      es: 'días seguidos brillando',
                      en: 'days shining in a row',
                      zh: '天连续发光',
                      hi: 'दिन लगातार चमक',
                      fr: 'jours de lumière d’affilée',
                    })}
            </Text>
            <Text style={styles.streakSub}>{restNote(game, settings.restDays)}</Text>
          </View>
        </Card>

        <Card>
          <View style={styles.meterHead}>
            <Text style={styles.panelTitle}>
              {tr({
                es: `Cuánto brilló ${name}`,
                en: `How much ${name} shone`,
                zh: `${name}亮了多少`,
                hi: `${name} कितना चमकी`,
                fr: `Combien ${name} a brillé`,
              })}
            </Text>
            <Text style={styles.meterHeadSide}>
              {tr({
                es: 'Por tramo de tu límite',
                en: 'By part of your limit',
                zh: '按上限分段',
                hi: 'तुम्हारी सीमा के हिस्सों में',
                fr: 'Par tranche de ta limite',
              })}
            </Text>
          </View>
          <View style={styles.week}>
            {week.map((d) => {
              const empty = d.lit === 0 && !d.restDay;
              const day = weekdayName(d.label);
              const label = `${day}: ${
                d.restDay
                  ? tr({ es: 'día de descanso', en: 'rest day', zh: '休息日', hi: 'आराम का दिन', fr: 'jour de repos' })
                  : d.future
                    ? tr({
                        es: 'aún no ha llegado',
                        en: 'not here yet',
                        zh: '还没到',
                        hi: 'अभी नहीं आया',
                        fr: 'pas encore arrivé',
                      })
                    : empty
                      ? tr({
                          es: 'sin datos',
                          en: 'no data',
                          zh: '没有数据',
                          hi: 'कोई डेटा नहीं',
                          fr: 'pas de données',
                        })
                      : tr({
                          es: `${d.lit} de 4 tramos de luz`,
                          en: `${d.lit} of 4 light segments`,
                          zh: `4 段光中的 ${d.lit} 段`,
                          hi: `रोशनी के 4 में से ${d.lit} हिस्से`,
                          fr: `${d.lit} tranches de lumière sur 4`,
                        })
              }`;
              return (
                <View key={d.date} style={styles.day} accessible accessibilityLabel={label}>
                  <View
                    style={[
                      styles.bar,
                      { height: ((d.lit || 1) / 4) * (WEEK_HEIGHT - LABEL_SPACE) },
                      d.restDay ? styles.barRest : empty ? styles.barEmpty : styles.barLit,
                    ]}
                  />
                  <Text style={[styles.dayLabel, d.isToday && { color: Colors.amberPale }]}>{weekLetter(d.label)}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.chartNote}>
            {tr({
              es: `Cuanto más alta la barra, más luz le quedó a ${name} al final del día.`,
              en: `The taller the bar, the more light ${name} had left at the end of the day.`,
              zh: `柱子越高，${name}一天结束时剩下的光越多。`,
              hi: `पट्टी जितनी ऊँची, दिन के आख़िर में ${name} के पास उतनी ज़्यादा रोशनी बची।`,
              fr: `Plus la barre est haute, plus il restait de lumière à ${name} en fin de journée.`,
            })}
          </Text>
        </Card>

        <View style={styles.share}>
          <Image
            source={LUMI_STATES.radiante.image}
            style={styles.shareLumi}
            contentFit="contain"
            accessibilityLabel={`${name}, ${LUMI_STATES.radiante.label.toLowerCase()}`}
          />
          <View style={styles.shareTxt}>
            <Text style={styles.shareTitle}>{summary}</Text>
            <PillButton
              label={tr({
                es: 'Compartir resumen',
                en: 'Share summary',
                zh: '分享总结',
                hi: 'सारांश शेयर करो',
                fr: 'Partager le bilan',
              })}
              onPress={() => router.push('/resumen')}
            />
          </View>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <SectionTitle
          action={
            <Text style={styles.count}>
              {evolution.maxed
                ? tr({
                    es: '¡Brilla del todo!',
                    en: 'Fully shining!',
                    zh: '完全发光啦！',
                    hi: 'पूरी तरह चमक रही है!',
                    fr: 'Elle brille pleinement !',
                  })
                : tr({
                    es: `${evolution.inStage} de ${evolution.perStage} días de luz`,
                    en: `${evolution.inStage} of ${evolution.perStage} bright days`,
                    zh: `${evolution.inStage} / ${evolution.perStage} 个发光日`,
                    hi: `${evolution.perStage} में से ${evolution.inStage} रोशन दिन`,
                    fr: `${evolution.inStage} jours de lumière sur ${evolution.perStage}`,
                  })}
            </Text>
          }>
          {tr({ es: 'Evolución', en: 'Evolution', zh: '成长', hi: 'विकास', fr: 'Évolution' })}
        </SectionTitle>
        <Card style={styles.evo}>
          {EVOLUTION.stages.map((stage, i) => {
            const reached = i <= evolution.stage;
            return (
              <View key={stage.name} style={[styles.evoStage, !reached && { opacity: 0.4 }]}>
                <View style={[styles.orb, { experimental_backgroundImage: stage.orb }]} />
                <Text style={styles.evoLabel}>{stage.name}</Text>
              </View>
            );
          })}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  streak: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  streakNum: {
    fontFamily: Fonts.displayExtraBold,
    fontSize: 54,
    lineHeight: 58,
    color: Colors.amberPale,
    textShadowColor: 'rgba(255, 201, 107, 0.5)',
    textShadowRadius: 22,
    fontVariant: ['tabular-nums'],
  },
  streakTxt: { flex: 1, gap: 2 },
  streakTitle: { fontFamily: Fonts.bodyBold, fontSize: 15, lineHeight: 20, color: Colors.text },
  streakSub: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.textSecondary },
  meterHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  panelTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textSecondary },
  meterHeadSide: { fontFamily: Fonts.body, fontSize: 13, color: Colors.textTertiary },
  week: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: WEEK_HEIGHT, marginTop: 14 },
  day: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6, height: '100%' },
  bar: { width: '100%', maxWidth: 30, borderRadius: 10, borderCurve: 'continuous' },
  barLit: {
    experimental_backgroundImage: `linear-gradient(180deg, ${Colors.amberPale}, ${Colors.amber})`,
    boxShadow: '0 0 12px rgba(255, 201, 107, 0.4)',
  },
  barRest: {
    backgroundColor: 'rgba(201, 191, 242, 0.12)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(201, 191, 242, 0.4)',
  },
  barEmpty: { backgroundColor: 'rgba(201, 191, 242, 0.08)' },
  dayLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 11, lineHeight: 16, color: Colors.textTertiary },
  chartNote: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 17, color: Colors.textTertiary, marginTop: 10 },
  share: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 22,
    borderCurve: 'continuous',
    experimental_backgroundImage: `linear-gradient(160deg, ${Colors.violet}, ${Colors.indigoLight} 70%)`,
  },
  shareLumi: { width: 76, height: 80 },
  shareTxt: { flex: 1, gap: 8, minWidth: 0 },
  shareTitle: { fontFamily: Fonts.displayBold, fontSize: 17, lineHeight: 21, color: Colors.text },
  count: { fontFamily: Fonts.body, fontSize: 13, color: Colors.textTertiary },
  evo: { flexDirection: 'row', gap: 8 },
  evoStage: { flex: 1, alignItems: 'center', gap: 4 },
  orb: { width: 44, height: 44, borderRadius: 22 },
  evoLabel: { fontFamily: Fonts.body, fontSize: 11.5, color: Colors.textSecondary },
});
