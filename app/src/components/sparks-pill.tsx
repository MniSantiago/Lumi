import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { SparkGlyph } from '@/components/spark-glyph';
import { Colors, Fonts, Radius } from '@/constants/theme';

/** Píldora ámbar con el saldo de chispas (Hogar, Armario). Solo dibuja: quien la usa pone la accesibilidad. */
export function SparksPill({ value, style }: { value: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.pill, style]}>
      <SparkGlyph size={14} color={Colors.amberPale} />
      <Text style={styles.text}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 201, 107, 0.16)',
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: { fontFamily: Fonts.bodyBold, color: Colors.amberPale, fontSize: 15, fontVariant: ['tabular-nums'] },
});
