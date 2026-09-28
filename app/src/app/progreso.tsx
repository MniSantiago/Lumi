import { Share, StyleSheet, Text, View } from 'react-native';

import { AppText, Button, Card, SectionTitle, Screen } from '@/components/ui';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { EVOLUTION, STREAK_DAYS, WEEK } from '@/lumi/data';

const CHART_HEIGHT = 120;

export default function ProgressScreen() {
  const brightDays = WEEK.filter((d) => d.lit > 0).length;

  return (
    <Screen title="Progreso" subtitle="Semana del 22 al 28 de septiembre">
      <Card style={styles.streak}>
        <Text style={styles.streakNumber}>{STREAK_DAYS}</Text>
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="heading">días seguidos brillando</AppText>
          <AppText variant="caption">Usaste 1 día de descanso el jueves. Te queda otro esta semana.</AppText>
        </View>
      </Card>

      <Card style={{ gap: Spacing.three }}>
        <View style={{ gap: 2 }}>
          <AppText variant="heading">Cuánto brilló Lumi</AppText>
          <AppText variant="caption">Por tramo de tu límite</AppText>
        </View>
        <View style={styles.chart}>
          {WEEK.map((d, i) => {
            const rest = d.lit === 0;
            const today = i === WEEK.length - 1;
            return (
              <View
                key={d.day}
                style={styles.day}
                accessible
                accessibilityLabel={rest ? `${d.day}: día de descanso` : `${d.day}: ${d.lit} de 4 tramos de luz`}>
                <View style={styles.barSlot}>
                  <View
                    style={[
                      styles.bar,
                      { height: (rest ? 1 : d.lit) * (CHART_HEIGHT / 4) },
                      rest ? styles.barRest : styles.barLit,
                    ]}
                  />
                </View>
                <Text style={[styles.dayLabel, today && { color: Colors.amber }]}>{d.day}</Text>
              </View>
            );
          })}
        </View>
        <AppText variant="caption">Cuanto más alta la barra, más luz le quedó a Lumi al final del día.</AppText>
      </Card>

      <Card style={{ gap: Spacing.three, alignItems: 'center' }}>
        <Text style={styles.summary}>Lumi brilló {brightDays} de 7 días y visitó 4 lugares nuevos</Text>
        <Button
          label="Compartir resumen"
          style={{ alignSelf: 'stretch' }}
          onPress={() =>
            Share.share({ message: `Mi Lumi brilló ${brightDays} de 7 días esta semana ✨ y visitó 4 lugares nuevos.` })
          }
        />
      </Card>

      <View style={{ gap: Spacing.three }}>
        <SectionTitle
          action={
            <AppText variant="caption">
              Semana {EVOLUTION.week} de {EVOLUTION.weeksPerStage}
            </AppText>
          }>
          Evolución
        </SectionTitle>
        <Card style={styles.evolution}>
          {EVOLUTION.stages.map((stage, i) => {
            const reached = i <= EVOLUTION.current;
            return (
              <View key={stage} style={styles.stage}>
                <View style={[styles.stageDot, reached ? styles.stageDotOn : null]} />
                <Text style={[styles.stageLabel, reached && { color: Colors.amberPale }]}>{stage}</Text>
              </View>
            );
          })}
          <View style={styles.stageLine} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  streak: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  streakNumber: {
    fontFamily: Fonts.displayBold,
    fontSize: 52,
    lineHeight: 58,
    color: Colors.amber,
    textShadowColor: `${Colors.amber}88`,
    textShadowRadius: 16,
    fontVariant: ['tabular-nums'],
  },
  chart: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  day: { flex: 1, alignItems: 'center', gap: 6 },
  barSlot: { height: CHART_HEIGHT, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 8, borderCurve: 'continuous' },
  barLit: { experimental_backgroundImage: `linear-gradient(0deg, ${Colors.violet}, ${Colors.amber})` },
  barRest: { borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.textTertiary },
  dayLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.textTertiary },
  summary: { fontFamily: Fonts.display, fontSize: 20, lineHeight: 26, color: Colors.text, textAlign: 'center' },
  evolution: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.four },
  stage: { alignItems: 'center', gap: 8, zIndex: 1, flex: 1 },
  stageDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.cardSolid,
    borderWidth: 2,
    borderColor: Colors.textTertiary,
  },
  stageDotOn: { backgroundColor: Colors.amber, borderColor: Colors.amberPale, boxShadow: `0 0 12px ${Colors.amber}` },
  stageLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textTertiary },
  stageLine: {
    position: 'absolute',
    top: Spacing.four + 8,
    left: '12.5%',
    right: '12.5%',
    height: 2,
    backgroundColor: Colors.hairline,
  },
});
