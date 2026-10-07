import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { CollectionIcon } from '@/components/collection-icon';
import { friendById } from '@/game/catalog';
import type { Outfit, Slot } from '@/game/types';
import { SLOTS, wardrobeEntry } from '@/game/wardrobe';
import anchors from '@/lumi/outfit-anchors.json';
import { type Art, placeItem } from '@/lumi/outfit-layout';
import type { LumiStateKey } from '@/lumi/states';

/** Los objetos que lleva Lampi puestos. Va dentro del contenedor animado del cuerpo. */
export function OutfitLayer({
  outfit,
  art,
  size,
  stateKey,
}: {
  outfit: Outfit;
  art: Art;
  size: number;
  stateKey: LumiStateKey;
}) {
  const points = anchors[stateKey] as Record<Slot, [number, number]>;
  return (
    <>
      {SLOTS.map((slot) => {
        const id = outfit[slot];
        const entry = id ? wardrobeEntry(id) : undefined;
        if (!id || !entry) return null;
        const p = placeItem(points[slot], art, size, slot, id);
        return (
          <View
            key={slot}
            pointerEvents="none"
            style={{ position: 'absolute', left: p.left, top: p.top, transform: [{ rotate: `${p.rotate}deg` }] }}>
            <CollectionIcon name={entry.icon} size={p.size} />
          </View>
        );
      })}
    </>
  );
}

/** El amigo que acompaña a Lampi, abajo a la derecha, con un balanceo suave. */
export function Companion({ friendId, size }: { friendId: string; size: number }) {
  const reduced = useReducedMotion();
  const bob = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    bob.value = withRepeat(
      withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System }),
      -1,
      true,
    );
  }, [reduced, bob]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -4 * bob.value }] }));
  const friend = friendById(friendId);
  if (!friend) return null;
  const side = size * 0.34;
  return (
    <Animated.View pointerEvents="none" style={[styles.companion, { right: -side * 0.35, bottom: 0 }, style]}>
      <CollectionIcon name={friend.icon} size={side} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({ companion: { position: 'absolute' } });
