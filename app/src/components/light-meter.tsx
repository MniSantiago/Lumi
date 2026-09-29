import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { Colors, Radius } from '@/constants/theme';
import { tr } from '@/i18n';

/** "Luz de hoy": cuatro tramos, uno por umbral. Muestra la luz que le queda, no los minutos. */
export function LightMeter({ lit, note, compact = false }: { lit: number; note?: string; compact?: boolean }) {
  return (
    <View style={{ gap: 8 }}>
      {compact ? null : (
        <View style={styles.row}>
          <AppText variant="label">
            {tr({ es: 'Luz de hoy', en: 'Today’s light', zh: '今天的光', hi: 'आज की रोशनी', fr: 'Lumière du jour' })}
          </AppText>
          {note ? <AppText variant="caption">{note}</AppText> : null}
        </View>
      )}
      <View
        style={styles.segments}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={tr({
          es: `Luz de hoy: ${lit} de 4 tramos`,
          en: `Today’s light: ${lit} of 4 segments`,
          zh: `今天的光：4 段中的 ${lit} 段`,
          hi: `आज की रोशनी: 4 में से ${lit} हिस्से`,
          fr: `Lumière du jour : ${lit} tranches sur 4`,
        })}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.segment, i < lit ? styles.lit : styles.off]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  segments: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 10, borderRadius: Radius.pill },
  lit: {
    experimental_backgroundImage: `linear-gradient(90deg, ${Colors.amber}, ${Colors.amberPale})`,
    boxShadow: `0 0 10px ${Colors.amber}80`,
  },
  off: { backgroundColor: 'rgba(201, 191, 242, 0.14)' },
});
