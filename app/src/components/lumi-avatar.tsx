import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Fonts } from '@/constants/theme';
import type { LumiState, LumiStateKey } from '@/lumi/states';

const loop = { easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System };
const ease = (duration: number) => ({ duration, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.System });

/**
 * Datos de cada ilustración para animarla: tamaño original, fotograma de parpadeo
 * (ojos cerrados, alineado píxel a píxel; lo genera `tools/make_blink.py`) y dónde
 * están las luces de las antenas (centro y radio, en fracción del ancho y alto).
 */
const RIG: Record<
  LumiStateKey,
  { w: number; h: number; blink?: number; orbs: [number, number, number][] }
> = {
  radiante: { w: 640, h: 613, orbs: [[0.318, 0.114, 0.041], [0.56, 0.112, 0.043]] },
  contenta: {
    w: 570,
    h: 640,
    blink: require('@/assets/lumi/contenta-parpadeo.png'),
    orbs: [[0.318, 0.168, 0.054], [0.631, 0.167, 0.054]],
  },
  cansada: {
    w: 619,
    h: 640,
    blink: require('@/assets/lumi/cansada-parpadeo.png'),
    orbs: [[0.202, 0.117, 0.046], [0.457, 0.094, 0.046]],
  },
  apagadita: { w: 522, h: 640, orbs: [[0.094, 0.372, 0.043], [0.259, 0.294, 0.045]] },
};

/** Gestos espontáneos de cada estado y cada cuánto (ms) le da por hacer uno. */
type Gesture = 'hop' | 'wiggle' | 'look' | 'stretch' | 'sway' | 'snuggle';
const MOODS: Record<LumiStateKey, { gestures: Gesture[]; every: [number, number] }> = {
  radiante: { gestures: ['hop', 'hop', 'wiggle', 'look'], every: [3500, 7000] },
  contenta: { gestures: ['look', 'look', 'stretch', 'hop'], every: [5000, 10000] },
  cansada: { gestures: ['sway', 'stretch'], every: [7000, 13000] },
  apagadita: { gestures: ['snuggle'], every: [9000, 16000] },
};

const between = ([a, b]: [number, number]) => a + Math.random() * (b - a);

/**
 * Lumi flotando y respirando, con un halo que depende de cuánta luz le queda.
 * Parpadea y le laten las luces de las antenas. Con `onPress` se puede tocar: da un
 * saltito blandito y suelta chispas (o se acurruca, si duerme). Con `alive` (por
 * defecto, cuando se puede tocar) además hace gestos por su cuenta de vez en cuando.
 */
