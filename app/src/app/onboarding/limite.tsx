import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Label, List, Row, Stepper } from '@/components/onboarding/controls';
import { useLumiName, useOnboardingDraft } from '@/components/onboarding/draft';
import { StepShell } from '@/components/onboarding/step-shell';
import { AppText, Card } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { LUMI_STATES, type LumiState } from '@/lumi/states';
import { formatLimit, LIMIT_OPTIONS } from '@/lumi/store';
import { stepTime } from '@/lumi/time';

/** Umbral en el que aparece cada estado (ver `stateForThreshold`). */
const STAGES: { state: LumiState; pct: number }[] = [
  { state: LUMI_STATES.radiante, pct: 0 },
  { state: LUMI_STATES.contenta, pct: 25 },
  { state: LUMI_STATES.cansada, pct: 50 },
  { state: LUMI_STATES.apagadita, pct: 75 },
];

/** Paso 3: límite diario suave y horario de noche. */
export default function LimitStep() {
  const { draft, setDraft, finish } = useOnboardingDraft();
  const lumiName = useLumiName();
  const limit = draft.limitMinutes;
  const limitIndex = Math.max(0, LIMIT_OPTIONS.indexOf(limit as (typeof LIMIT_OPTIONS)[number]));
  const stepLimit = (dir: -1 | 1) => {
    const next = Math.min(LIMIT_OPTIONS.length - 1, Math.max(0, limitIndex + dir));
    setDraft({ limitMinutes: LIMIT_OPTIONS[next] });
  };

  return (
    <StepShell
      step={3}
      title="Límite y noche"
      subtitle={`Un límite suave, sin castigos. ${lumiName} solo te lo recuerda a su manera.`}
      cta={{ label: `Despertar a ${lumiName}`, onPress: finish }}>
      <View style={{ gap: 10 }}>
        <AppText variant="label">Cada día</AppText>
        <List>
          <Row last>
            <Label title="Límite diario suave" sub="Sumando todas tus apps ladronas" />
            <Stepper
              value={formatLimit(limit)}
              onDecrease={() => stepLimit(-1)}
              onIncrease={() => stepLimit(1)}
              canDecrease={limitIndex > 0}
              canIncrease={limitIndex < LIMIT_OPTIONS.length - 1}
              decreaseLabel="Reducir límite"
              increaseLabel="Aumentar límite"
            />
          </Row>
        </List>
      </View>

      <Card style={{ gap: 14 }}>
        <View style={styles.stages}>
          {STAGES.map(({ state, pct }) => (
            <View key={state.key} style={styles.stage} accessible accessibilityLabel={`${state.label}, ${stageWhen(limit, pct)}`}>
              <Image source={state.image} style={[styles.stageImg, { opacity: 0.55 + 0.45 * state.glow }]} contentFit="contain" />
              <Text style={styles.stageLabel}>{state.label}</Text>
              <Text style={styles.stageWhen}>{stageWhen(limit, pct)}</Text>
            </View>
          ))}
        </View>
        <AppText variant="caption" style={{ textAlign: 'center' }}>
          {`Se va cansando al 25, 50, 75 y 100 % de tu límite. Si llegas, se echa una siestecita y mañana empieza de cero.`}
        </AppText>
      </Card>

      <View style={{ gap: 10 }}>
        <AppText variant="label">Horario de noche</AppText>
        <List>
          <Row>
            <Label title="Se va a dormir" />
            <Stepper
              value={draft.nightStart}
              onDecrease={() => setDraft({ nightStart: stepTime(draft.nightStart, -1) })}
              onIncrease={() => setDraft({ nightStart: stepTime(draft.nightStart, 1) })}
              decreaseLabel="Acostarse media hora antes"
              increaseLabel="Acostarse media hora después"
            />
          </Row>
          <Row last>
            <Label title="Se despierta" />
            <Stepper
              value={draft.nightEnd}
              onDecrease={() => setDraft({ nightEnd: stepTime(draft.nightEnd, -1) })}
              onIncrease={() => setDraft({ nightEnd: stepTime(draft.nightEnd, 1) })}
              decreaseLabel="Despertarse media hora antes"
              increaseLabel="Despertarse media hora después"
            />
          </Row>
        </List>
        <AppText variant="caption" style={{ paddingHorizontal: 6 }}>
          {`De noche ${lumiName} duerme y las apps ladronas se tapan con su escudo. Si le dejas dormir, se despierta con más luz.`}
        </AppText>
      </View>
    </StepShell>
  );
}

function stageWhen(limit: number, pct: number) {
  if (pct === 0) return 'Al empezar';
  return formatLimit(Math.round((limit * pct) / 100));
}

const styles = StyleSheet.create({
  stages: { flexDirection: 'row', justifyContent: 'space-between' },
  stage: { flex: 1, alignItems: 'center', gap: 2 },
  stageImg: { width: 56, height: 56, marginBottom: 4 },
  stageLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 12.5, color: Colors.text },
  stageWhen: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textTertiary, fontVariant: ['tabular-nums'] },
});
