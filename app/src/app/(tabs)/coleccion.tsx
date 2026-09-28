import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CollectionIcon } from '@/components/collection-icon';
import { PostcardView } from '@/components/postcard';
import { Screen } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import {
  FRIENDS,
  ITEMS,
  POSTCARDS,
  TOTAL_DESTINATIONS,
  TOTAL_FRIENDS,
  TOTAL_ITEMS,
  type Item,
} from '@/lumi/data';

type Section = 'postales' | 'objetos' | 'amigos';
const SECTIONS: { key: Section; label: string }[] = [
  { key: 'postales', label: 'Postales' },
  { key: 'objetos', label: 'Objetos' },
  { key: 'amigos', label: 'Amigos' },
];

export default function CollectionScreen() {
  const [section, setSection] = useState<Section>('postales');

  return (
    <Screen title="Colección" subtitle="Todo lo que Lumi ha traído de sus viajes.">
      <View>
        <View style={styles.tabs} accessibilityRole="tablist" accessibilityLabel="Tipo de colección">
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

        {section === 'postales' ? (
          <>
            <Text style={styles.count}>
              {POSTCARDS.length} de {TOTAL_DESTINATIONS} destinos
            </Text>
            <View style={styles.postGrid}>
              {POSTCARDS.map((p) => (
                <View key={p.id} style={styles.postCell}>
                  <PostcardView title={p.place} caption={`Capítulo ${p.chapter}`} art={p.art} artHeight={100} />
                </View>
              ))}
            </View>
          </>
        ) : section === 'objetos' ? (
          <ItemGrid items={ITEMS} caption={`${ITEMS.filter((i) => i.name).length} de ${TOTAL_ITEMS} objetos`} />
        ) : (
          <ItemGrid
            items={FRIENDS}
            caption={`${FRIENDS.filter((i) => i.name).length} de ${TOTAL_FRIENDS} criaturas amigas`}
          />
        )}
      </View>
    </Screen>
  );
}

function ItemGrid({ items, caption }: { items: Item[]; caption: string }) {
  return (
    <>
      <Text style={styles.count}>{caption}</Text>
      <View style={styles.itemGrid}>
        {items.map((item) => (
          <View key={item.id} style={styles.itemCell}>
            <View style={styles.item} accessible accessibilityLabel={item.name ?? 'Sin descubrir'}>
              <CollectionIcon name={item.icon} locked={!item.name} />
              <Text style={[styles.itemLabel, !item.name && { color: Colors.textTertiary }]} numberOfLines={2}>
                {item.name ?? '¿?'}
              </Text>
            </View>
          </View>
        ))}
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
  postGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -GRID_GAP / 2, rowGap: 14 },
  postCell: { width: '50%', paddingHorizontal: GRID_GAP / 2 },
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
  itemLabel: { fontFamily: Fonts.body, fontSize: 11, lineHeight: 14, color: Colors.textSecondary, textAlign: 'center' },
});