export function LumiAvatar({
  state,
  size = 200,
  onPress,
  accessibilityHint,
  halo,
  alive = !!onPress,
}: {
  state: LumiState;
  size?: number;
  /** Degradado del halo (el color de su etapa de evolución); por defecto, ámbar. */
  halo?: string;
  onPress?: () => void;
  accessibilityHint?: string;
  /** Gestos espontáneos (mirar alrededor, saltitos…). */
  alive?: boolean;
}) {
  const asleep = state.key === 'apagadita';
  const reduced = useReducedMotion();
  const rig = RIG[state.key];

  const float = useSharedValue(0);
  const breathe = useSharedValue(0);
  const poke = useSharedValue(0);
  const blink = useSharedValue(0);
  const tilt = useSharedValue(0); // grados
  const hop = useSharedValue(0); // 0..1 de salto
  const stretch = useSharedValue(0); // >0 se estira, <0 se aplasta
  const [bursts, setBursts] = useState<number[]>([]);
  const burstId = useRef(0);

  const handlePress = () => {
    poke.value = withSequence(
      withTiming(1, { duration: 110, easing: Easing.out(Easing.quad), reduceMotion: ReduceMotion.System }),
      withTiming(0, { duration: 420, easing: Easing.out(Easing.back(3)), reduceMotion: ReduceMotion.System }),
    );
    if (!asleep && !reduced) {
      const id = ++burstId.current;
      setBursts((b) => [...b.slice(-2), id]);
      setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 1100);
    }
    onPress?.();
  };

  useEffect(() => {
    // Dormida no flota: solo respira, más despacio.
    float.value = asleep ? withTiming(0) : withRepeat(withTiming(1, { duration: 2600, ...loop }), -1, true);
    breathe.value = withRepeat(withTiming(1, { duration: asleep ? 3400 : 2200, ...loop }), -1, true);
  }, [asleep, float, breathe]);

  // Parpadeo: cada pocos segundos, a veces doble.
  useEffect(() => {
    if (!rig.blink || reduced) return;
    let timer: ReturnType<typeof setTimeout>;
    const once = () => withSequence(withTiming(1, { duration: 40 }), withDelay(90, withTiming(0, { duration: 60 })));
    const schedule = () => {
      timer = setTimeout(() => {
        blink.value = Math.random() < 0.2 ? withSequence(once(), withDelay(120, once())) : once();
        schedule();
      }, between(state.key === 'cansada' ? [2200, 4500] : [2500, 6000]));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [rig.blink, reduced, state.key, blink]);

  // Gestos espontáneos.
  useEffect(() => {
    if (!alive || reduced) return;
    const mood = MOODS[state.key];
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        const g = mood.gestures[Math.floor(Math.random() * mood.gestures.length)];
        play(g, { tilt, hop, stretch });
        schedule();
      }, between(mood.every));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [alive, reduced, state.key, tilt, hop, stretch]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -10 * float.value - (asleep ? 0 : 14) * poke.value - 22 * hop.value },
      { rotate: `${tilt.value}deg` },
      { scaleX: 1 + 0.015 * breathe.value + 0.08 * poke.value - 0.05 * stretch.value },
      { scaleY: 1 - 0.02 * breathe.value - 0.1 * poke.value + 0.07 * stretch.value },
    ],
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: state.glow * (0.55 + 0.25 * breathe.value),
    transform: [{ translateY: -10 * float.value - 22 * hop.value }, { scale: 0.95 + 0.08 * breathe.value }],
  }));
  const blinkStyle = useAnimatedStyle(() => ({ opacity: blink.value }));

  // Dónde cae la ilustración dentro del cuadrado (contentFit="contain").
  const k = size / Math.max(rig.w, rig.h);
  const art = { w: rig.w * k, h: rig.h * k, x: (size - rig.w * k) / 2, y: (size - rig.h * k) / 2 };
  // las chispas salen a la altura de las antenas (el cuerpo está pegado abajo en la caja)
  const top = size * 0.12 + art.y + Math.min(...rig.orbs.map(([, cy]) => cy)) * art.h;

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
      <Animated.View style={[{ width: size, height: size, transformOrigin: '50% 92%' }, bodyStyle]}>
        <Image
          source={state.image}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          transition={250}
          accessibilityLabel={`Lumi, ${state.label.toLowerCase()}`}
        />
        {rig.blink ? (
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, blinkStyle]}>
            <Image source={rig.blink} style={StyleSheet.absoluteFill} contentFit="contain" />
          </Animated.View>
        ) : null}
        {rig.orbs.map(([cx, cy, r], i) => (
          <Orb
            key={`${state.key}-${i}`}
            x={art.x + cx * art.w}
            y={art.y + cy * art.h}
            r={r * art.w}
            glow={state.glow}
            phase={i}
            breathe={breathe}
          />
        ))}
      </Animated.View>
      {asleep ? <Zzz size={size} /> : null}
      {bursts.map((id) => (
        <Burst key={id} size={size} top={top} />
      ))}
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

