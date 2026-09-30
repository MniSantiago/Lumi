import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

const VIDEO = require('@/assets/video/fondo-hogar.mp4');
/** Primer fotograma del bucle: se ve mientras carga el vídeo, así no hay salto. */
const POSTER = require('@/assets/images/fondo-hogar-video.jpg');

/**
 * El prado de la home, vivo: un bucle sin corte (Seedance 2.5, `tools/apimart_video.py`)
 * con luciérnagas, estrellas, bruma y la ventana de la madriguera. Sin sonido y sin
 * cortar la música de nadie. Solo se reproduce con la pantalla a la vista; con
 * movimiento reducido se queda la ilustración quieta.
 */
export function LivingBackground() {
  const reduced = useReducedMotion();
  const shown = useSharedValue(0);
  const player = useVideoPlayer(reduced ? null : VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.audioMixingMode = 'mixWithOthers';
  });

  useFocusEffect(
    useCallback(() => {
      if (reduced) return;
      player.play();
      return () => player.pause();
    }, [player, reduced]),
  );

  const fade = useAnimatedStyle(() => ({ opacity: shown.get() }));

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Image source={POSTER} style={StyleSheet.absoluteFill} contentFit="cover" />
      {reduced ? null : (
        <Animated.View style={[StyleSheet.absoluteFill, fade]}>
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
            allowsPictureInPicture={false}
            onFirstFrameRender={() => {
              shown.set(withTiming(1, { duration: 600 }));
            }}
          />
        </Animated.View>
      )}
    </View>
  );
}
