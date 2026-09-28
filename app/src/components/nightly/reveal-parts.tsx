import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { CollectionIcon } from '@/components/collection-icon';
import { stageProgress, type Stage } from '@/components/nightly/reveal';
import { Colors, Fonts, Radius } from '@/constants/theme';

const easeOut = Easing.out(Easing.cubic);
const pop = Easing.out(Easing.back(2.2));

/** Aparece subiendo un poco cuando le toca en la secuencia. */
export function FadeUp({
  t,
  stage,
  children,
  style,
  lift = 10,
}: {
  t: SharedValue<number>;
  stage: Stage;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  lift?: number;
}) {
  const animated = useAnimatedStyle(() => {
    const p = easeOut(stageProgress(t.value, stage));
    return { opacity: p, transform: [{ translateY: lift * (1 - p) }] };
  });
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

/** La postal llega volteándose desde abajo y se queda un poco torcida, como apoyada. */
export function CardIn({ t, stage, tilt, children }: { t: SharedValue<number>; stage: Stage; tilt: number; children: ReactNode }) {
  const animated = useAnimatedStyle(() => {
    const p = easeOut(stageProgress(t.value, stage));
    return {
      opacity: Math.min(1, p * 2.2),
      transform: [
        { perspective: 900 },
        { translateY: 90 * (1 - p) },
        { rotateY: `${-70 * (1 - p)}deg` },
        { rotate: `${tilt - 10 * (1 - p)}deg` },
        { scale: 0.9 + 0.1 * p },
      ],
    };
  });
  return <Animated.View style={animated}>{children}</Animated.View>;
}

/** Un objeto o amigo que Lumi saca del bolsillo: salta con un pequeño rebote. */
export function RewardTile({
  t,
  stage,
  icon,
  name,
  badge,
}: {
  t: SharedValue<number>;
  stage: Stage;
  icon: string;
  name: string;
  badge?: string;
}) {
  const animated = useAnimatedStyle(() => {
    const p = stageProgress(t.value, stage);
    return {
      opacity: Math.min(1, p * 3),
      transform: [{ translateY: 14 * (1 - easeOut(p)) }, { scale: 0.4 + 0.6 * pop(p) }],
    };
  });
  return (
    <Animated.View style={[styles.tile, animated]}>
      <View style={[styles.iconBox, badge ? styles.iconBoxFriend : null]}>
        <CollectionIcon name={icon} size={44} />
      </View>
      <Text style={styles.tileName} numberOfLines={2}>
        {name}
      </Text>
      {badge ? <Text style={styles.badge}>{badge}</Text> : null}
    </Animated.View>
  );
}

/** Contador de chispas que sube en ámbar. */
export function SparksCounter({ t, stage, total, unit }: { t: SharedValue<number>; stage: Stage; total: number; unit: string }) {
  const [shown, setShown] = useState(0);

  useAnimatedReaction(
    () => Math.round(total * easeOut(stageProgress(t.value, stage))),
    (n, previous) => {
      if (n !== previous) scheduleOnRN(setShown, n);
    },
  );

  const animated = useAnimatedStyle(() => {
    const p = stageProgress(t.value, stage);
    return { opacity: Math.min(1, p * 4), transform: [{ scale: 0.85 + 0.15 * pop(Math.min(1, p * 1.6)) }] };
  });

  return (
    <Animated.View
      style={[styles.sparks, animated]}
      accessible
      accessibilityLabel={`Más ${total} ${unit}`}>
      <Text style={styles.sparkGlyph}>✦</Text>
      <Text style={styles.sparksValue}>+{shown}</Text>
      <Text style={styles.sparksUnit}>{unit}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: { width: 84, alignItems: 'center', gap: 6 },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
    experimental_backgroundImage: 'radial-gradient(circle at 50% 55%, rgba(255, 201, 107, 0.22) 0%, transparent 65%)',
  },
  iconBoxFriend: {
    borderColor: 'rgba(143, 209, 166, 0.55)',
    experimental_backgroundImage: 'radial-gradient(circle at 50% 55%, rgba(143, 209, 166, 0.3) 0%, transparent 65%)',
  },
  tileName: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 12.5,
    lineHeight: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  badge: { fontFamily: Fonts.bodySemiBold, fontSize: 11, lineHeight: 14, color: Colors.moss, marginTop: -3 },
  sparks: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 201, 107, 0.12)',
    boxShadow: '0 0 28px -6px rgba(255, 201, 107, 0.55)',
  },
  sparkGlyph: { fontFamily: Fonts.bodyBold, fontSize: 18, lineHeight: 26, color: Colors.amber },
  sparksValue: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    lineHeight: 30,
    color: Colors.amber,
    fontVariant: ['tabular-nums'],
    minWidth: 44,
  },
  sparksUnit: { fontFamily: Fonts.bodySemiBold, fontSize: 15, lineHeight: 20, color: Colors.amberPale },
});
