import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppText, Card, Pill, SectionTitle, Screen } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { POSTCARDS, ZONES, type ZoneStatus } from '@/lumi/data';
import { useLumi } from '@/lumi/store';

const STATUS_LABEL: Record<ZoneStatus, string | null> = {
  visited: 'Visitada',
  current: 'Ahora',
  locked: null,
  plus: 'Plus',
};

export default function ExpeditionsScreen() {
  const { state } = useLumi();

  return (
    <Screen title="Expediciones" subtitle="Lumi explora una zona nueva cada día que le dejas brillar.">
      <View style={{ gap: Spacing.two }}>
        {ZONES.map((zone) => {
          // Si hoy Lumi se queda en casa, la zona actual espera a mañana.
          const status: ZoneStatus = zone.status === 'current' && !state.exploring ? 'locked' : zone.status;
          const dimmed = status === 'locked' || status === 'plus';
          return (
            <Card key={zone.id} style={[styles.zone, status === 'current' && styles.zoneCurrent]}>
              <View style={[styles.zoneIcon, dimmed && { opacity: 0.45 }]}>
                <Text style={{ fontSize: 24 }}>{zone.emoji}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="heading" style={dimmed && { color: Colors.textSecondary }}>
                  {zone.name}
                </AppText>
                <AppText variant="caption">
                  {zone.status === 'current' && !state.exploring ? 'Mañana, si a Lumi le queda luz.' : zone.note}
                </AppText>
              </View>
              {STATUS_LABEL[status] ? (
                <Pill tone={status === 'current' ? 'amber' : 'lavender'}>{STATUS_LABEL[status]}</Pill>
              ) : (
                <Text style={styles.lock}>🔒</Text>
              )}
            </Card>
          );
        })}
      </View>

      <View style={{ gap: Spacing.three }}>
        <SectionTitle action={<AppText variant="caption">Ver álbum</AppText>}>Postales recibidas</SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingHorizontal: Spacing.three + 4, paddingVertical: 4 }}
          style={{ marginHorizontal: -(Spacing.three + 4) }}>
          {POSTCARDS.slice(0, 3).map((p) => (
            <View key={p.id} style={styles.postcard}>
              <View style={styles.postcardArt}>
                <Text style={{ fontSize: 40 }}>{p.emoji}</Text>
              </View>
              <AppText variant="heading" numberOfLines={1} style={{ color: Colors.night }}>
                {p.place}
              </AppText>
              <Text style={styles.quote}>«{p.quote}»</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  zone: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  zoneCurrent: { borderColor: `${Colors.amber}88`, boxShadow: `0 0 18px ${Colors.amber}33` },
  zoneIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(201, 191, 242, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lock: { fontSize: 16, opacity: 0.6 },
  postcard: {
    width: 200,
    backgroundColor: Colors.lavenderPale,
    borderRadius: Radius.md,
    padding: 10,
    gap: 6,
    transform: [{ rotate: '-1deg' }],
  },
  postcardArt: {
    height: 110,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    experimental_backgroundImage: `linear-gradient(160deg, ${Colors.indigo}, ${Colors.violet})`,
  },
  quote: { fontFamily: Fonts.body, fontStyle: 'italic', fontSize: 13, lineHeight: 18, color: Colors.indigo },
});
