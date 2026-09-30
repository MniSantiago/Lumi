import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DestinationArt } from '@/components/destination-art';
import { PostcardView } from '@/components/postcard';
import { SectionTitle, Screen, TextLink } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { itemById } from '@/game/catalog';
import { destinationById, DESTINATIONS } from '@/game/destinations';
import { capitalize, whenLabel, withIndefinite } from '@/game/format';
import { useGame, type GameApi } from '@/game/store';
import type { Destination } from '@/game/types';
import { quoted, tr } from '@/i18n';
import { useLumi } from '@/lumi/store';
import { nightlyCopy } from '@/nightly/copy';
import { useTourOnFocus } from '@/tour/store';
import { TourTarget } from '@/tour/target';

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
    const w = whenLabel(day.date, game.today);
    const when = capitalize(
      tr({ es: `visitada ${w}`, en: `visited ${w}`, zh: `${w}去过`, hi: `${w} घूमी`, fr: `visité ${w}` }),
    );
    // Con la postal aún sin abrir, no se desvela lo que trae: esa sorpresa es de la postal.
    const unopened = game.pendingReturn?.date === day.date;
    zones.push({
      key: `v-${day.date}`,
      destination,
      status: 'visited',
      note: unopened
        ? tr({
            es: `${when}. Ha vuelto con una postal sin abrir ✨`,
            en: `${when}. Came back with an unopened postcard ✨`,
            zh: `${when}。带回了一张还没拆开的明信片 ✨`,
            hi: `${when}। एक बिना खुला पोस्टकार्ड लेकर लौटी ✨`,
            fr: `${when}. Rentrée avec une carte pas encore ouverte ✨`,
          })
        : first
          ? tr({
              es: `${when}. Trajo ${withIndefinite(first)}.`,
              en: `${when}. Brought back ${withIndefinite(first)}.`,
              zh: `${when}。带回了${withIndefinite(first)}。`,
              hi: `${when}। ${withIndefinite(first)} लाई।`,
              fr: `${when}. A rapporté ${withIndefinite(first)}.`,
            })
          : `${when}.`,
    });
  }

  const today = game.todayDestination;
  if (today && !game.todayRecord.closed) {
    zones.push(
      game.currentDestination
        ? {
            key: 'today',
            destination: today,
            status: 'current',
            note: tr({
              es: `Ahora mismo. Vuelve a las ${game.returnsAt}.`,
              en: `Right now. Back at ${game.returnsAt}.`,
              zh: `正在进行。${game.returnsAt}回来。`,
              hi: `अभी। ${game.returnsAt} को लौटेगी।`,
              fr: `En ce moment. Retour à ${game.returnsAt}.`,
            }),
          }
        : {
            key: 'today',
            destination: today,
            status: 'waiting',
            note: tr({
              es: `Otro día, cuando a ${lumiName} le quede luz.`,
              en: `Another day, when ${lumiName} has light left.`,
              zh: `改天吧，等${lumiName}还有光的时候。`,
              hi: `किसी और दिन, जब ${lumiName} में रोशनी बची हो।`,
              fr: `Un autre jour, quand il restera de la lumière à ${lumiName}.`,
            }),
          },
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
      note:
        left === 1
          ? tr({
              es: 'Se abre con 1 día más de luz.',
              en: 'Opens after 1 more bright day.',
              zh: '再亮 1 天就能解锁。',
              hi: '1 और रोशन दिन के बाद खुलेगा।',
              fr: 'S’ouvre avec 1 jour de lumière de plus.',
            })
          : tr({
              es: `Se abre con ${left} días más de luz.`,
              en: `Opens after ${left} more bright days.`,
              zh: `再亮 ${left} 天就能解锁。`,
              hi: `${left} और रोशन दिनों के बाद खुलेगा।`,
              fr: `S’ouvre avec ${left} jours de lumière de plus.`,
            }),
    });
  }

  if (!isPlus) {
    const plus = DESTINATIONS.find((d) => d.plus && !shown.has(d.id) && !game.visited.includes(d.id));
    if (plus)
      zones.push({
        key: `p-${plus.id}`,
        destination: plus,
        status: 'plus',
        note: tr({
          es: 'Zona de Lumi Plus.',
          en: 'Lumi Plus area.',
          zh: 'Lumi Plus 专属地点。',
          hi: 'Lumi Plus की जगह।',
          fr: 'Zone Lumi Plus.',
        }),
      });
  }
  return zones;
}

export default function ExpeditionsScreen() {
  useTourOnFocus('expediciones');
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
    <Screen
      title={tr({ es: 'Expediciones', en: 'Expeditions', zh: '探险', hi: 'सफ़र', fr: 'Expéditions' })}
      subtitle={tr({
        es: `${settings.lumiName} explora una zona nueva cada día que le dejas brillar.`,
        en: `${settings.lumiName} explores a new place every day you let her shine.`,
        zh: `每个让${settings.lumiName}发光的日子，她都会探索一个新地方。`,
        hi: `जिस दिन तुम ${settings.lumiName} को चमकने देते हो, वो एक नई जगह घूमती है।`,
        fr: `${settings.lumiName} explore un nouveau lieu chaque jour où tu la laisses briller.`,
      })}>
      <TourTarget id="exp.trail">
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
                style={styles.zone}>
                <View
                  style={[
                    styles.dot,
                    status === 'visited' && styles.dotDone,
                    status === 'current' && styles.dotNow,
                    locked && styles.faded,
                  ]}
                />
                {/* Bloqueada: se apagan el punto y la miniatura; el texto sigue legible (contraste AA). */}
                <DestinationArt
                  art={zone.destination.art}
                  image={zone.destination.image}
                  style={[styles.thumb, locked && styles.faded]}
                />
                <View style={styles.txt}>
                  <Text style={[styles.zoneName, locked && { color: Colors.textSecondary }]}>
                    {zone.destination.name}
                  </Text>
                  <Text style={styles.zoneNote}>{zone.note}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </TourTarget>

      <View style={{ gap: 10 }}>
        <SectionTitle
          action={
            <TextLink
              label={tr({ es: 'Ver álbum', en: 'See album', zh: '查看相册', hi: 'एल्बम देखो', fr: 'Voir l’album' })}
              onPress={() => router.navigate('/coleccion')}
            />
          }>
          {tr({
            es: 'Postales recibidas',
            en: 'Postcards received',
            zh: '收到的明信片',
            hi: 'मिले पोस्टकार्ड',
            fr: 'Cartes reçues',
          })}
        </SectionTitle>
        {postcards.length === 0 ? (
          <Text style={styles.empty}>
            {tr({
              es: 'Aún no hay postales. Esta noche, quizá la primera ✨',
              en: 'No postcards yet. Maybe the first one tonight ✨',
              zh: '还没有明信片。也许今晚就有第一张 ✨',
              hi: 'अभी कोई पोस्टकार्ड नहीं। शायद आज रात पहला आए ✨',
              fr: 'Pas encore de cartes. Peut-être la première ce soir ✨',
            })}
          </Text>
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
                accessibilityLabel={nightlyCopy.rereadHeader(destination)}
                onPress={() => router.push({ pathname: '/postal', params: { id: destination.id } })}>
                <PostcardView
                  title={destination.name}
                  caption={quoted(destination.quote)}
                  art={destination.art}
                  image={destination.image}
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
  faded: { opacity: 0.5 },
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
