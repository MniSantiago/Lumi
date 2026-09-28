import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { LumiAvatar } from '@/components/lumi-avatar';
import { Colors } from '@/constants/theme';
import { LUMI_STATES } from '@/lumi/states';

/**
 * Lumi dormida (`lumiShield` del mockup: apagadita con sus "z"), con un halo
 * extra que `warmth` (0-1) enciende cuando el usuario elige dejarlo.
 */
export function SleepingLumi({ size = 190, warmth }: { size?: number; warmth: SharedValue<number> }) {
  const height = size * 1.12;
  const halo = size * 1.45;
  const haloStyle = useAnimatedStyle(() => ({
    opacity: warmth.value,
    transform: [{ scale: 0.85 + 0.2 * warmth.value }],
  }));

  return (
    <View style={{ width: size, height }}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            width: halo,
            height: halo,
            // Centrado sobre el cuerpo, que ocupa los `size` px de abajo.
            top: height - size / 2 - halo / 2,
            left: (size - halo) / 2,
          },
          haloStyle,
        ]}
      />
      <LumiAvatar state={LUMI_STATES.apagadita} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    position: 'absolute',
    borderRadius: 999,
    experimental_backgroundImage: `radial-gradient(circle, ${Colors.amber}77 0%, ${Colors.amber}26 42%, transparent 70%)`,
  },
});
