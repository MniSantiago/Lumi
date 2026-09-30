import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fireflies } from '@/components/fireflies';
import { LumiAvatar } from '@/components/lumi-avatar';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { haptic } from '@/haptics';
import { LUMI_STATES } from '@/lumi/states';
import { useTour } from '@/tour/context';
import { TOUR_ICONS, tourCopy, type TourIcon } from '@/tour/definitions';
import { clampToWindow, isVisible, sameRect, type Rect } from '@/tour/engine';

/** Aire entre el elemento y el borde del foco. */
const PAD = 8;
const HOLE_RADIUS = 24;
const DIM = 'rgba(19, 17, 46, 0.86)';
const AVATAR = 84;
const CARD_HEIGHT = 250;
/** Cuánto esperamos a que aparezca el elemento de un paso antes de saltárselo (14 × 140 ms). */
const MAX_FIND_TRIES = 14;

const spring = { damping: 20, stiffness: 170, mass: 0.9, reduceMotion: ReduceMotion.System } as const;
const loop = { easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System };

/**
 * La capa del tutorial: oscurece la pantalla salvo un foco redondeado sobre el
 * elemento señalado (el foco se desliza de un paso al siguiente), con un anillo
 * ámbar que late, una manita que toca, y a Lampi explicando en una tarjeta.
 * El agujero deja pasar los toques solo en los pasos `tap`; el resto de la
 * pantalla queda bloqueado mientras dura el tour.
 */
export function TourOverlay() {
  const { active } = useTour();
  if (!active) return null;
  return (
    <Animated.View
      key={active.id}
      entering={FadeIn.duration(260)}
      exiting={FadeOut.duration(200)}
      pointerEvents="box-none"
      style={StyleSheet.absoluteFill}>
      <TourScene />
    </Animated.View>
  );
}

