import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptic } from '@/haptics';
import { Fireflies } from '@/components/fireflies';
import { AppTag, ShieldButton } from '@/components/shield/shield-parts';
import { SleepingLumi } from '@/components/shield/sleeping-lumi';
import { Colors, Fonts } from '@/constants/theme';
import { thiefAppById, type ThiefApp } from '@/lumi/data';
import { LUMI_STATES } from '@/lumi/states';
import { useLumi } from '@/lumi/store';
import { shieldCopy } from '@/shield/copy';
import { getSnoozesToday, grantSnooze, peekSnoozesToday } from '@/shield/snoozes';

const ease = { easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System };
/** Cuánto dura el momento de despedida antes de cerrar. */
const GOODBYE_MS = 1300;

type Phase = 'ask' | 'leaving' | 'snoozing';

/**
 * Maqueta navegable del escudo (`ShieldConfiguration` en iOS real): sale al
 * abrir una app ladrona pasado el límite. Param opcional `app` = id del catálogo.
 */
export default function ShieldScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useLumi();
  const params = useLocalSearchParams<{ app?: string }>();
  const app = resolveApp(params.app, settings.thiefApps);

  const [phase, setPhase] = useState<Phase>('ask');
  const [message, setMessage] = useState('');
  const [snoozesUsed, setSnoozesUsed] = useState(peekSnoozesToday);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reveal = useSharedValue(0); // 0 = pregunta, 1 = mensaje de Lumi
  const warmth = useSharedValue(0); // halo extra de Lumi

  useEffect(() => {
    getSnoozesToday().then(setSnoozesUsed);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const finish = (text: string, glow: number) => {
    setMessage(text);
    AccessibilityInfo.announceForAccessibility(text);
    reveal.value = withTiming(1, { duration: 380, ...ease });
    warmth.value = withSequence(
      withTiming(glow, { duration: 700, ...ease }),
      withTiming(glow * 0.8, { duration: 600, ...ease }),
    );
    timer.current = setTimeout(close, GOODBYE_MS);
  };

  const onLeave = () => {
    if (busy.current) return;
    busy.current = true;
    setPhase('leaving');
    haptic.success();
    finish(shieldCopy.leaveThanks, 1);
  };

  const onSnooze = async () => {
    if (busy.current) return;
    busy.current = true;
    setPhase('snoozing');
    haptic.light();
    const count = await grantSnooze();
    finish(shieldCopy.snoozeGranted(count), 0.45);
  };

  const questionStyle = useAnimatedStyle(() => ({
    opacity: 1 - reveal.value,
    transform: [{ translateY: -6 * reveal.value }],
  }));
  const messageStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ translateY: 8 * (1 - reveal.value) }],
  }));

  const strict = settings.isPlus && settings.strictShield;
  const note = strict ? shieldCopy.strictNote : shieldCopy.snoozeNote(snoozesUsed);

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.background} />
      <Fireflies glow={LUMI_STATES.apagadita.glow} count={8} />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}>
        <AppTag app={app} label={shieldCopy.appTag(app.name)} />

        <SleepingLumi warmth={warmth} />

        <View style={styles.copyArea}>
          <Animated.View style={[styles.question, questionStyle]}>
            <Text style={styles.title}>{shieldCopy.title(settings.lumiName)}</Text>
            <Text style={styles.body}>{shieldCopy.body}</Text>
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.messageWrap, messageStyle]}
            accessibilityElementsHidden={phase === 'ask'}>
            <Text style={styles.message}>{message}</Text>
          </Animated.View>
        </View>

        <Animated.View
          style={[styles.actions, questionStyle]}
          pointerEvents={phase === 'ask' ? 'auto' : 'none'}>
          <ShieldButton label={shieldCopy.leave} onPress={onLeave} disabled={phase !== 'ask'} />
          {strict ? null : (
            <ShieldButton
              ghost
              label={shieldCopy.snooze(snoozesUsed)}
              onPress={onSnooze}
              disabled={phase !== 'ask'}
            />
          )}
          {note ? <Text style={styles.note}>{note}</Text> : null}
        </Animated.View>
      </View>
    </View>
  );
}

function resolveApp(param: string | undefined, thiefApps: string[]): ThiefApp {
  return (
    (param ? thiefAppById(param) : undefined) ??
    (thiefApps[0] ? thiefAppById(thiefApps[0]) : undefined) ??
    thiefAppById('instagram')!
  );
}

/** En la maqueta volvemos a la app; en iOS real el escudo cierra la app ladrona. */
function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.nightDeep },
  // `.shield`: resplandor lavanda detrás de Lumi sobre la noche más profunda.
  background: {
    position: 'absolute',
    inset: 0,
    experimental_backgroundImage: `radial-gradient(ellipse 360px 360px at 50% 36%, rgba(140, 123, 216, 0.35) 0%, transparent 70%), linear-gradient(180deg, #100E28, ${Colors.night})`,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 14,
  },
  copyArea: { alignSelf: 'stretch', alignItems: 'center', marginTop: 8 },
  question: { alignItems: 'center', gap: 14 },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 27,
    lineHeight: 31,
    color: Colors.text,
    textAlign: 'center',
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 290,
  },
  messageWrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  message: {
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 29,
    color: Colors.amberPale,
    textAlign: 'center',
  },
  actions: { alignSelf: 'stretch', gap: 10, marginTop: 18 },
  note: {
    fontFamily: Fonts.body,
    fontSize: 12.5,
    lineHeight: 17,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 2,
  },
});
