import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

/** Un tramo de la secuencia, en ms desde que se abre la postal. */
export type Stage = { start: number; duration: number };

export type Timeline = {
  header: Stage;
  card: Stage;
  story: Stage;
  rewards: Stage[];
  sparks: Stage;
  actions: Stage;
  end: number;
};

/** Reparto de la vuelta de Lampi: cabecera, postal, historia, objetos uno a uno, chispas y botones. */
export function buildTimeline(rewardCount: number): Timeline {
  const header = { start: 150, duration: 500 };
  const card = { start: 550, duration: 950 };
  const story = { start: 1500, duration: 700 };
  const rewards = Array.from({ length: rewardCount }, (_, i) => ({ start: 2250 + i * 340, duration: 480 }));
  const sparks = { start: 2250 + rewardCount * 340 + 200, duration: 800 };
  const actions = { start: sparks.start + 450, duration: 450 };
  return { header, card, story, rewards, sparks, actions, end: actions.start + actions.duration };
}

/** Progreso 0-1 de un tramo dado el reloj `t`. */
export function stageProgress(t: number, stage: Stage) {
  'worklet';
  return Math.min(1, Math.max(0, (t - stage.start) / stage.duration));
}

/**
 * Reloj único de la secuencia. Con "Reducir movimiento" (o VoiceOver) se ve el
 * final directamente; `skip` lo adelanta todo de golpe al tocar la pantalla.
 * `animate = false` deja todo ya en su sitio (relectura de una postal).
 */
export function useReveal(end: number, animate: boolean) {
  const t = useSharedValue(animate ? 0 : end);
  const [done, setDone] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    let cancelled = false;
    AccessibilityInfo.isScreenReaderEnabled().then((reader) => {
      if (cancelled) return;
      if (reader) t.set(end);
      else t.set(withTiming(end, { duration: end, easing: Easing.linear, reduceMotion: ReduceMotion.System }));
    });
    return () => {
      cancelled = true;
      cancelAnimation(t);
    };
  }, [animate, end, t]);

  useAnimatedReaction(
    () => t.get() >= end,
    (finished, previous) => {
      if (finished && !previous) scheduleOnRN(setDone, true);
    },
  );

  const skip = () => {
    if (done) return;
    cancelAnimation(t);
    t.set(withTiming(end, { duration: 380, easing: Easing.out(Easing.quad), reduceMotion: ReduceMotion.System }));
  };

  return { t: t as SharedValue<number>, done, skip };
}