function TourScene() {
  const { active, next, skip, measure } = useTour();
  const win = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [measured, setRect] = useState<Rect | null>(null);

  const step = active?.step;
  const target = step?.target ?? null;
  // Sin elemento que señalar, el foco se cierra aunque quede una medida vieja.
  const rect = target ? measured : null;
  const index = active?.index ?? 0;
  const count = active?.steps.length ?? 1;
  const isLast = index === count - 1;
  const celebrate = isLast && !target;

  // Mide el elemento señalado hasta encontrarlo y lo sigue (scroll, giro). Si no aparece, salta el paso.
  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    let found = false;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const inset = { top: insets.top + 8, bottom: insets.bottom + 8 };
    const tick = async () => {
      const m = await measure(target);
      if (cancelled) return;
      if (isVisible(m, win)) {
        found = true;
        const clamped = clampToWindow(m, win, inset);
        setRect((prev) => (sameRect(prev, clamped) ? prev : clamped));
      } else if (!found && ++tries > MAX_FIND_TRIES) {
        next();
        return;
      }
      timer = setTimeout(tick, found ? 350 : 140);
    };
    void tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [target, index, measure, next, win, insets.top, insets.bottom]);

  useEffect(() => {
    if (celebrate) haptic.success();
    else haptic.selection();
  }, [index, celebrate]);

  // El foco: un rectángulo animado. Sin elemento, se encoge hasta un punto y todo queda oscuro.
  const hx = useSharedValue(win.width / 2);
  const hy = useSharedValue(win.height * 0.4);
  const hw = useSharedValue(0);
  const hh = useSharedValue(0);
  const hr = useSharedValue(0);
  const ringOn = useSharedValue(0);
  useEffect(() => {
    if (rect) {
      hx.value = withSpring(rect.x - PAD, spring);
      hy.value = withSpring(rect.y - PAD, spring);
      hw.value = withSpring(rect.w + PAD * 2, spring);
      hh.value = withSpring(rect.h + PAD * 2, spring);
      hr.value = withSpring(HOLE_RADIUS, spring);
      ringOn.value = withTiming(1, { duration: 240, reduceMotion: ReduceMotion.System });
    } else {
      hx.value = withSpring(win.width / 2, spring);
      hy.value = withSpring(win.height * 0.4, spring);
      hw.value = withSpring(0, spring);
      hh.value = withSpring(0, spring);
      hr.value = withSpring(0, spring);
      ringOn.value = withTiming(0, { duration: 160, reduceMotion: ReduceMotion.System });
    }
  }, [rect, win.width, win.height, hx, hy, hw, hh, hr, ringOn]);

  const holeStyle = useAnimatedStyle(() => ({
    left: hx.value,
    top: hy.value,
    // Mínimo de 2 px: una vista vacía no dibuja su sombra, y sin ella no habría velo.
    width: Math.max(hw.value, 2),
    height: Math.max(hh.value, 2),
    borderRadius: hr.value,
  }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: ringOn.value }));
  const topPanel = useAnimatedStyle(() => ({ top: 0, left: 0, right: 0, height: Math.max(hy.value, 0) }));
  const bottomPanel = useAnimatedStyle(() => ({ top: Math.max(hy.value + hh.value, 0), left: 0, right: 0, bottom: 0 }));
  const leftPanel = useAnimatedStyle(() => ({
    top: Math.max(hy.value, 0),
    left: 0,
    width: Math.max(hx.value, 0),
    height: Math.max(hh.value, 0),
  }));
  const rightPanel = useAnimatedStyle(() => ({
    top: Math.max(hy.value, 0),
    left: Math.max(hx.value + hw.value, 0),
    right: 0,
    height: Math.max(hh.value, 0),
  }));
  const centerPanel = useAnimatedStyle(() => ({
    top: Math.max(hy.value, 0),
    left: Math.max(hx.value, 0),
    width: Math.max(hw.value, 0),
    height: Math.max(hh.value, 0),
  }));

  // La tarjeta va debajo del foco si cabe, y si no, encima. Sin foco, centrada.
  const cardWidth = Math.min(win.width - 32, 420);
  const avatarLift = AVATAR * 0.7;
  const tapHand = step?.action === 'tap' && !!rect;
  const below = rect ? win.height - (rect.y + rect.h) - insets.bottom : 0;
  let cardTop: number;
  if (!rect) cardTop = Math.max((win.height - CARD_HEIGHT) / 2, insets.top + avatarLift + 8);
  else if (below >= CARD_HEIGHT + avatarLift + 32 + (tapHand ? 44 : 0))
    cardTop = rect.y + rect.h + PAD + 24 + avatarLift + (tapHand ? 44 : 0);
  else cardTop = Math.max(insets.top + avatarLift + 8, rect.y - PAD - 24 - CARD_HEIGHT);

  if (!active || !step) return null;

  return (
    <>
      {/* El velo: un foco con sombra enorme. Es solo dibujo; los toques los frenan los paneles. */}
      <Animated.View pointerEvents="none" style={[styles.hole, styles.dimShadow, holeStyle]} />
      <Animated.View style={[styles.panel, topPanel]} />
      <Animated.View style={[styles.panel, bottomPanel]} />
      <Animated.View style={[styles.panel, leftPanel]} />
      <Animated.View style={[styles.panel, rightPanel]} />
      {step.action === 'next' ? <Animated.View style={[styles.panel, centerPanel]} /> : null}

      <Fireflies glow={0.9} count={9} />

      <Animated.View pointerEvents="none" style={[styles.hole, holeStyle, ringStyle]}>
        <View style={[StyleSheet.absoluteFill, styles.ring, { borderRadius: HOLE_RADIUS }]} />
        <Ripple />
      </Animated.View>

      {tapHand && rect ? <PointingHand rect={rect} /> : null}

      <Animated.View
        key={`${active.id}-${index}`}
        entering={FadeInDown.springify().damping(17).stiffness(170)}
        style={[styles.card, { width: cardWidth, left: (win.width - cardWidth) / 2, top: cardTop }]}
        accessibilityViewIsModal
        accessibilityLiveRegion="polite">
        <View style={styles.avatar} pointerEvents="none">
          <LumiAvatar state={LUMI_STATES.contenta} size={AVATAR} alive={false} />
        </View>
        <StepIcon icon={step.icon} big={celebrate} />

        <View style={styles.dots} accessible accessibilityLabel={tourCopy.stepOf(index + 1, count)}>
          {active.steps.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotOn, i < index && styles.dotDone]} />
          ))}
        </View>
        <Text style={styles.title} accessibilityRole="header">
          {step.title}
        </Text>
        <Text style={styles.body}>{step.body}</Text>

        <View style={styles.footer}>
          {isLast ? (
            <View />
          ) : (
            <Pressable
              onPress={skip}
              hitSlop={12}
              accessibilityRole="button"
              style={({ pressed }) => pressed && { opacity: 0.6 }}>
              <Text style={styles.skip}>{tourCopy.skip}</Text>
            </Pressable>
          )}
          {step.action === 'tap' ? (
            <View style={styles.hint}>
              <Text style={styles.hintText}>{tourCopy.tapHint}</Text>
            </View>
          ) : (
            <Pressable
              onPress={next}
              accessibilityRole="button"
              style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}>
              <Text style={styles.ctaText}>{isLast ? tourCopy.done : tourCopy.next}</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>

      {celebrate ? <Confetti originY={cardTop} width={win.width} /> : null}
    </>
  );
}

/** Onda que sale del foco y se desvanece, en bucle. */
function Ripple() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.out(Easing.quad), reduceMotion: ReduceMotion.System }), -1, false);
  }, [t]);
  const style = useAnimatedStyle(() => ({ opacity: 0.7 * (1 - t.value), transform: [{ scale: 1 + t.value * 0.14 }] }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.ripple, style]} />;
}

/** La manita que toca el elemento, con un saltito en bucle. */
function PointingHand({ rect }: { rect: Rect }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(1, { duration: 520, ...loop }), withTiming(0, { duration: 520, ...loop })), -1, false);
  }, [t]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -12 * t.value }, { scale: 1 - 0.08 * t.value }],
  }));
  const size = 64;
  return (
    <Animated.View
      pointerEvents="none"
      entering={ZoomIn.delay(300).springify()}
      style={[
        styles.hand,
        { left: rect.x + rect.w / 2 - size * 0.32, top: rect.y + rect.h - size * 0.18, width: size, height: size },
        style,
      ]}>
      <Image source={TOUR_ICONS.mano} style={StyleSheet.absoluteFill} contentFit="contain" />
    </Animated.View>
  );
}

