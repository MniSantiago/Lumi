import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { SparkGlyph } from '@/components/spark-glyph';
import { Colors } from '@/constants/theme';
import { useAppReady } from '@/splash/state';
import { SPLASH, shouldExit } from '@/splash/timing';

/** Mismo lienzo (cuadrado, 240 pt, centrado) que la splash nativa: la transición no se nota. */
const BOX = 240;
const LAMPI = require('@/assets/images/splash-lampi.webp');
const LAMPI_RADIANTE = require('@/assets/lumi/splash-radiante.webp');

/** Chispas alrededor de Lampi: posición respecto al centro del lienzo, tamaño y retraso (ms). */
const SPARKS = [
  { x: -104, y: -78, size: 22, delay: 250, color: Colors.amberPale },
  { x: 100, y: -92, size: 28, delay: 380, color: Colors.amber },
  { x: 118, y: 6, size: 14, delay: 520, color: Colors.amberPale },
  { x: -122, y: 30, size: 16, delay: 640, color: Colors.lavenderPale },
  { x: -70, y: 112, size: 18, delay: 450, color: Colors.amber },
  { x: 84, y: 104, size: 22, delay: 580, color: Colors.amberPale },
];

/** Una vez por arranque de la app: cubre también los remontajes del layout raíz (volver de segundo plano no lo remonta). */
let played = false;

/**
 * Splash animada en JS. La nativa (expo-splash-screen) enseña a Lampi quieta sobre el
 * fondo de la app; en cuanto esta capa tiene su imagen pintada, la nativa se quita y
 * Lampi sigue exactamente donde estaba: se enciende su resplandor, brillan unas
 * chispas, da un saltito y se pone radiante. Se despide con un fundido en cuanto la
 * app está lista (y pasó el mínimo de la animación). Con "reducir movimiento" no hay
 * gestos: Lampi quieta y un fundido corto.
 */
export function AnimatedSplash() {
  const reduced = useReducedMotion();
  const appReady = useAppReady();
  const [done, setDone] = useState(played);
  const [started, setStarted] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const exiting = useRef(false);
  const nativeHidden = useRef(false);

  const opacity = useSharedValue(1);
  const glow = useSharedValue(0);
  const pulse = useSharedValue(1);
  const pose = useSharedValue(0);
  const hop = useSharedValue(0);
  const squash = useSharedValue(1);

  // La nativa se quita cuando nuestra imagen está pintada (o, si fallara, pasado un tiempo).
  const hideNative = () => {
    if (nativeHidden.current) return;
    nativeHidden.current = true;
    SplashScreen.hideAsync().catch(() => {});
    setStarted(true);
  };
  useEffect(() => {
    if (done) {
      SplashScreen.hideAsync().catch(() => {});
      return;
    }
    const t = setTimeout(hideNative, SPLASH.nativeHideFallback);
    return () => clearTimeout(t);
  });

  // Arranca la coreografía y el reloj del mínimo.
  useEffect(() => {
    if (!started || done) return;
    if (reduced) return;
    const timer = setTimeout(() => setMinElapsed(true), SPLASH.minShow);
    glow.set(withTiming(1, { duration: 450, easing: Easing.out(Easing.quad) }));
    pulse.set(
      withDelay(500, withRepeat(withTiming(1.1, { duration: 650, easing: Easing.inOut(Easing.sin) }), -1, true)),
    );
    // Saltito con un poco de chafado al caer; Lampi se pone radiante en el aire.
    hop.set(
      withDelay(
        480,
        withSequence(
          withTiming(-20, { duration: 230, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 210, easing: Easing.in(Easing.quad) }),
        ),
      ),
    );
    squash.set(
      withDelay(
        440,
        withSequence(
          withTiming(0.96, { duration: 40 }),
          withTiming(1.03, { duration: 230 }),
          withTiming(0.97, { duration: 210 }),
          withTiming(1, { duration: 140 }),
        ),
      ),
    );
    pose.set(withDelay(560, withTiming(1, { duration: 200 })));
    return () => clearTimeout(timer);
  }, [started, done, reduced, glow, pulse, hop, squash, pose]);

  // Despedida: fundido en cuanto la app esté lista y haya pasado el mínimo.
  useEffect(() => {
    if (done || !started || exiting.current || !shouldExit({ appReady, minElapsed: reduced || minElapsed })) return;
    exiting.current = true;
    const finish = () => {
      played = true;
      setDone(true);
    };
    opacity.set(
      withTiming(
        0,
        { duration: reduced ? SPLASH.fadeOutReduced : SPLASH.fadeOut, easing: Easing.out(Easing.quad) },
        (finished) => {
          if (finished) scheduleOnRN(finish);
        },
      ),
    );
  }, [appReady, minElapsed, started, done, reduced, opacity]);

  const root = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  const body = useAnimatedStyle(() => ({
    transform: [{ translateY: hop.get() }, { scale: squash.get() }],
  }));
  const calm = useAnimatedStyle(() => ({ opacity: 1 - pose.get() }));
  const happy = useAnimatedStyle(() => ({ opacity: pose.get() }));
  const halo = useAnimatedStyle(() => ({ opacity: glow.get(), transform: [{ scale: pulse.get() }] }));

  if (done) return null;

  return (
    <Animated.View
      style={[styles.root, root]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      {!reduced && (
        <Animated.View pointerEvents="none" style={[styles.center, halo]}>
          {[300, 250, 205, 165, 130].map((d) => (
            <View key={d} style={[styles.ring, { width: d, height: d, borderRadius: d / 2 }]} />
          ))}
        </Animated.View>
      )}
      <Animated.View style={[styles.box, body]}>
        <Animated.View style={[StyleSheet.absoluteFill, calm]}>
          <Image source={LAMPI} contentFit="contain" style={styles.fill} onDisplay={hideNative} onError={hideNative} />
        </Animated.View>
        {!reduced && (
          <Animated.View style={[StyleSheet.absoluteFill, happy]}>
            <Image source={LAMPI_RADIANTE} contentFit="contain" style={styles.fill} />
          </Animated.View>
        )}
      </Animated.View>
      {!reduced && started && SPARKS.map((s, i) => <Spark key={i} {...s} />)}
    </Animated.View>
  );
}

function Spark({ x, y, size, delay, color }: (typeof SPARKS)[number]) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) }),
            withTiming(0.3, { duration: 420, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true,
        ),
      ),
    );
  }, [t, delay]);
  const style = useAnimatedStyle(() => ({
    opacity: t.get(),
    transform: [{ scale: 0.4 + 0.6 * t.get() }, { rotate: `${(1 - t.get()) * 25}deg` }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.spark, { marginLeft: x - size / 2, marginTop: y - size / 2 }, style]}
    >
      <SparkGlyph size={size} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: Colors.night,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', backgroundColor: 'rgba(255, 201, 107, 0.055)' },
  box: { width: BOX, height: BOX },
  fill: { width: '100%', height: '100%' },
  spark: { position: 'absolute' },
});
