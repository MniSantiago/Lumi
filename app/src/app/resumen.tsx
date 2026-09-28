import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  PixelRatio,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef, releaseCapture } from 'react-native-view-shot';

import { Fireflies } from '@/components/fireflies';
import { ShieldButton } from '@/components/shield/shield-parts';
import { CARD_ASPECT, SummaryCard, type CardTheme } from '@/components/summary/summary-card';
import { buildWeekSummary } from '@/components/summary/week-summary';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { useGame } from '@/game/store';
import { useLumi } from '@/lumi/store';

/** Tamaño de la imagen que se comparte, en píxeles (story 9:16). */
const OUTPUT = { width: 1080, height: 1920 };
/**
 * La tarjeta se pinta a su tamaño de salida en puntos (1080 px / escala de la
 * pantalla: 360 pt en 3x) y la vista previa solo la encoge con una transformación
 * en un contenedor padre. Así la captura sale nítida, sin reescalar.
 */
const CARD_W = OUTPUT.width / PixelRatio.get();
const CARD_H = CARD_W * CARD_ASPECT;
/** En iOS view-shot mide en puntos (y multiplica por la escala); en Android, en píxeles. */
const CAPTURE_SIZE = Platform.OS === 'ios' ? { width: CARD_W, height: CARD_H } : OUTPUT;
/** Alto reservado para el selector de estilo y los dos botones. */
const CONTROLS_H = 172;

const THEMES: { key: CardTheme; label: string }[] = [
  { key: 'noche', label: 'Noche' },
  { key: 'amanecer', label: 'Amanecer' },
];

const copy = {
  share: 'Compartir en stories',
  preparing: 'Preparando la imagen…',
  close: 'Cerrar',
  failed: 'No se ha podido crear la imagen. Prueba otra vez.',
  unavailable: 'Este dispositivo no permite compartir imágenes desde aquí.',
};

/** Resumen semanal: la tarjeta vertical para stories y TikTok, y el botón para compartirla como imagen. */
export default function WeeklySummaryScreen() {
  const game = useGame();
  const { settings } = useLumi();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const cardRef = useRef<View>(null);
  const [theme, setTheme] = useState<CardTheme>('noche');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const summary = useMemo(() => buildWeekSummary(game, settings.lumiName), [game, settings.lumiName]);

  const top = insets.top + 16;
  const bottom = Math.max(insets.bottom, 16) + 8;
  const availH = window.height - top - bottom - CONTROLS_H;
  const availW = window.width - 48;
  const previewH = Math.max(200, Math.min(availH, availW * CARD_ASPECT));
  const k = previewH / CARD_H;

  // Un solo momento de entrada: la tarjeta aparece y se asienta.
  const enter = useSharedValue(0);
  useEffect(() => {
    enter.value = withTiming(1, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
  }, [enter]);
  const previewStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [{ translateY: 18 * (1 - enter.value) }, { scale: 0.96 + 0.04 * enter.value }],
  }));

  const onShare = async () => {
    if (busy) return;
    setBusy(true);
    setNote(null);
    let uri: string | null = null;
    try {
      if (!(await Sharing.isAvailableAsync())) {
        setNote(copy.unavailable);
        return;
      }
      uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        ...CAPTURE_SIZE,
      });
      const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;
      // Si se cierra la hoja sin compartir, resuelve igual: no hay nada que avisar.
      await Sharing.shareAsync(fileUri, {
        mimeType: 'image/png',
        UTI: 'public.png',
        dialogTitle: copy.share,
      });
    } catch {
      setNote(copy.failed);
      AccessibilityInfo.announceForAccessibility(copy.failed);
    } finally {
      if (uri) releaseCapture(uri);
      setBusy(false);
    }
  };

  const a11ySummary =
    summary.shone > 0
      ? `Mi semana con ${summary.lumiName}, ${summary.range}: ${summary.shone} de 7 días brillando. ${summary.line}`
      : `Mi semana con ${summary.lumiName}, ${summary.range}. ${summary.line}`;

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.background} />
      <Fireflies glow={0.6} count={8} />

      <View style={[styles.stage, { paddingTop: top }]}>
        <Animated.View
          style={[styles.preview, { width: CARD_W * k, height: previewH }, previewStyle]}
          accessible
          accessibilityRole="image"
          accessibilityLabel={a11ySummary}>
          {/* El contenedor escala; la tarjeta de dentro (lo que se captura) queda a tamaño real. */}
          <View style={[styles.scaler, { width: CARD_W, height: CARD_H, transform: [{ scale: k }] }]}>
            <SummaryCard ref={cardRef} summary={summary} width={CARD_W} theme={theme} />
          </View>
        </Animated.View>
      </View>

      <View style={[styles.controls, { paddingBottom: bottom, height: CONTROLS_H + bottom }]}>
        <View style={styles.segment} accessibilityRole="radiogroup">
          {THEMES.map((t) => {
            const on = t.key === theme;
            return (
              <Pressable
                key={t.key}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => setTheme(t.key)}
                style={[styles.segmentItem, on && styles.segmentOn]}>
                <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.actions}>
          <ShieldButton label={busy ? copy.preparing : copy.share} onPress={onShare} disabled={busy} />
          <ShieldButton ghost label={copy.close} onPress={close} />
        </View>
        {note ? (
          <Text style={styles.note} accessibilityLiveRegion="polite">
            {note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.nightDeep },
  background: {
    position: 'absolute',
    inset: 0,
    experimental_backgroundImage: `radial-gradient(ellipse 380px 420px at 50% 40%, rgba(140, 123, 216, 0.28) 0%, transparent 70%), linear-gradient(180deg, #0E0C26, ${Colors.nightDeep})`,
  },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  preview: {
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
    boxShadow: '0 24px 60px -18px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(201, 191, 242, 0.14)',
  },
  scaler: {
    position: 'absolute',
    top: 0,
    left: 0,
    transformOrigin: 'top left',
  },
  controls: { paddingHorizontal: 28, gap: 12, justifyContent: 'flex-end' },
  segment: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 3,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(244, 240, 255, 0.08)',
  },
  segmentItem: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
  },
  segmentOn: { backgroundColor: Colors.indigoLight },
  segmentText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textTertiary,
  },
  segmentTextOn: { color: Colors.text },
  actions: { gap: 10 },
  note: {
    position: 'absolute',
    left: 28,
    right: 28,
    top: 0,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.peach,
    textAlign: 'center',
  },
});