/** El dibujo del paso, asomando por la esquina de la tarjeta y meciéndose. */
function StepIcon({ icon, big }: { icon: TourIcon; big: boolean }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withSequence(withTiming(1, { duration: 1300, ...loop }), withTiming(0, { duration: 1300, ...loop })), -1, false);
  }, [t]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -5 * t.value }, { rotate: `${-7 + 14 * t.value}deg` }],
  }));
  const size = big ? 92 : 68;
  return (
    <Animated.View
      pointerEvents="none"
      entering={ZoomIn.delay(120).springify().damping(9)}
      style={[styles.icon, { width: size, height: size, top: -size * 0.55 }]}>
      <Animated.View style={[StyleSheet.absoluteFill, style]}>
        <Image source={TOUR_ICONS[icon]} style={StyleSheet.absoluteFill} contentFit="contain" />
      </Animated.View>
    </Animated.View>
  );
}

const CONFETTI: TourIcon[] = ['brillos', 'estrella', 'corazon', 'brillos', 'estrella', 'corazon', 'brillos', 'estrella'];

/** Lluvia de estrellitas al terminar el tour. */
function Confetti({ originY, width }: { originY: number; width: number }) {
  const pieces = useMemo(
    () =>
      CONFETTI.map((icon, i) => {
        const rnd = (n: number) => ((Math.sin(i * 53.17 + n * 9.3) + 1) / 2) % 1;
        return {
          icon,
          x: width * (0.12 + 0.76 * (i / (CONFETTI.length - 1))) + (rnd(1) - 0.5) * 30,
          rise: 150 + rnd(2) * 130,
          drift: (rnd(3) - 0.5) * 90,
          size: 26 + rnd(4) * 18,
          delay: 200 + rnd(5) * 350,
          spin: (rnd(6) - 0.5) * 240,
        };
      }),
    [width],
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <ConfettiPiece key={i} piece={p} originY={originY} />
      ))}
    </View>
  );
}

function ConfettiPiece({
  piece,
  originY,
}: {
  piece: { icon: TourIcon; x: number; rise: number; drift: number; size: number; delay: number; spin: number };
  originY: number;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      piece.delay,
      withTiming(1, { duration: 1700, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System }),
    );
  }, [t, piece.delay]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value === 0 ? 0 : 1 - Math.pow(t.value, 2.2),
    transform: [
      { translateX: piece.drift * t.value },
      { translateY: -piece.rise * t.value },
      { rotate: `${piece.spin * t.value}deg` },
      { scale: 0.5 + 0.7 * Math.min(t.value * 2.5, 1) },
    ],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', left: piece.x - piece.size / 2, top: originY, width: piece.size, height: piece.size }, style]}>
      <Image source={TOUR_ICONS[piece.icon]} style={StyleSheet.absoluteFill} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hole: { position: 'absolute' },
  dimShadow: { boxShadow: `0 0 0 2600px ${DIM}` },
  panel: { position: 'absolute' },
  ring: {
    borderWidth: 2.5,
    borderColor: Colors.amber,
    boxShadow: `0 0 22px 2px rgba(255, 201, 107, 0.65)`,
  },
  ripple: { borderRadius: HOLE_RADIUS, borderWidth: 2, borderColor: Colors.amberPale },
  hand: { position: 'absolute' },
  card: {
    position: 'absolute',
    backgroundColor: Colors.cardSolid,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 201, 107, 0.55)',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 18,
    gap: 8,
    boxShadow: '0 18px 40px rgba(6, 4, 24, 0.55)',
  },
  avatar: { position: 'absolute', left: 10, top: -AVATAR * 0.72, width: AVATAR, height: AVATAR },
  icon: { position: 'absolute', right: 14 },
  dots: { flexDirection: 'row', gap: 5, alignItems: 'center', marginBottom: 2, minHeight: 8, paddingLeft: AVATAR - 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(201, 191, 242, 0.25)' },
  dotDone: { backgroundColor: 'rgba(255, 201, 107, 0.55)' },
  dotOn: { width: 20, backgroundColor: Colors.amber },
  title: { fontFamily: Fonts.displayBold, fontSize: 23, lineHeight: 28, color: Colors.text },
  body: { fontFamily: Fonts.bodyMedium, fontSize: 15.5, lineHeight: 22, color: Colors.lavenderPale },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, minHeight: 42 },
  skip: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.textTertiary },
  cta: {
    backgroundColor: Colors.amber,
    borderRadius: Radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 11,
  },
  ctaText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.onAmber },
  hint: {
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 201, 107, 0.6)',
    backgroundColor: 'rgba(255, 201, 107, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  hintText: { fontFamily: Fonts.bodySemiBold, fontSize: 13.5, color: Colors.amberPale },
});
