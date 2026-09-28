import { StyleSheet, Text, View, type DimensionValue } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

/** Postal en papel crema con su ilustración (por ahora, el degradado del lugar). */
export function PostcardView({
  title,
  caption,
  art,
  width,
  artHeight = 86,
  rotate = 0,
}: {
  title: string;
  caption: string;
  art: string;
  width?: DimensionValue;
  artHeight?: number;
  rotate?: number;
}) {
  return (
    <View style={[styles.card, { width, transform: [{ rotate: `${rotate}deg` }] }]}>
      <View style={[styles.art, { height: artHeight, experimental_backgroundImage: art }]} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderCurve: 'continuous',
    paddingTop: 6,
    paddingHorizontal: 6,
    paddingBottom: 10,
    backgroundColor: Colors.paper,
    boxShadow: '0 10px 20px -10px rgba(0, 0, 0, 0.6)',
  },
  art: { borderRadius: 9, borderCurve: 'continuous' },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 13,
    lineHeight: 16,
    color: Colors.night,
    marginTop: 6,
    marginHorizontal: 2,
  },
  caption: { fontFamily: Fonts.body, fontSize: 10.5, lineHeight: 14, color: Colors.paperInk, marginTop: 2, marginHorizontal: 2 },
});
