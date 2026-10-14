import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { analytics, EVENTS } from '@/analytics';
import { useLumiName, useOnboardingDraft } from '@/components/onboarding/draft';
import { StepShell } from '@/components/onboarding/step-shell';
import { addDays, formatDayMonth, paywallCopy, plusFeatures, REMINDER_DAYS_BEFORE } from '@/components/paywall/copy';
import { FeatureRow, FreeForever, TrialTimeline } from '@/components/paywall/paywall-parts';
import { AppText } from '@/components/ui';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { tr } from '@/i18n';
import { useLumi } from '@/lumi/store';
import { scheduleTrialReminder } from '@/notifications';
import { purchases, type PlusPackage } from '@/purchases';

/**
 * Paso 4: la única vez que el onboarding menciona Plus. Se ofrece la prueba
 * gratuita y se sale igual de fácil por el lado gratis: las dos salidas son del
 * mismo tamaño y «Despertar a Lampi» es la que cierra el onboarding de siempre.
 *
 * Si la tienda no responde (sin clave, sin red, simulador), el paso se queda
 * solo con la salida gratis: nunca se puede quedar nadie encallado aquí.
 */
export default function PlusStep() {
  const { finish } = useOnboardingDraft();
  const lumiName = useLumiName();
  const { updateSettings } = useLumi();

  const [trial, setTrial] = useState<PlusPackage | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const now = useMemo(() => new Date(), []);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    analytics.track(EVENTS.paywallVisto, { origen: 'onboarding' });
    purchases
      .getOfferings()
      .then((list) => {
        if (!alive.current) return;
        // El anual es el que lleva la prueba; si algún día la lleva otro, vale igual.
        const conPrueba = list.find((p) => p.trialDays > 0) ?? null;
        setTrial(conPrueba);
        // Sin prueba que ofrecer, este paso se queda solo con la salida gratis:
        // es el mismo callejón sin salida que medimos en el paywall de dentro.
        if (!conPrueba) analytics.track(EVENTS.paywallSinOferta, { origen: 'onboarding' });
      })
      .catch(() => {
        if (alive.current) analytics.track(EVENTS.paywallSinOferta, { origen: 'onboarding' });
      });
    return () => {
      alive.current = false;
    };
  }, []);

  const onFree = () => void finish();

  const onTrial = async () => {
    if (!trial || busy) return;
    setBusy(true);
    setNotice(null);
    const compra = { origen: 'onboarding', plan: trial.id, con_prueba: true };
    analytics.track(EVENTS.compraIniciada, compra);
    try {
      const result = await purchases.purchase(trial.id);
      analytics.track(
        result.status === 'purchased' ? EVENTS.compraCompletada : EVENTS.compraNoCompletada,
        result.status === 'purchased' ? compra : { ...compra, motivo: 'cancelada' },
      );
      if (result.status === 'purchased') {
        updateSettings({ isPlus: true });
        // Primero se cierra el onboarding (ahí se pide el permiso de avisos),
        // y solo después se programa el recordatorio de la prueba.
        await finish();
        const at = addDays(new Date(), trial.trialDays - REMINDER_DAYS_BEFORE);
        at.setHours(10, 0, 0, 0);
        void scheduleTrialReminder({ lumiName, at });
        return;
      }
    } catch {
      analytics.track(EVENTS.compraNoCompletada, { ...compra, motivo: 'error' });
      if (alive.current) setNotice(paywallCopy.purchaseError);
    }
    if (alive.current) setBusy(false);
  };

  const wake = tr({
    es: `Despertar a ${lumiName}`,
    en: `Wake up ${lumiName}`,
    zh: `叫醒${lumiName}`,
    hi: `${lumiName} को जगाओ`,
    fr: `Réveiller ${lumiName}`,
  });

  return (
    <StepShell
      step={4}
      title={tr({
        es: 'Una última cosa',
        en: 'One last thing',
        zh: '最后一件事',
        hi: 'आख़िरी एक बात',
        fr: 'Une dernière chose',
      })}
      subtitle={
        trial
          ? tr({
              es: `${lumiName} ya está lista. Si te apetece, puedes probar Plus ${trial.trialDays} días gratis.`,
              en: `${lumiName} is ready. If you feel like it, you can try Plus free for ${trial.trialDays} days.`,
              zh: `${lumiName}准备好了。如果你想，可以免费试用 Plus ${trial.trialDays} 天。`,
              hi: `${lumiName} तैयार है। अगर मन हो, तो Plus को ${trial.trialDays} दिन मुफ़्त आज़मा सकते हो।`,
              fr: `${lumiName} est prête. Si ça te dit, tu peux essayer Plus ${trial.trialDays} jours gratuitement.`,
            })
          : tr({
              es: `${lumiName} ya está lista. Esto es lo que trae Lampi Plus, por si algún día te apetece.`,
              en: `${lumiName} is ready. Here’s what Lampi Plus brings, in case you ever feel like it.`,
              zh: `${lumiName}准备好了。这是 Lampi Plus 的内容，以后想要时可以看看。`,
              hi: `${lumiName} तैयार है। Lampi Plus में यह मिलता है, कभी मन हो तो।`,
              fr: `${lumiName} est prête. Voici ce qu’apporte Lampi Plus, si un jour ça te dit.`,
            })
      }
      cta={
        trial
          ? { label: paywallCopy.cta(trial), onPress: () => void onTrial(), disabled: busy, hint: notice ?? undefined }
          : { label: wake, onPress: onFree }
      }
      secondary={
        trial
          ? { label: wake, onPress: onFree, disabled: busy, hint: paywallCopy.honest(trial, now) }
          : undefined
      }>
      <View style={styles.features}>
        {plusFeatures.map((f) => (
          <FeatureRow key={f.key} symbol={f.symbol} tint={f.tint} title={f.title} sub={f.sub} />
        ))}
      </View>

      <FreeForever lumiName={lumiName} />

      {trial ? (
        <View style={{ gap: 12 }}>
          <AppText variant="label">
            {tr({
              es: 'Cómo va la prueba',
              en: 'How the trial works',
              zh: '试用怎么走',
              hi: 'ट्रायल कैसे चलता है',
              fr: 'Comment se passe l’essai',
            })}
          </AppText>
          <TrialTimeline
            steps={[
              { when: paywallCopy.timelineToday, what: paywallCopy.timelineTodayText },
              {
                when: paywallCopy.timelineReminder(trial.trialDays - REMINDER_DAYS_BEFORE),
                what: paywallCopy.timelineReminderText,
                date: formatDayMonth(addDays(now, trial.trialDays - REMINDER_DAYS_BEFORE)),
              },
              {
                when: paywallCopy.timelineCharge(trial.trialDays),
                what: paywallCopy.timelineChargeText,
                date: formatDayMonth(addDays(now, trial.trialDays)),
              },
            ]}
          />
          <Text style={styles.small}>{paywallCopy.reminderNote}</Text>
        </View>
      ) : null}

      <Text style={styles.small}>{paywallCopy.noPressure}</Text>
    </StepShell>
  );
}

const styles = StyleSheet.create({
  features: {
    gap: 14,
    padding: 16,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255, 201, 107, 0.3)',
    experimental_backgroundImage: `radial-gradient(ellipse 260px 160px at 90% 0%, rgba(255, 201, 107, 0.2) 0%, transparent 70%), linear-gradient(${Colors.indigo}, ${Colors.indigo})`,
  },
  small: { fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 17, color: Colors.textTertiary, textAlign: 'center' },
});
