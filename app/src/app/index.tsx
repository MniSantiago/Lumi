import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fireflies } from '@/components/fireflies';
import { LightMeter } from '@/components/light-meter';
import { LumiAvatar } from '@/components/lumi-avatar';
import { AppText, Card, Pill } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { CURRENT_EXPEDITION } from '@/lumi/data';
import { THRESHOLDS, type Threshold } from '@/lumi/states';
import { useLumi } from '@/lumi/store';
import { screenTime } from '@/screen-time';

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h >= 6 && h < 13) return 'Buenos días';
  if (h >= 13 && h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { state, threshold, settings } = useLumi();

  return (
    <View style={styles.root}>
      <Image source={require('@/assets/images/fondo-hogar.jpg')} style={StyleSheet.absoluteFill} contentFit="cover" />
      <Fireflies glow={state.glow} />
      {/* El mundo se oscurece al gastarse la luz de Lumi. */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: Colors.nightDeep, opacity: state.dim }]} />
      <LinearGradient
        pointerEvents="none"
        colors={[`${Colors.nightDeep}E6`, `${Colors.nightDeep}00`]}
        style={[styles.topShade, { height: insets.top + 220 }]}
      />

      <View style={[styles.content, { paddingTop: insets.top + Spacing.two, paddingBottom: insets.bottom + Spacing.three }]}>
        <View style={styles.header}>
          <View>
            <AppText variant="caption">
              {greeting()}, {settings.userName}
            </AppText>
            <AppText variant="display">{settings.lumiName}</AppText>
          </View>
          <View style={styles.sparks} accessibilityLabel={`${state.sparks} chispas hoy`}>
            <Text style={styles.sparksText}>✦ +{state.sparks}</Text>
          </View>
        </View>

        <Card style={styles.meterCard}>
          <LightMeter lit={state.lit} note={state.meterNote} />
          {__DEV__ ? <ThresholdSimulator value={threshold} /> : null}
        </Card>

        <View style={styles.stage}>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{state.bubble}</Text>
            <View style={styles.bubbleTail} />
          </View>
          <LumiAvatar state={state} size={190} />
          <Pill tone={state.exploring ? 'amber' : 'lavender'} style={styles.statePill}>{state.label}</Pill>
        </View>

        <ExpeditionCard exploring={state.exploring} asleep={state.key === 'apagadita'} />
      </View>
    </View>
  );
}

function ExpeditionCard({ exploring, asleep }: { exploring: boolean; asleep: boolean }) {
  const title = exploring
    ? `Explorando el ${CURRENT_EXPEDITION.zone}`
    : asleep
      ? 'Lumi duerme la siesta'
      : 'Lumi está descansando en la madriguera';
  const sub = exploring
    ? `Vuelve a las ${CURRENT_EXPEDITION.returnsAt} con una postal`
    : asleep
      ? 'Mañana se despierta con la luz al máximo'
      : 'Mañana sale de viaje con la luz llena';
  return (
    <Card style={{ gap: 6 }}>
      <AppText variant="label">{exploring ? 'Expedición en curso' : 'Hoy se queda en casa'}</AppText>
      <AppText variant="heading">{title}</AppText>
      <AppText variant="caption">{sub}</AppText>
      {exploring ? (
        <View style={styles.track}>
          <View style={[styles.trackFill, { width: `${CURRENT_EXPEDITION.progress * 100}%` }]} />
        </View>
      ) : null}
    </Card>
  );
}

/** Solo en desarrollo: simula los avisos de umbral de Screen Time. */
function ThresholdSimulator({ value }: { value: Threshold }) {
  return (
    <View style={styles.sim}>
      <AppText variant="caption">Simular uso</AppText>
      <View style={styles.simRow}>
        {THRESHOLDS.map((t) => (
          <Pressable
            key={t}
            onPress={() => screenTime.simulate?.(t)}
            accessibilityRole="button"
            accessibilityState={{ selected: t === value }}
            style={[styles.simBtn, t === value && styles.simBtnOn]}>
            <Text style={[styles.simText, t === value && { color: Colors.onAmber }]}>{t} %</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.night },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0 },
  content: { flex: 1, paddingHorizontal: Spacing.three + 4, gap: Spacing.three },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sparks: {
    backgroundColor: 'rgba(255, 201, 107, 0.16)',
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 6,
  },
  sparksText: { fontFamily: Fonts.bodyBold, color: Colors.amberPale, fontSize: 15, fontVariant: ['tabular-nums'] },
  meterCard: { gap: Spacing.three },
  statePill: { alignSelf: 'center', backgroundColor: 'rgba(19, 17, 46, 0.78)' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: Spacing.two },
  bubble: {
    backgroundColor: Colors.lavenderPale,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: 300,
    marginBottom: -4,
  },
  bubbleText: { fontFamily: Fonts.bodyMedium, fontSize: 15, lineHeight: 21, color: Colors.night, textAlign: 'center' },
  bubbleTail: {
    position: 'absolute',
    bottom: -7,
    alignSelf: 'center',
    width: 14,
    height: 14,
    backgroundColor: Colors.lavenderPale,
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
  },
  track: { height: 6, borderRadius: Radius.pill, backgroundColor: 'rgba(201, 191, 242, 0.14)', marginTop: 6, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: Radius.pill, backgroundColor: Colors.amber },
  sim: { gap: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.hairline, paddingTop: 12 },
  simRow: { flexDirection: 'row', gap: 6 },
  simBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(201, 191, 242, 0.12)',
  },
  simBtnOn: { backgroundColor: Colors.amber },
  simText: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.lavender, fontVariant: ['tabular-nums'] },
});