function play(
  g: Gesture,
  { tilt, hop, stretch }: { tilt: SharedValue<number>; hop: SharedValue<number>; stretch: SharedValue<number> },
) {
  const side = Math.random() < 0.5 ? -1 : 1;
  switch (g) {
    case 'hop': // se agacha, salta y aterriza blandito; a veces dos veces
      stretch.value = withSequence(
        withTiming(-0.8, ease(140)),
        withTiming(0.6, ease(160)),
        withTiming(-0.5, ease(160)),
        withTiming(0, { duration: 380, easing: Easing.out(Easing.back(2.5)), reduceMotion: ReduceMotion.System }),
      );
      hop.value = withSequence(
        withDelay(140, withTiming(1, { duration: 230, easing: Easing.out(Easing.quad), reduceMotion: ReduceMotion.System })),
        withTiming(0, { duration: 230, easing: Easing.in(Easing.quad), reduceMotion: ReduceMotion.System }),
      );
      break;
    case 'wiggle': // se menea de contento
      tilt.value = withSequence(
        withTiming(5 * side, ease(110)),
        withTiming(-5 * side, ease(160)),
        withTiming(4 * side, ease(150)),
        withTiming(-3 * side, ease(140)),
        withTiming(0, ease(160)),
      );
      break;
    case 'look': // se inclina a un lado, espera, y al otro
      tilt.value = withSequence(
        withTiming(6 * side, ease(420)),
        withDelay(700, withTiming(-5 * side, ease(520))),
        withDelay(600, withTiming(0, ease(420))),
      );
      break;
    case 'stretch': // se estira hacia arriba y se relaja
      stretch.value = withSequence(
        withTiming(1, ease(700)),
        withDelay(250, withTiming(-0.3, ease(380))),
        withTiming(0, ease(300)),
      );
      break;
    case 'sway': // cansada: se balancea muy despacio
      tilt.value = withSequence(withTiming(4 * side, ease(1400)), withTiming(-2 * side, ease(1400)), withTiming(0, ease(1100)));
      break;
    case 'snuggle': // dormida: se acurruca un poquito
      stretch.value = withSequence(withTiming(-0.5, ease(700)), withDelay(300, withTiming(0, ease(900))));
      tilt.value = withSequence(withTiming(2 * side, ease(700)), withDelay(300, withTiming(0, ease(900))));
      break;
  }
}

/** Luz de una antena: late despacio, desfasada de la otra, más fuerte cuanta más luz le queda. */
function Orb({
  x,
  y,
  r,
  glow,
  phase,
  breathe,
}: {
  x: number;
  y: number;
  r: number;
  glow: number;
  phase: number;
  breathe: SharedValue<number>;
}) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withDelay(phase * 700, withRepeat(withTiming(1, { duration: 1600, ...loop }), -1, true));
  }, [phase, pulse]);
  const d = r * 5;
  const s = useAnimatedStyle(() => ({
    opacity: (0.25 + 0.75 * glow) * (0.35 + 0.45 * pulse.value + 0.1 * breathe.value),
    transform: [{ scale: 0.85 + 0.3 * pulse.value }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.orb, { left: x - d / 2, top: y - d / 2, width: d, height: d }, s]}
    />
  );
}

/** Chispas que salen de Lumi al tocarla. */
function Burst({ size, top }: { size: number; top: number }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center' }]}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Spark key={i} i={i} size={size} top={top} />
      ))}
    </View>
  );
}

function Spark({ i, size, top }: { i: number; size: number; top: number }) {
  const t = useSharedValue(0);
  // abanico hacia arriba, con algo de azar
  const [angle] = useState(() => (-150 + i * 24 + (Math.random() * 14 - 7)) * (Math.PI / 180));
  const [dist] = useState(() => size * (0.32 + Math.random() * 0.18));
  useEffect(() => {
    t.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System });
  }, [t]);
  const s = useAnimatedStyle(() => ({
    opacity: t.value < 0.2 ? t.value / 0.2 : 1 - (t.value - 0.2) / 0.8,
    transform: [
      { translateX: Math.cos(angle) * dist * t.value },
      { translateY: Math.sin(angle) * dist * t.value },
      { scale: 0.6 + 0.6 * Math.sin(Math.PI * t.value) },
      { rotate: `${90 * t.value}deg` },
    ],
  }));
  return (
    <Animated.Text style={[styles.spark, { top, color: i % 2 ? Colors.amberPale : Colors.lavenderPale }, s]}>
      ✦
    </Animated.Text>
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
  orb: {
    position: 'absolute',
    borderRadius: 999,
    experimental_backgroundImage: `radial-gradient(circle, ${Colors.amberPale}cc 0%, ${Colors.amber}55 30%, transparent 68%)`,
  },
  spark: { position: 'absolute', fontSize: 18 },
  z: { position: 'absolute', fontFamily: Fonts.displayBold, color: Colors.lavenderPale },
});
