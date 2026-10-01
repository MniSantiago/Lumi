import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { haptic } from '@/haptics';
import { CollectionDetail, type CollectionDetailData } from '@/components/collection-detail';
import { CollectionIcon } from '@/components/collection-icon';
import { PostcardView } from '@/components/postcard';
import { Screen } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { FRIEND_CATALOG, ITEM_CATALOG } from '@/game/catalog';
import { destinationById, DESTINATIONS } from '@/game/destinations';
import { useGame } from '@/game/store';
import { parseDateKey } from '@/game/clock';
import type { CatalogEntry, DayRecord, ExpeditionResult } from '@/game/types';
import { useLumi } from '@/lumi/store';
import { tr } from '@/i18n';
import { dayMonth } from '@/i18n/dates';
import { nightlyCopy } from '@/nightly/copy';
import { useTourOnFocus } from '@/tour/store';
import { TourTarget } from '@/tour/target';

const undiscovered = tr({
  es: 'Por descubrir',
  en: 'Undiscovered',
  zh: '待发现',
  hi: 'अभी खोजना है',
  fr: 'À découvrir',
});

const tapHint = tr({
  es: 'Abre una vista grande',
  en: 'Opens a large view',
  zh: '打开大图',
  hi: 'बड़ा दृश्य खुलता है',
  fr: 'Ouvre une vue agrandie',
});

type Section = 'postales' | 'objetos' | 'amigos';
const SECTIONS: { key: Section; label: string }[] = [
  { key: 'postales', label: tr({ es: 'Postales', en: 'Postcards', zh: '明信片', hi: 'पोस्टकार्ड', fr: 'Cartes' }) },
  { key: 'objetos', label: tr({ es: 'Objetos', en: 'Things', zh: '物品', hi: 'चीज़ें', fr: 'Objets' }) },
  { key: 'amigos', label: tr({ es: 'Amigos', en: 'Friends', zh: '朋友', hi: 'दोस्त', fr: 'Amis' }) },
];

/** Siluetas para lo que aún no se ha descubierto (sin desvelar la forma real). */
const MYSTERY_ICONS = ['misterio-arco', 'misterio-caja', 'misterio-bola', 'misterio-ovalo', 'misterio-pico'];

