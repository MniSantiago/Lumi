import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

/**
 * Pestañas segmentadas (Colección, Armario): una fila de botones dentro de una
 * cápsula, con altura táctil mínima de 44 pt.
 */
export function SegmentTabs<K extends string>({
  items,
  value,
  onChange,
  accessibilityLabel,
}: {
  items: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
  accessibilityLabel?: string;
}) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      {items.map((t) => {
        const on = t.key === value;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(t.key)}
            style={[styles.tab, on && styles.tabOn]}>
            <Text style={[styles.tabText, on && styles.tabTextOn]} numberOfLines={1}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

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
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderRadius: 10,
    borderCurve: 'continuous',
  },
  tabOn: { backgroundColor: Colors.indigoLight },
  tabText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textTertiary },
  tabTextOn: { color: Colors.text },
});
