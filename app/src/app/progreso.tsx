import { Image } from 'expo-image';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Card, PillButton, SectionTitle, Screen } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { EVOLUTION, STREAK_DAYS, WEEK } from '@/lumi/data';
import { LUMI_STATES } from '@/lumi/states';

const WEEK_HEIGHT = 130;
const LABEL_SPACE = 22;

export default function ProgressScreen() {
  const brightDays = WEEK.filter((d) => d.lit > 0).length;
  const summary = `Lumi brilló ${brightDays} de 7 días y visitó 4 lugares nuevos`;

  return (
    <Screen title="Progreso" subtitle="Semana del 22 al 28 de septiembre">
      <View style={{ gap: 12 }}>
        <Card style={styles.streak}>
          <Text style={styles.streakNum}>{STREAK_DAYS}</Text>
          <View style={styles.streakTxt}>
            <Text style={styles.streakTitle}>días seguidos brillando</Text>
            <Text style={styles.streakSub}>Usaste 1 día de descanso el jueves. Te queda otro esta semana.</Text>
          </View>
        </Card>

        <Card>
          <View style={styles.meterHead}>
            <Text style={styles.panelTitle}>Cuánto brilló Lumi</Text>
            <Text style={styles.meterHeadSide}>Por tramo de tu límite</Text>
          </View>
          <View style={styles.week}>
            {WEEK.map((d, i) => {
              const rest = d.lit === 0;
              const today = i === WEEK.length - 1;
              return (
                <View
                  key={d.day}
                  style={styles.day}
                  accessible
                  accessibilityLabel={rest ? `${d.day}: día de descanso` : `${d.day}: ${d.lit} de 4 tramos de luz`}>
                  <View
                    style={[
                      styles.bar,
                      { height: ((rest ? 1 : d.lit) / 4) * (WEEK_HEIGHT - LABEL_SPACE) },
                      rest ? styles.barRest : styles.barLit,
                    ]}
                  />
                  <Text style={[styles.dayLabel, today && { color: Colors.amberPale }]}>{d.day}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.chartNote}>Cuanto más alta la barra, más luz le quedó a Lumi al final del día.</Text>
        </Card>

        <View style={styles.share}>
          <Image
            source={LUMI_STATES.radiante.image}
            style={styles.shareLumi}
            contentFit="contain"
            accessibilityLabel="Lumi, radiante"
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
              Semana {EVOLUTION.week} de {EVOLUTION.weeksPerStage}
            </Text>
          }>
          Evolución
        </SectionTitle>
        <Card style={styles.evo}>
          {EVOLUTION.stages.map((stage, i) => {
            const reached = i <= EVOLUTION.current;
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
