import { Image } from 'expo-image';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Card, PillButton, SectionTitle, Screen } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { MAX_REST_DAYS_PER_WEEK } from '@/game/engine';
import { rangeLabel, whenLabel } from '@/game/format';
import { useGame, type GameApi } from '@/game/store';
import { EVOLUTION } from '@/lumi/data';
import { LUMI_STATES } from '@/lumi/states';
import { useLumi } from '@/lumi/store';

const WEEK_HEIGHT = 130;
const LABEL_SPACE = 22;
const DAY_NAMES: Record<string, string> = {
  L: 'Lunes',
  M: 'Martes',
  X: 'Miércoles',
  J: 'Jueves',
  V: 'Viernes',
  S: 'Sábado',
  D: 'Domingo',
};

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
  if (!restDaysOn) return 'Cada día empieza de cero.';
  const used = game.restDaysThisWeek;
  const left = MAX_REST_DAYS_PER_WEEK - used.length;
  if (used.length === 0) return 'Si algún día lo necesitas, esta semana tienes 2 días de descanso.';
  const when = used.map((d) => whenLabel(d, game.today)).join(' y ');
  if (left <= 0) return `Usaste los días de descanso de esta semana (${when}). El lunes vuelven.`;
  return `Usaste 1 día de descanso ${when}. Te queda otro esta semana.`;
}

export default function ProgressScreen() {
  const game = useGame();
  const { settings } = useLumi();
  const { week, evolution } = game;
  const brightDays = week.filter((d) => !d.future && game.history.some((h) => h.date === d.date && h.expedition)).length;
  const places = newPlacesThisWeek(game);
  const summary = `${settings.lumiName} brilló ${brightDays} de 7 días y visitó ${places} ${places === 1 ? 'lugar nuevo' : 'lugares nuevos'}`;
  const subtitle = week.length ? `Semana ${rangeLabel(week[0].date, week[week.length - 1].date)}` : undefined;

  return (
    <Screen title="Progreso" subtitle={subtitle}>
      <View style={{ gap: 12 }}>
        <Card style={styles.streak}>
          <Text style={styles.streakNum}>{game.streak}</Text>
          <View style={styles.streakTxt}>
            <Text style={styles.streakTitle}>{game.streak === 0
                ? 'Hoy puede empezar una racha nueva'
                : game.streak === 1
                  ? 'día seguido brillando'
                  : 'días seguidos brillando'}</Text>
            <Text style={styles.streakSub}>{restNote(game, settings.restDays)}</Text>
          </View>
        </Card>

        <Card>
          <View style={styles.meterHead}>
            <Text style={styles.panelTitle}>Cuánto brilló {settings.lumiName}</Text>
            <Text style={styles.meterHeadSide}>Por tramo de tu límite</Text>
          </View>
          <View style={styles.week}>
            {week.map((d) => {
              const empty = d.lit === 0 && !d.restDay;
              const name = DAY_NAMES[d.label] ?? d.label;
              const label = d.restDay
                ? `${name}: día de descanso`
                : d.future
                  ? `${name}: aún no ha llegado`
                  : empty
                    ? `${name}: sin datos`
                    : `${name}: ${d.lit} de 4 tramos de luz`;
              return (
                <View key={d.date} style={styles.day} accessible accessibilityLabel={label}>
                  <View
                    style={[
                      styles.bar,
                      { height: ((d.lit || 1) / 4) * (WEEK_HEIGHT - LABEL_SPACE) },
                      d.restDay ? styles.barRest : empty ? styles.barEmpty : styles.barLit,
                    ]}
                  />
                  <Text style={[styles.dayLabel, d.isToday && { color: Colors.amberPale }]}>{d.label}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.chartNote}>
            Cuanto más alta la barra, más luz le quedó a {settings.lumiName} al final del día.
          </Text>
        </Card>

        <View style={styles.share}>
          <Image
            source={LUMI_STATES.radiante.image}
            style={styles.shareLumi}
            contentFit="contain"
            accessibilityLabel={`${settings.lumiName}, radiante`}
          />
          <View style={styles.shareTxt}>
            <Text style={styles.shareTitle}>{summary}</Text>
            <PillButton label="Compartir resumen" onPress={() => Share.share({ message: `${summary} ✨` })} />
          </View>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <SectionTitle
          action={
            <Text style={styles.count}>
              {evolution.maxed ? '¡Brilla del todo!' : `${evolution.inStage} de ${evolution.perStage} días de luz`}
            </Text>
          }>
          Evolución
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
