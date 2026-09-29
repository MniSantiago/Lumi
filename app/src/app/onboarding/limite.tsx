import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Label, List, Row, Stepper, Toggle } from '@/components/onboarding/controls';
import { useLumiName, useOnboardingDraft } from '@/components/onboarding/draft';
import { StepShell } from '@/components/onboarding/step-shell';
import { AppText, Card } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { LUMI_STATES, type LumiState } from '@/lumi/states';
import { formatLimit, LIMIT_OPTIONS } from '@/lumi/store';
import { stepTime } from '@/lumi/time';
import { tr } from '@/i18n';
import { clockTime } from '@/i18n/dates';

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
      title={tr({
        es: 'Límite y noche',
        en: 'Limit and night',
        zh: '上限和夜晚',
        hi: 'सीमा और रात',
        fr: 'Limite et nuit',
      })}
      subtitle={tr({
        es: `Un límite suave, sin castigos. ${lumiName} solo te lo recuerda a su manera.`,
        en: `A gentle limit, no punishments. ${lumiName} just reminds you in her own way.`,
        zh: `温和的上限，没有惩罚。${lumiName}只会用她的方式提醒你。`,
        hi: `एक नरम सीमा, बिना सज़ा के। ${lumiName} बस अपने तरीक़े से याद दिलाती है।`,
        fr: `Une limite douce, sans punition. ${lumiName} te le rappelle juste à sa façon.`,
      })}
      cta={{
        label: tr({
          es: `Despertar a ${lumiName}`,
          en: `Wake up ${lumiName}`,
          zh: `叫醒${lumiName}`,
          hi: `${lumiName} को जगाओ`,
          fr: `Réveiller ${lumiName}`,
        }),
        onPress: () => void finish(),
      }}>
      <View style={{ gap: 10 }}>
        <AppText variant="label">
          {tr({ es: 'Cada día', en: 'Every day', zh: '每天', hi: 'हर दिन', fr: 'Chaque jour' })}
        </AppText>
        <List>
          <Row last>
            <Label
              title={tr({
                es: 'Límite diario suave',
                en: 'Gentle daily limit',
                zh: '温和的每日上限',
                hi: 'रोज़ की नरम सीमा',
                fr: 'Limite quotidienne douce',
              })}
              sub={tr({
                es: 'Sumando todas tus apps ladronas',
                en: 'Adding up all your thief apps',
                zh: '所有偷时间的 App 加起来',
                hi: 'सभी चोर ऐप्स मिलाकर',
                fr: 'En additionnant toutes tes applis voleuses',
              })}
            />
            <Stepper
              label={tr({
                es: 'Límite diario suave',
                en: 'Gentle daily limit',
                zh: '温和的每日上限',
                hi: 'रोज़ की नरम सीमा',
                fr: 'Limite quotidienne douce',
              })}
              value={formatLimit(limit)}
              onDecrease={() => stepLimit(-1)}
              onIncrease={() => stepLimit(1)}
              canDecrease={limitIndex > 0}
              canIncrease={limitIndex < LIMIT_OPTIONS.length - 1}
              decreaseLabel={tr({
                es: 'Reducir límite',
                en: 'Lower limit',
                zh: '减少上限',
                hi: 'सीमा घटाओ',
                fr: 'Réduire la limite',
              })}
              increaseLabel={tr({
                es: 'Aumentar límite',
                en: 'Raise limit',
                zh: '增加上限',
                hi: 'सीमा बढ़ाओ',
                fr: 'Augmenter la limite',
              })}
            />
          </Row>
        </List>
      </View>

      <Card style={{ gap: 14 }}>
        <View style={styles.stages}>
          {STAGES.map(({ state, pct }) => (
            <View
              key={state.key}
              style={styles.stage}
              accessible
              accessibilityLabel={`${state.label}, ${stageWhen(limit, pct)}`}>
              <Image
                source={state.image}
                style={[styles.stageImg, { opacity: 0.55 + 0.45 * state.glow }]}
                contentFit="contain"
              />
              <Text style={styles.stageLabel}>{state.label}</Text>
              <Text style={styles.stageWhen}>{stageWhen(limit, pct)}</Text>
            </View>
          ))}
        </View>
        <AppText variant="caption" style={{ textAlign: 'center' }}>
          {tr({
            es: 'Se va cansando al 25, 50, 75 y 100 % de tu límite. Si llegas, se echa una siestecita y mañana empieza de cero.',
            en: 'She gets tired at 25, 50, 75 and 100% of your limit. If you reach it, she takes a little nap and starts fresh tomorrow.',
            zh: '到上限的 25%、50%、75% 和 100% 时，她会越来越累。到了上限，她就睡个小觉，明天重新开始。',
            hi: 'तुम्हारी सीमा के 25, 50, 75 और 100% पर वो थकती जाती है। अगर तुम पहुँच गए, तो वो झपकी लेती है और कल नई शुरुआत करती है।',
            fr: 'Elle se fatigue à 25, 50, 75 et 100 % de ta limite. Si tu l’atteins, elle fait une petite sieste et repart de zéro demain.',
          })}
        </AppText>
      </Card>

      <View style={{ gap: 10 }}>
        <AppText variant="label">
          {tr({
            es: 'Horario de noche',
            en: 'Night schedule',
            zh: '夜间时段',
            hi: 'रात का समय',
            fr: 'Horaire de nuit',
          })}
        </AppText>
        <List>
          <Row>
            <Label
              title={tr({
                es: 'Se va a dormir',
                en: 'Goes to sleep',
                zh: '睡觉时间',
                hi: 'सोने जाती है',
                fr: 'Va dormir',
              })}
            />
            <Stepper
              label={tr({
                es: 'Se va a dormir',
                en: 'Goes to sleep',
                zh: '睡觉时间',
                hi: 'सोने जाती है',
                fr: 'Va dormir',
              })}
              value={clockTime(draft.nightStart)}
              onDecrease={() => setDraft({ nightStart: stepTime(draft.nightStart, -1) })}
              onIncrease={() => setDraft({ nightStart: stepTime(draft.nightStart, 1) })}
              decreaseLabel={tr({
                es: 'Acostarse media hora antes',
                en: 'Go to bed half an hour earlier',
                zh: '提前半小时睡觉',
                hi: 'आधा घंटा पहले सोना',
                fr: 'Se coucher une demi-heure plus tôt',
              })}
              increaseLabel={tr({
                es: 'Acostarse media hora después',
                en: 'Go to bed half an hour later',
                zh: '推迟半小时睡觉',
                hi: 'आधा घंटा बाद सोना',
                fr: 'Se coucher une demi-heure plus tard',
              })}
            />
          </Row>
          <Row>
            <Label
              title={tr({
                es: 'Se despierta',
                en: 'Wakes up',
                zh: '起床时间',
                hi: 'जागती है',
                fr: 'Se réveille',
              })}
            />
            <Stepper
              label={tr({
                es: 'Se despierta',
                en: 'Wakes up',
                zh: '起床时间',
                hi: 'जागती है',
                fr: 'Se réveille',
              })}
              value={clockTime(draft.nightEnd)}
              onDecrease={() => setDraft({ nightEnd: stepTime(draft.nightEnd, -1) })}
              onIncrease={() => setDraft({ nightEnd: stepTime(draft.nightEnd, 1) })}
              decreaseLabel={tr({
                es: 'Despertarse media hora antes',
                en: 'Wake up half an hour earlier',
                zh: '提前半小时起床',
                hi: 'आधा घंटा पहले जागना',
                fr: 'Se réveiller une demi-heure plus tôt',
              })}
              increaseLabel={tr({
                es: 'Despertarse media hora después',
                en: 'Wake up half an hour later',
                zh: '推迟半小时起床',
                hi: 'आधा घंटा बाद जागना',
                fr: 'Se réveiller une demi-heure plus tard',
              })}
            />
          </Row>
          <Row last>
            <Label
              title={tr({
                es: 'Avisarme cuando vuelva',
                en: 'Notify me when she’s back',
                zh: '她回来时通知我',
                hi: 'लौटने पर मुझे बताओ',
                fr: 'Me prévenir à son retour',
              })}
              sub={tr({
                es: 'Una notificación por la noche con su postal',
                en: 'A notification at night with her postcard',
                zh: '晚上发一条带明信片的通知',
                hi: 'रात को उसके पोस्टकार्ड के साथ एक सूचना',
                fr: 'Une notification le soir avec sa carte',
              })}
            />
            <Toggle
              label={tr({
                es: 'Avisarme cuando vuelva',
                en: 'Notify me when she’s back',
                zh: '她回来时通知我',
                hi: 'लौटने पर मुझे बताओ',
                fr: 'Me prévenir à son retour',
              })}
              value={draft.nightlyPostcard}
              onChange={(nightlyPostcard) => setDraft({ nightlyPostcard })}
            />
          </Row>
        </List>
        <AppText variant="caption" style={{ paddingHorizontal: 6 }}>
          {tr({
            es: `De noche ${lumiName} duerme y las apps ladronas se tapan con su escudo. Si le dejas dormir, se despierta con más luz.`,
            en: `At night ${lumiName} sleeps and the thief apps are covered by her shield. If you let her sleep, she wakes up brighter.`,
            zh: `晚上${lumiName}睡觉，偷时间的 App 会被她的护盾盖住。让她好好睡，她醒来会更亮。`,
            hi: `रात को ${lumiName} सोती है और चोर ऐप्स उसकी ढाल से ढक जाती हैं। उसे सोने दो, तो वो और रोशनी के साथ जागेगी।`,
            fr: `La nuit, ${lumiName} dort et les applis voleuses sont couvertes par son bouclier. Si tu la laisses dormir, elle se réveille plus lumineuse.`,
          })}
        </AppText>
      </View>
    </StepShell>
  );
}

function stageWhen(limit: number, pct: number) {
  if (pct === 0) return tr({ es: 'Al empezar', en: 'At the start', zh: '开始时', hi: 'शुरुआत में', fr: 'Au début' });
  return formatLimit(Math.round((limit * pct) / 100));
}

const styles = StyleSheet.create({
  stages: { flexDirection: 'row', justifyContent: 'space-between' },
  stage: { flex: 1, alignItems: 'center', gap: 2 },
  stageImg: { width: 56, height: 56, marginBottom: 4 },
  stageLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 12.5, color: Colors.text },
  stageWhen: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textTertiary, fontVariant: ['tabular-nums'] },
});
