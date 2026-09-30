import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

type Fly = { x: number; y: number; r: number; dx: number; dy: number; period: number; delay: number };

/** Luciérnagas sobre la ilustración. Brillan menos cuanta menos luz le queda a Lampi. */
export function Fireflies({ glow, count = 12 }: { glow: number; count?: number }) {
  const flies = useMemo<Fly[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        // Pseudoaleatorio estable para que no salten al re-renderizar.
        const rnd = (n: number) => ((Math.sin(i * 97.13 + n * 13.7) + 1) / 2) % 1;
        return {
          x: rnd(1) * 100,
          y: 42 + rnd(2) * 52,
          r: 2.4 + rnd(3) * 2.6,
          dx: (rnd(4) - 0.5) * 36,
          dy: (rnd(5) - 0.5) * 28,
          period: 3200 + rnd(6) * 3000,
          delay: rnd(7) * 2000,
        };
      }),
    [count],
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {flies.map((f, i) => (
        <Firefly key={i} fly={f} glow={glow} />
      ))}
    </View>
  );
}

function Firefly({ fly, glow }: { fly: Fly; glow: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      fly.delay,
      withRepeat(
        withTiming(1, { duration: fly.period, easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System }),
        -1,
        true,
      ),
    );
  }, [fly, t]);
  const style = useAnimatedStyle(() => ({
    opacity: (0.35 + 0.6 * t.value) * (0.3 + 0.7 * glow),
    transform: [{ translateX: fly.dx * t.value }, { translateY: fly.dy * t.value }],
  }));
  const d = fly.r * 6;
  return (
    <Animated.View
      style={[
        styles.fly,
        { left: `${fly.x}%`, top: `${fly.y}%`, width: d, height: d, marginLeft: -d / 2, marginTop: -d / 2 },
        style,
      ]}>
      <View style={[styles.core, { width: fly.r * 1.4, height: fly.r * 1.4 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fly: {
    position: 'absolute',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    experimental_backgroundImage: `radial-gradient(circle, ${Colors.amberPale}AA 0%, ${Colors.amber}33 40%, transparent 70%)`,
  },
  core: { borderRadius: 999, backgroundColor: '#FFF4D6' },
});
