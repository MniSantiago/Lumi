import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useAppReady } from '@/splash/state';
import { SPLASH, shouldExit, splashPosterSize } from '@/splash/timing';

const VIDEO = require('@/assets/video/splash.mp4');
/** Recorte central del primer fotograma del vídeo: es la misma imagen que enseña la splash nativa. */
const POSTER = require('@/assets/images/splash-lampi.png');

/** Una vez por arranque de la app: cubre también los remontajes del layout raíz (volver de segundo plano no lo remonta). */
let played = false;

/**
 * Splash animada con vídeo (Seedance vía APIMart, `assets/apimart/splash`). La nativa
 * (expo-splash-screen) enseña el primer fotograma del vídeo sobre su mismo fondo; en
 * cuanto esta capa tiene pintado ese fotograma, la nativa se quita y el vídeo arranca
 * exactamente donde estaba: Lampi se despierta, salta contento y se llena de luciérnagas.
 * Se despide con un fundido en cuanto la app está lista y pasó el mínimo (el vídeo dura
 * más que eso: la splash no espera a que acabe). Sin sonido y sin cortar la música de
 * nadie. Con "reducir movimiento" no hay vídeo: Lampi quieta y un fundido corto.
 */
export function AnimatedSplash() {
  const reduced = useReducedMotion();
  const appReady = useAppReady();
  const { width, height } = useWindowDimensions();
  const [done, setDone] = useState(played);
  const [started, setStarted] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const exiting = useRef(false);
  const nativeHidden = useRef(false);

  const opacity = useSharedValue(1);
  const videoShown = useSharedValue(0);

  const player = useVideoPlayer(reduced || played ? null : VIDEO, (p) => {
    p.loop = false;
    p.muted = true;
    p.audioMixingMode = 'mixWithOthers';
    p.play();
  });

  // La nativa se quita cuando nuestro fotograma está pintado (o, si fallara, pasado un tiempo).
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

  // Reloj del mínimo: cuenta desde que la nativa se quita.
  useEffect(() => {
    if (!started || done || reduced) return;
    const timer = setTimeout(() => setMinElapsed(true), SPLASH.minShow);
    return () => clearTimeout(timer);
  }, [started, done, reduced]);

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
  const videoFade = useAnimatedStyle(() => ({ opacity: videoShown.get() }));

  if (done) return null;

  const poster = splashPosterSize(width, height);

  return (
    <Animated.View
      style={[styles.root, root]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <View style={styles.center}>
        <Image
          source={POSTER}
          contentFit="contain"
          style={{ width: poster, height: poster }}
          onDisplay={hideNative}
          onError={hideNative}
        />
      </View>
      {reduced ? null : (
        <Animated.View style={[StyleSheet.absoluteFill, videoFade]}>
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
            allowsPictureInPicture={false}
            onFirstFrameRender={() => {
              videoShown.set(withTiming(1, { duration: 120 }));
            }}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: SPLASH.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
