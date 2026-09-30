import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Fonts } from '@/constants/theme';
import { haptic } from '@/haptics';
import { tr } from '@/i18n';

const VIDEO = require('@/assets/video/lumi-vuelve.mp4');
/** Momento (ms) en que Lampi toca el suelo en el vídeo: vibración suave y el cartel. */
const LANDING_MS = 3900;
const FADE_OUT_MS = 450;
/** Por si el vídeo no llega a cargar o a terminar: la postal no se queda esperando. */
const SAFETY_MS = 9000;

/**
 * Lampi vuelve a casa: baja del cielo como una estrella fugaz, las luciérnagas le hacen
 * un corro y aterriza en el prado sonriendo (Seedance 2.5, `tools/apimart_video.py`).
 * Se ve una vez antes de la postal; tocar lo salta. Con movimiento reducido o lector de
 * pantalla se pasa directamente a la postal.
 */
export function LumiArrival({ name, onDone }: { name: string; onDone: () => void }) {
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const finished = useRef(false);
  const screen = useSharedValue(1);
  const video = useSharedValue(0);
  const caption = useSharedValue(0);

  const player = useVideoPlayer(reduced ? null : VIDEO, (p) => {
    p.loop = false;
    p.muted = true;
    p.audioMixingMode = 'mixWithOthers';
  });

  const finish = (fast = false) => {
    if (finished.current) return;
    finished.current = true;
    const ms = fast ? 250 : FADE_OUT_MS;
    screen.set(withTiming(0, { duration: ms, easing: Easing.in(Easing.quad) }));
    setTimeout(onDone, ms);
  };

  useEffect(() => {
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (reduced) {
      onDone();
      return;
    }
    AccessibilityInfo.isScreenReaderEnabled().then((reader) => {
      if (!alive) return;
      if (reader) return finish(true);
      player.play();
      timers.push(
        setTimeout(() => {
          if (finished.current) return;
          haptic.light();
          caption.set(withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }));
        }, LANDING_MS),
        setTimeout(() => finish(), SAFETY_MS),
      );
    });
    const end = player.addListener('playToEnd', () => finish());
    const status = player.addListener('statusChange', ({ status: s }) => {
      if (s === 'error') finish(true);
    });
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      end.remove();
      status.remove();
    };
    // Solo al montar: la llegada se ve una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const screenStyle = useAnimatedStyle(() => ({ opacity: screen.get() }));
  const videoStyle = useAnimatedStyle(() => ({ opacity: video.get() }));
  const captionStyle = useAnimatedStyle(() => ({
    opacity: caption.get(),
    transform: [{ translateY: 10 * (1 - caption.get()) }, { scale: 0.96 + 0.04 * caption.get() }],
  }));

  if (reduced) return null;
  return (
    <Animated.View style={[styles.screen, screenStyle]}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => finish(true)}
        accessibilityRole="button"
        accessibilityLabel={tr({
          es: `${name} vuelve a casa. Toca para ver la postal`,
          en: `${name} is coming home. Tap to see the postcard`,
          zh: `${name}回家了。轻点查看明信片`,
          hi: `${name} घर लौट रही है। पोस्टकार्ड देखने के लिए टैप करो`,
          fr: `${name} rentre à la maison. Touche pour voir la carte`,
        })}>
        <Animated.View style={[StyleSheet.absoluteFill, videoStyle]}>
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
            allowsPictureInPicture={false}
            onFirstFrameRender={() => {
              video.set(withTiming(1, { duration: 350 }));
            }}
          />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[styles.captionWrap, { top: insets.top + 64 }, captionStyle]}>
          <Text style={styles.caption}>
            {tr({
              es: `¡${name} ha vuelto!`,
              en: `${name} is back!`,
              zh: `${name}回来啦！`,
              hi: `${name} लौट आई!`,
              fr: `${name} est de retour !`,
            })}
          </Text>
        </Animated.View>
        <Animated.Text pointerEvents="none" style={[styles.skip, { bottom: insets.bottom + 28 }, captionStyle]}>
          {tr({
            es: 'Toca para seguir',
            en: 'Tap to continue',
            zh: '轻点继续',
            hi: 'आगे बढ़ने के लिए टैप करो',
            fr: 'Touche pour continuer',
          })}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: Colors.nightDeep },
  captionWrap: { position: 'absolute', left: 24, right: 24, alignItems: 'center' },
  caption: {
    fontFamily: Fonts.displayBold,
    fontSize: 32,
    lineHeight: 38,
    color: Colors.amberPale,
    textAlign: 'center',
    textShadowColor: `${Colors.amber}AA`,
    textShadowRadius: 18,
  },
  skip: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: 14,
    color: Colors.lavenderPale,
    opacity: 0.8,
  },
});
