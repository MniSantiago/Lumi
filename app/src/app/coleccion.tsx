import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppText, Screen } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
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
      <View style={styles.segmented} accessibilityRole="tablist">
        {SECTIONS.map((s) => {
          const on = s.key === section;
          return (
            <Pressable
              key={s.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setSection(s.key)}
              style={[styles.segment, on && styles.segmentOn]}>
              <Text style={[styles.segmentText, on && { color: Colors.night }]}>{s.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {section === 'postales' ? (
        <View style={{ gap: Spacing.three }}>
          <AppText variant="caption">
            {POSTCARDS.length} de {TOTAL_DESTINATIONS} destinos
          </AppText>
          <View style={styles.grid}>
            {POSTCARDS.map((p) => (
              <View key={p.id} style={styles.postcard}>
                <View style={styles.postcardArt}>
                  <Text style={{ fontSize: 34 }}>{p.emoji}</Text>
                </View>
                <Text style={styles.postcardTitle} numberOfLines={2}>
                  {p.place}
                </Text>
                <Text style={styles.postcardMeta}>Capítulo {p.chapter}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <ItemGrid
          items={section === 'objetos' ? ITEMS : FRIENDS}
          caption={
            section === 'objetos'
              ? `${ITEMS.filter((i) => i.name).length} de ${TOTAL_ITEMS} objetos`
              : `${FRIENDS.filter((i) => i.name).length} de ${TOTAL_FRIENDS} criaturas amigas`
          }
        />
      )}
    </Screen>
  );
}

function ItemGrid({ items, caption }: { items: Item[]; caption: string }) {
  return (
    <View style={{ gap: Spacing.three }}>
      <AppText variant="caption">{caption}</AppText>
      <View style={styles.grid3}>
        {items.map((item) => (
          <View key={item.id} style={[styles.item, !item.name && styles.itemUnknown]}>
            <Text style={{ fontSize: 30, opacity: item.name ? 1 : 0.5 }}>{item.name ? item.emoji : '?'}</Text>
            <AppText variant="caption" numberOfLines={1} style={item.name ? { color: Colors.textSecondary } : undefined}>
              {item.name ?? '¿?'}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    backgroundColor: 'rgba(201, 191, 242, 0.10)',
    borderRadius: Radius.pill,
    padding: 4,
  },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: Radius.pill },
  segmentOn: { backgroundColor: Colors.lavender },
  segmentText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  postcard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: Colors.lavenderPale,
    borderRadius: Radius.md,
    padding: 8,
    gap: 4,
  },
  postcardArt: {
    aspectRatio: 4 / 3,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    experimental_backgroundImage: `linear-gradient(160deg, ${Colors.indigo}, ${Colors.violet})`,
  },
  postcardTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 14, lineHeight: 18, color: Colors.night },
  postcardMeta: { fontFamily: Fonts.body, fontSize: 12, color: Colors.indigo },
  grid3: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: {
    width: '31%',
    flexGrow: 1,
    aspectRatio: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
  },
  itemUnknown: { backgroundColor: 'transparent', borderStyle: 'dashed', borderWidth: 1 },
});
