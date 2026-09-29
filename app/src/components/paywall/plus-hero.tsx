import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { LumiAvatar } from '@/components/lumi-avatar';
import { Colors, Fonts } from '@/constants/theme';
import { LUMI_STATES } from '@/lumi/states';

/** Colores de luz que desbloquea Plus: ámbar, aguamarina, melocotón y lavanda. */
export const LIGHT_COLORS = [Colors.amber, '#9FE3F0', Colors.peach, Colors.lavender] as const;

const loop = { easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System };

const SIZE = 132;
const STAGE_W = 300;
const STAGE_H = SIZE * 1.12;

/** Dónde flota cada orbe alrededor de Lumi (relativo al centro del héroe). */
const ORBS = [
  { x: -104, y: -30, r: 11, delay: 0 },
  { x: 100, y: -46, r: 9, delay: 500 },
  { x: -84, y: 44, r: 8, delay: 1000 },
  { x: 92, y: 34, r: 12, delay: 1500 },
];

/**
 * Lumi radiante con cuatro orbes de luz alrededor. `boost` (0-1) sube su halo
 * y el de los orbes en el momento de éxito.
 */
export function PlusHero({ boost, caption }: { boost: SharedValue<number>; caption?: string }) {
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + 0.75 * boost.value,
    transform: [{ scale: 0.85 + 0.35 * boost.value }],
  }));

  return (
    <View style={styles.hero}>
      <View style={styles.stage}>
        <Animated.View pointerEvents="none" style={[styles.boostHalo, haloStyle]} />
        <LumiAvatar state={LUMI_STATES.radiante} size={SIZE} />
        {ORBS.map((o, i) => (
          <Orb key={i} color={LIGHT_COLORS[i]} {...o} boost={boost} />
        ))}
      </View>
      {caption ? (
        <View style={styles.captionRow} accessibilityRole="text">
          {LIGHT_COLORS.map((c) => (
            <View key={c} style={[styles.dot, { backgroundColor: c, boxShadow: `0 0 8px ${c}` }]} />
          ))}
          <Text style={styles.caption}>{caption}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Orb({
  color,
  x,
  y,
  r,
  delay,
  boost,
}: {
  color: string;
  x: number;
  y: number;
  r: number;
  delay: number;
  boost: SharedValue<number>;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2400, ...loop }), -1, true));
  }, [delay, t]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.7 + 0.3 * t.value,
    transform: [
      { translateY: -6 * t.value },
      { scale: (0.9 + 0.15 * t.value) * (1 + 0.45 * boost.value) },
    ],
  }));

  const d = r * 4;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.orb,
        {
          width: d,
          height: d,
          marginLeft: x - d / 2,
          marginTop: y - d / 2,
          experimental_backgroundImage: `radial-gradient(circle, #FFFFFF 0%, ${color} 22%, ${color}55 45%, transparent 70%)`,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 4 },
  stage: { width: STAGE_W, height: STAGE_H, alignItems: 'center', justifyContent: 'flex-end' },
  boostHalo: {
    position: 'absolute',
    top: (STAGE_H - 240) / 2,
    left: 0,
    width: 300,
    height: 240,
    borderRadius: 999,
    experimental_backgroundImage: `radial-gradient(ellipse, ${Colors.amberPale}66 0%, rgba(159, 227, 240, 0.18) 38%, rgba(201, 191, 242, 0.1) 55%, transparent 72%)`,
  },
  orb: { position: 'absolute', left: '50%', top: '50%', borderRadius: 999 },
  captionRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  caption: { fontFamily: Fonts.bodySemiBold, fontSize: 12, lineHeight: 16, color: Colors.textSecondary, marginLeft: 3 },
});
