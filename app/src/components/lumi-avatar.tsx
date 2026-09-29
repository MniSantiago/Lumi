import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Fonts } from '@/constants/theme';
import type { LumiState } from '@/lumi/states';

const loop = { easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System };

/**
 * Lumi flotando y respirando, con un halo que depende de cuánta luz le queda.
 * Con `onPress` se puede tocar: da un saltito blandito (o se acurruca, si duerme).
 */
export function LumiAvatar({
  state,
  size = 200,
  onPress,
  accessibilityHint,
  halo,
}: {
  state: LumiState;
  size?: number;
  /** Degradado del halo (el color de su etapa de evolución); por defecto, ámbar. */
  halo?: string;
  onPress?: () => void;
  accessibilityHint?: string;
}) {
  const asleep = state.key === 'apagadita';
  const float = useSharedValue(0);
  const breathe = useSharedValue(0);
  const poke = useSharedValue(0);

  const handlePress = () => {
    poke.value = withSequence(
      withTiming(1, { duration: 110, easing: Easing.out(Easing.quad), reduceMotion: ReduceMotion.System }),
      withTiming(0, { duration: 420, easing: Easing.out(Easing.back(3)), reduceMotion: ReduceMotion.System }),
    );
    onPress?.();
  };

  useEffect(() => {
    // Dormida no flota: solo respira, más despacio.
    float.value = asleep ? withTiming(0) : withRepeat(withTiming(1, { duration: 2600, ...loop }), -1, true);
    breathe.value = withRepeat(withTiming(1, { duration: asleep ? 3400 : 2200, ...loop }), -1, true);
  }, [asleep, float, breathe]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -10 * float.value - (asleep ? 0 : 14) * poke.value },
      { scaleX: 1 + 0.015 * breathe.value + 0.08 * poke.value },
      { scaleY: 1 - 0.02 * breathe.value - 0.1 * poke.value },
    ],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: state.glow * (0.55 + 0.25 * breathe.value),
    transform: [{ translateY: -10 * float.value }, { scale: 0.95 + 0.08 * breathe.value }],
  }));

  const box = { width: size, height: size * 1.12, alignItems: 'center', justifyContent: 'flex-end' } as const;
  const content = (
    <>
      <Animated.View
        style={[
          styles.halo,
          { width: size * 1.1, height: size * 1.1, bottom: size * 0.02 },
          halo ? { experimental_backgroundImage: halo } : null,
          haloStyle,
        ]}
      />
      <Animated.View style={[{ width: size, height: size }, bodyStyle]}>
        <Image
          source={state.image}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          transition={250}
          accessibilityLabel={`Lumi, ${state.label.toLowerCase()}`}
        />
      </Animated.View>
      {asleep ? <Zzz size={size} /> : null}
    </>
  );

  if (!onPress) return <View style={box}>{content}</View>;
  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Lumi, ${state.label.toLowerCase()}`}
      accessibilityHint={accessibilityHint}
      style={box}>
      {content}
    </Pressable>
  );
}

function Zzz({ size }: { size: number }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'flex-end' }]}>
      <Z delay={0} style={{ top: size * 0.12, right: size * 0.1, fontSize: 22 }} />
      <Z delay={900} style={{ top: size * 0.0, right: size * 0.0, fontSize: 16 }} />
    </View>
  );
}

function Z({ delay, style }: { delay: number; style: object }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 1800, ...loop }), withTiming(0, { duration: 0 })), -1),
    );
  }, [delay, t]);
  const s = useAnimatedStyle(() => ({
    opacity: t.value < 0.15 ? t.value / 0.15 : 1 - (t.value - 0.15) / 0.85,
    transform: [{ translateY: -14 * t.value }, { translateX: 6 * t.value }],
  }));
  return <Animated.Text style={[styles.z, style, s]}>z</Animated.Text>;
}

const styles = StyleSheet.create({
  halo: {
    position: 'absolute',
    borderRadius: 999,
    // Halo radial suave con el ámbar de su luz.
    experimental_backgroundImage: `radial-gradient(circle, ${Colors.amber}88 0%, ${Colors.amber}22 45%, transparent 70%)`,
  },
  z: { position: 'absolute', fontFamily: Fonts.displayBold, color: Colors.lavenderPale },
});
