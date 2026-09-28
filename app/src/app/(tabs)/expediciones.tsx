import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PostcardView } from '@/components/postcard';
import { SectionTitle, Screen, TextLink } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { itemById } from '@/game/catalog';
import { destinationById, DESTINATIONS, fromDestination } from '@/game/destinations';
import { capitalize, whenLabel, withIndefinite } from '@/game/format';
import { useGame, type GameApi } from '@/game/store';
import type { Destination } from '@/game/types';
import { useLumi } from '@/lumi/store';

const CARD_TILT = [-2, 1.5, -1];
/** Cuántas visitas recientes se ven en el camino. */
const RECENT_VISITS = 3;

type ZoneStatus = 'visited' | 'current' | 'waiting' | 'locked' | 'plus';
type Zone = { key: string; destination: Destination; status: ZoneStatus; note: string };

/**
 * El camino: las últimas visitas, el destino de hoy y lo que viene después
 * (los dos siguientes por días de luz y, sin Plus, una zona de Lumi Plus).
 */
function buildTrail(game: GameApi, lumiName: string, isPlus: boolean): Zone[] {
  const zones: Zone[] = [];

  for (const day of game.history.filter((d) => d.expedition).slice(-RECENT_VISITS)) {
    const expedition = day.expedition!;
    const destination = destinationById(expedition.destinationId);
    if (!destination) continue;
    const first = expedition.itemIds.map(itemById).find((i) => i);
    const when = capitalize(`visitada ${whenLabel(day.date, game.today)}`);
    zones.push({
      key: `v-${day.date}`,
      destination,
      status: 'visited',
      note: first ? `${when}. Trajo ${withIndefinite(first)}.` : `${when}.`,
    });
  }

  const today = game.todayDestination;
  if (today && !game.todayRecord.closed) {
    zones.push(
      game.currentDestination
        ? { key: 'today', destination: today, status: 'current', note: `Ahora mismo. Vuelve a las ${game.returnsAt}.` }
        : { key: 'today', destination: today, status: 'waiting', note: `Otro día, cuando a ${lumiName} le quede luz.` },
    );
  }

  const shown = new Set(zones.map((z) => z.destination.id));
  const upcoming = DESTINATIONS.filter(
    (d) => !d.plus && !shown.has(d.id) && !game.visited.includes(d.id) && d.unlockAfterBrightDays > game.brightDays,
  )
    .sort((a, b) => a.unlockAfterBrightDays - b.unlockAfterBrightDays)
    .slice(0, 2);
  for (const destination of upcoming) {
    const left = destination.unlockAfterBrightDays - game.brightDays;
    zones.push({
      key: `l-${destination.id}`,
      destination,
      status: 'locked',
      note: `Se abre con ${left} ${left === 1 ? 'día' : 'días'} más de luz.`,
    });
  }

  if (!isPlus) {
    const plus = DESTINATIONS.find((d) => d.plus && !shown.has(d.id) && !game.visited.includes(d.id));
    if (plus) zones.push({ key: `p-${plus.id}`, destination: plus, status: 'plus', note: 'Zona de Lumi Plus.' });
  }
  return zones;
}

export default function ExpeditionsScreen() {
  const { settings } = useLumi();
  const game = useGame();
  const zones = buildTrail(game, settings.lumiName, settings.isPlus);
  const postcards = [...game.album]
    .sort((a, b) => b.savedAt - a.savedAt)
    .flatMap((entry) => {
      const destination = destinationById(entry.destinationId);
      return destination ? [{ entry, destination }] : [];
    });

  return (
    <Screen title="Expediciones" subtitle={`${settings.lumiName} explora una zona nueva cada día que le dejas brillar.`}>
      <View style={styles.trail}>
        <View style={styles.trailLine} />
        {zones.map((zone) => {
          const { status } = zone;
          const locked = status === 'locked' || status === 'plus' || status === 'waiting';
          return (
            <Pressable
              key={zone.key}
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
              <View style={[styles.thumb, { experimental_backgroundImage: zone.destination.art }]} />
              <View style={styles.txt}>
                <Text style={styles.zoneName}>{zone.destination.name}</Text>
                <Text style={styles.zoneNote}>{zone.note}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 10 }}>
        <SectionTitle action={<TextLink label="Ver álbum" onPress={() => router.navigate('/coleccion')} />}>
          Postales recibidas
        </SectionTitle>
        {postcards.length === 0 ? (
          <Text style={styles.empty}>Aún no hay postales. Esta noche, quizá la primera ✨</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cardsRow}
            contentContainerStyle={styles.cardsRowContent}>
            {postcards.map(({ entry, destination }, i) => (
              <Pressable
                key={entry.destinationId}
                accessibilityRole="button"
                accessibilityLabel={`Postal ${fromDestination(destination)}`}
                onPress={() => router.push({ pathname: '/postal', params: { id: destination.id } })}>
                <PostcardView
                  title={destination.name}
                  caption={`«${destination.quote}»`}
                  art={destination.art}
                  width={128}
                  rotate={CARD_TILT[i % CARD_TILT.length]}
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
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
  empty: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20, color: Colors.textSecondary },
  cardsRowContent: { gap: 10, paddingHorizontal: 18, paddingVertical: 8 },
});