export default function CollectionScreen() {
  useTourOnFocus('coleccion');
  const [section, setSection] = useState<Section>('postales');
  const { settings } = useLumi();
  const game = useGame();
  const postcards = [...game.album]
    .sort((a, b) => b.savedAt - a.savedAt)
    .flatMap((entry) => {
      const destination = destinationById(entry.destinationId);
      return destination ? [destination] : [];
    });
  // Lo que falta, en orden de capítulo, como postales cerradas: se ve lo que queda por descubrir.
  const missing = DESTINATIONS.filter((d) => !postcards.some((p) => p.id === d.id)).sort(
    (a, b) => a.chapter - b.chapter,
  );
  const ownedItems = ITEM_CATALOG.filter((i) => game.items.includes(i.id)).length;
  const ownedFriends = FRIEND_CATALOG.filter((f) => game.friends.includes(f.id)).length;

  return (
    <Screen
      title={tr({ es: 'Colección', en: 'Collection', zh: '收藏', hi: 'संग्रह', fr: 'Collection' })}
      subtitle={tr({
        es: `Todo lo que ${settings.lumiName} ha traído de sus viajes.`,
        en: `Everything ${settings.lumiName} has brought back from her trips.`,
        zh: `${settings.lumiName}旅行带回来的所有东西。`,
        hi: `सब कुछ जो ${settings.lumiName} अपने सफ़रों से लाई है।`,
        fr: `Tout ce que ${settings.lumiName} a rapporté de ses voyages.`,
      })}>
      <View>
        <TourTarget id="col.tabs">
          <View
            style={styles.tabs}
            accessibilityRole="tablist"
            accessibilityLabel={tr({
              es: 'Tipo de colección',
              en: 'Collection type',
              zh: '收藏类型',
              hi: 'संग्रह का प्रकार',
              fr: 'Type de collection',
            })}>
            {SECTIONS.map((s) => {
              const on = s.key === section;
              return (
                <Pressable
                  key={s.key}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  onPress={() => setSection(s.key)}
                  style={[styles.tab, on && styles.tabOn]}>
                  <Text style={[styles.tabText, on && { color: Colors.text }]}>{s.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </TourTarget>

        {section === 'postales' ? (
          <>
            <Text style={styles.count}>
              {tr({
                es: `${postcards.length} de ${DESTINATIONS.length} destinos`,
                en: `${postcards.length} of ${DESTINATIONS.length} places`,
                zh: `${postcards.length} / ${DESTINATIONS.length} 个地方`,
                hi: `${DESTINATIONS.length} में से ${postcards.length} जगहें`,
                fr: `${postcards.length} ${postcards.length <= 1 ? 'lieu' : 'lieux'} sur ${DESTINATIONS.length}`,
              })}
            </Text>
            {postcards.length === 0 ? (
              <Text style={styles.empty}>
                {tr({
                  es: 'Aún no hay postales. Esta noche, quizá la primera',
                  en: 'No postcards yet. Maybe the first one tonight',
                  zh: '还没有明信片。也许今晚就有第一张',
                  hi: 'अभी कोई पोस्टकार्ड नहीं। शायद आज रात पहला आए',
                  fr: 'Pas encore de cartes. Peut-être la première ce soir',
                })}
              </Text>
            ) : null}
            <View style={styles.postGrid}>
              {postcards.map((d) => (
                <Pressable
                  key={d.id}
                  style={styles.postCell}
                  accessibilityRole="button"
                  accessibilityLabel={nightlyCopy.rereadHeader(d)}
                  onPress={() => router.push({ pathname: '/postal', params: { id: d.id } })}>
                  <PostcardView title={d.name} caption={nightlyCopy.chapter(d.chapter)} art={d.art} image={d.image} artHeight={100} />
                </Pressable>
              ))}
              {missing.map((d) => (
                <View key={d.id} style={styles.postCell}>
                  <SealedPostcard chapter={d.chapter} plus={d.plus} />
                </View>
              ))}
            </View>
          </>
        ) : section === 'objetos' ? (
          <ItemGrid
            entries={ITEM_CATALOG}
            owned={game.items}
            kind="item"
            countTimes={(entry) => countFound(game.history, (r) => r.itemIds.includes(entry.id))}
            describe={(entry) => {
              const found = firstFound(game.history, (r) => r.itemIds.includes(entry.id));
              return found
                ? tr({
                    es: `${entry.name}: recuerdo ${found.destination.from}, del ${dayMonth(found.date)}.`,
                    en: `${entry.name}: a keepsake ${found.destination.from}, ${dayMonth(found.date)}.`,
                    zh: `${entry.name}：${dayMonth(found.date)}从${found.destination.from}带回的纪念。`,
                    hi: `${entry.name}: ${dayMonth(found.date)} को ${found.destination.from} से लाई याद।`,
                    fr: `${entry.name} : souvenir ${found.destination.from}, du ${dayMonth(found.date)}.`,
                  })
                : null;
            }}
            caption={tr({
              es: `${ownedItems} de ${ITEM_CATALOG.length} objetos`,
              en: `${ownedItems} of ${ITEM_CATALOG.length} things`,
              zh: `${ownedItems} / ${ITEM_CATALOG.length} 件物品`,
              hi: `${ITEM_CATALOG.length} में से ${ownedItems} चीज़ें`,
              fr: `${ownedItems} ${ownedItems <= 1 ? 'objet' : 'objets'} sur ${ITEM_CATALOG.length}`,
            })}
          />
        ) : (
          <ItemGrid
            entries={FRIEND_CATALOG}
            owned={game.friends}
            kind="friend"
            countTimes={(entry) => countFound(game.history, (r) => r.friendId === entry.id)}
            describe={(entry) => {
              const found = firstFound(game.history, (r) => r.friendId === entry.id);
              return found
                ? tr({
                    es: `${entry.name}: se conocieron en ${found.destination.the} el ${dayMonth(found.date)}.`,
                    en: `${entry.name}: they met in ${found.destination.the} on ${dayMonth(found.date)}.`,
                    zh: `${entry.name}：${dayMonth(found.date)}在${found.destination.the}认识的。`,
                    hi: `${entry.name}: ${dayMonth(found.date)} को ${found.destination.from} में मुलाक़ात हुई।`,
                    fr: `${entry.name} : première rencontre dans ${found.destination.the}, le ${dayMonth(found.date)}.`,
                  })
                : null;
            }}
            caption={tr({
              es: `${ownedFriends} de ${FRIEND_CATALOG.length} criaturas amigas`,
              en: `${ownedFriends} of ${FRIEND_CATALOG.length} creature friends`,
              zh: `${ownedFriends} / ${FRIEND_CATALOG.length} 个小伙伴`,
              hi: `${FRIEND_CATALOG.length} में से ${ownedFriends} जीव दोस्त`,
              fr: `${ownedFriends} ${ownedFriends <= 1 ? 'ami' : 'amis'} sur ${FRIEND_CATALOG.length}`,
            })}
          />
        )}
      </View>
    </Screen>
  );
}

/** Postal aún sin descubrir: mismo tamaño que una de verdad, sin desvelar el lugar. */
function SealedPostcard({ chapter, plus }: { chapter: number; plus: boolean }) {
  return (
    <View
      style={styles.sealed}
      accessible
      accessibilityLabel={`${undiscovered} · ${nightlyCopy.chapter(chapter)}${plus ? ' · Lampi Plus' : ''}`}>
      <View style={styles.sealedArt}>
        <Text style={styles.sealedMark}>?</Text>
      </View>
      <Text style={styles.sealedTitle}>{undiscovered}</Text>
      <Text style={styles.sealedCaption}>
        {plus ? `${nightlyCopy.chapter(chapter)} · Plus` : nightlyCopy.chapter(chapter)}
      </Text>
    </View>
  );
}

/** Primera expedición que cumple `match` (de dónde y cuándo llegó un objeto o un amigo). */
function firstFound(history: DayRecord[], match: (result: ExpeditionResult) => boolean) {
  const day = history.find((d) => d.expedition && match(d.expedition));
  const destination = day?.expedition ? destinationById(day.expedition.destinationId) : undefined;
  return day && destination ? { destination, date: parseDateKey(day.date) } : null;
}

/** Cuántas expediciones han traído algo que cumple `match`. */
function countFound(history: DayRecord[], match: (result: ExpeditionResult) => boolean) {
  return history.filter((d) => d.expedition && match(d.expedition)).length;
}

/** Lo que ya ha traído, primero; lo demás, como siluetas por descubrir. Al tocar uno, de dónde vino. */
function ItemGrid({
  entries,
  owned,
  caption,
  describe,
  countTimes,
  kind,
}: {
  entries: CatalogEntry[];
  owned: string[];
  caption: string;
  kind: 'item' | 'friend';
  describe: (entry: CatalogEntry) => string | null;
  countTimes: (entry: CatalogEntry) => number;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedEntry = entries.find((e) => e.id === selected && owned.includes(e.id));
  const detail: CollectionDetailData | null = selectedEntry
    ? {
        entry: selectedEntry,
        kind,
        origin: describe(selectedEntry),
        times: countTimes(selectedEntry),
        number: entries.indexOf(selectedEntry) + 1,
        total: entries.length,
      }
    : null;
  const sorted = [...entries.filter((e) => owned.includes(e.id)), ...entries.filter((e) => !owned.includes(e.id))];
  let mystery = 0;
  return (
    <>
      <Text style={styles.count}>{caption}</Text>
      {owned.some((id) => entries.some((e) => e.id === id)) ? (
        <Text style={styles.detail}>
          {tr({
            es: 'Toca uno para verlo en grande.',
            en: 'Tap one to see it up close.',
            zh: '轻点一个，大图查看。',
            hi: 'कोई एक टैप करो और उसे बड़ा देखो।',
            fr: 'Touche-en un pour le voir en grand.',
          })}
        </Text>
      ) : null}
      <CollectionDetail data={detail} onClose={() => setSelected(null)} />
      <View style={styles.itemGrid}>
        {sorted.map((entry) => {
          const known = owned.includes(entry.id);
          const icon = known ? entry.icon : MYSTERY_ICONS[mystery++ % MYSTERY_ICONS.length];
          return (
            <View key={entry.id} style={styles.itemCell}>
              <Pressable
                style={styles.item}
                disabled={!known}
                accessibilityRole={known ? 'button' : undefined}
                accessibilityLabel={known ? entry.name : undiscovered}
                accessibilityHint={known ? tapHint : undefined}
                onPress={() => {
                  haptic.selection();
                  setSelected(entry.id);
                }}>
                <CollectionIcon name={icon} locked={!known} />
                <Text style={[styles.itemLabel, !known && { color: Colors.textTertiary }]} numberOfLines={2}>
                  {known ? entry.name : '¿?'}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </>
  );
}

const GRID_GAP = 12;
const ITEM_GAP = 10;

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(201, 191, 242, 0.08)',
    marginBottom: 14,
  },
  tab: { flex: 1, alignItems: 'center', padding: 8, borderRadius: 10, borderCurve: 'continuous' },
  tabOn: { backgroundColor: Colors.indigoLight },
  tabText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textTertiary },
  count: { fontFamily: Fonts.body, fontSize: 13, color: Colors.textTertiary, marginBottom: 12 },
  empty: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginBottom: 14 },
  postGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -GRID_GAP / 2, rowGap: 14 },
  postCell: { width: '50%', paddingHorizontal: GRID_GAP / 2 },
  sealed: {
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(201, 191, 242, 0.28)',
    paddingTop: 6,
    paddingHorizontal: 6,
    paddingBottom: 10,
  },
  sealedArt: {
    height: 100,
    borderRadius: 9,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(201, 191, 242, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealedMark: { fontFamily: Fonts.displayBold, fontSize: 30, color: 'rgba(201, 191, 242, 0.35)' },
  sealedTitle: {
    fontFamily: Fonts.displayBold,
    fontSize: 13,
    lineHeight: 16,
    color: Colors.textTertiary,
    marginTop: 6,
    marginHorizontal: 2,
  },
  sealedCaption: {
    fontFamily: Fonts.body,
    fontSize: 10.5,
    lineHeight: 14,
    color: Colors.textTertiary,
    marginTop: 2,
    marginHorizontal: 2,
  },
  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -ITEM_GAP / 2, rowGap: ITEM_GAP },
  itemCell: { width: '33.333%', paddingHorizontal: ITEM_GAP / 2 },
  item: {
    aspectRatio: 1,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: Colors.cardSolid,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 6,
  },
  detail: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginBottom: 14 },
  itemLabel: { fontFamily: Fonts.body, fontSize: 11, lineHeight: 14, color: Colors.textSecondary, textAlign: 'center' },
});
