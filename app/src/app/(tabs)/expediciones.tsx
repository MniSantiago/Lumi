import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PostcardView } from '@/components/postcard';
import { SectionTitle, Screen, TextLink } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { POSTCARDS, ZONES, type ZoneStatus } from '@/lumi/data';
import { useLumi } from '@/lumi/store';

const CARD_TILT = [-2, 1.5, -1];

export default function ExpeditionsScreen() {
  const { state } = useLumi();

  return (
    <Screen title="Expediciones" subtitle="Lumi explora una zona nueva cada día que le dejas brillar.">
      <View style={styles.trail}>
        <View style={styles.trailLine} />
        {ZONES.map((zone) => {
          // Si hoy Lumi se queda en casa, la zona de hoy espera a mañana.
          const waiting = zone.status === 'current' && !state.exploring;
          const status: ZoneStatus = waiting ? 'locked' : zone.status;
          const locked = status === 'locked' || status === 'plus';
          return (
            <Pressable
              key={zone.id}
              disabled={status !== 'plus'}
              onPress={() => router.push('/plus')}
              accessibilityRole={status === 'plus' ? 'button' : undefined}
              style={[styles.zone, locked && { opacity: 0.55 }]}>
              <View
                style={[
                  styles.dot,
                  status === 'visited' && styles.dotDone,
                  status === 'current' && styles.dotNow,
                ]}
              />
              <View style={[styles.thumb, { experimental_backgroundImage: zone.art }]} />
              <View style={styles.txt}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <Text style={styles.zoneNote}>{waiting ? 'Mañana, si a Lumi le queda luz.' : zone.note}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 10 }}>
        <SectionTitle action={<TextLink label="Ver álbum" onPress={() => router.navigate('/coleccion')} />}>
          Postales recibidas
        </SectionTitle>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cardsRow}
          contentContainerStyle={styles.cardsRowContent}>
          {POSTCARDS.slice(0, 3).map((p, i) => (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityLabel={`Postal de ${p.place}`}
              onPress={() => router.push({ pathname: '/postal', params: { id: p.id } })}>
              <PostcardView title={p.place} caption={`«${p.quote}»`} art={p.art} width={128} rotate={CARD_TILT[i]} />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Screen>
  );
}

const TRAIL_PAD = 28;

const styles = StyleSheet.create({
  trail: { gap: 14, paddingLeft: TRAIL_PAD },
  trailLine: {
    position: 'absolute',
    left: 11,
    top: 14,
    bottom: 14,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(201, 191, 242, 0.3)',
  },
  zone: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: {
    position: 'absolute',
    left: -24,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.indigo,
    borderWidth: 2,
    borderColor: Colors.violet,
  },
  dotDone: { backgroundColor: Colors.lavender, borderColor: Colors.lavender },
  dotNow: {
    backgroundColor: Colors.amber,
    borderColor: Colors.amberPale,
    boxShadow: `0 0 0 5px rgba(255, 201, 107, 0.2), 0 0 16px ${Colors.amber}`,
  },
  thumb: { width: 48, height: 48, borderRadius: 14, borderCurve: 'continuous' },
  txt: { flex: 1, minWidth: 0 },
  zoneName: { fontFamily: Fonts.bodyBold, fontSize: 15, lineHeight: 20, color: Colors.text },
  zoneNote: { fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 17, color: Colors.textTertiary },
  // El carrusel llega hasta los bordes de la pantalla.
  cardsRow: { marginHorizontal: -18, overflow: 'visible' },
  cardsRowContent: { gap: 10, paddingHorizontal: 18, paddingVertical: 8 },
});
