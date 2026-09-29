import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  ReduceMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addDays, formatDayMonth, paywallCopy, plusFeatures, REMINDER_DAYS_BEFORE } from '@/components/paywall/copy';
import {
  CloseButton,
  FeatureRow,
  FreeForever,
  PlanCard,
  SmallLink,
  TrialTimeline,
  WideButton,
} from '@/components/paywall/paywall-parts';
import { PlusHero } from '@/components/paywall/plus-hero';
import { Colors, Fonts, Radius } from '@/constants/theme';
import { useLumi } from '@/lumi/store';
import { cancelTrialReminder, scheduleTrialReminder } from '@/notifications';
import { purchases, type PlusPackage, type PlusPackageId } from '@/purchases';

const ease = { easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System };
/** Cuánto dura el momento de éxito antes de cerrar la hoja. */
const SUCCESS_MS = 1400;

type Mode = 'offer' | 'owned' | 'success';
type Busy = null | 'purchase' | 'restore';

/**
 * Paywall de Lumi Plus: hoja modal (se cierra deslizando o con la ×).
 * Lo de pago es cosmético y avanzado; lo importante sigue gratis y se dice.
 */
export default function PlusScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useLumi();
  const name = settings.lumiName;

  const [view, setView] = useState<Mode>(settings.isPlus ? 'owned' : 'offer');
  const [packages, setPackages] = useState<PlusPackage[] | null>(null);
  const [selected, setSelected] = useState<PlusPackageId>('annual');
  const [busy, setBusy] = useState<Busy>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [successTitle, setSuccessTitle] = useState(paywallCopy.successTitle);

  const boost = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const now = useMemo(() => new Date(), []);

  useEffect(() => {
    let alive = true;
    purchases.getOfferings().then((p) => alive && setPackages(p));
    return () => {
      alive = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const pkg = packages?.find((p) => p.id === selected) ?? null;

  const celebrate = (title: string) => {
    updateSettings({ isPlus: true });
    setSuccessTitle(title);
    setView('success');
    AccessibilityInfo.announceForAccessibility(`${title} ${paywallCopy.successBody(name)}`);
    boost.value = withSequence(withTiming(1, { duration: 700, ...ease }), withTiming(0.8, { duration: 600, ...ease }));
    timer.current = setTimeout(close, SUCCESS_MS);
  };

  const onPurchase = async () => {
    if (!pkg || busy) return;
    setBusy('purchase');
    setNotice(null);
    try {
      const result = await purchases.purchase(pkg.id);
      if (result.status === 'purchased') {
        celebrate(paywallCopy.successTitle);
        if (pkg.trialDays > 0) {
          // Lo prometido: aviso 2 días antes de que acabe la prueba, a las 10:00.
          const at = addDays(new Date(), pkg.trialDays - REMINDER_DAYS_BEFORE);
          at.setHours(10, 0, 0, 0);
          void scheduleTrialReminder({ lumiName: name, at });
        }
      }
    } catch {
      setNotice(paywallCopy.purchaseError);
    } finally {
      setBusy(null);
    }
  };

  const onRestore = async () => {
    if (busy) return;
    setBusy('restore');
    setNotice(null);
    try {
      const { isPlus } = await purchases.restore();
      if (isPlus) celebrate(paywallCopy.restoredTitle);
      else setNotice(paywallCopy.restoreNone);
    } catch {
      setNotice(paywallCopy.restoreError);
    } finally {
      setBusy(null);
    }
  };

  const onDevRemove = () => {
    updateSettings({ isPlus: false });
    void cancelTrialReminder();
    boost.value = withTiming(0, { duration: 300, ...ease });
    setView('offer');
  };

  const owned = view === 'owned';
  const success = view === 'success';
  const trial = pkg && pkg.trialDays > 0 ? pkg : null;

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.background} />

      <View style={styles.closeWrap}>
        <CloseButton onPress={close} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, success && styles.contentCentered]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!success}>
        <PlusHero boost={boost} caption={owned || success ? undefined : paywallCopy.colorsTease} />

        {success ? (
          <Animated.View entering={FadeIn.duration(380).reduceMotion(ReduceMotion.System)} style={styles.header}>
            <Text style={styles.title}>{successTitle}</Text>
            <Text style={styles.subtitle}>{paywallCopy.successBody(name)}</Text>
          </Animated.View>
        ) : (
          <View style={styles.header}>
            <Text style={styles.title}>{owned ? paywallCopy.ownedTitle : paywallCopy.title}</Text>
            <Text style={styles.subtitle}>{owned ? paywallCopy.ownedBody(name) : paywallCopy.subtitle(name)}</Text>
          </View>
        )}

        {success ? null : (
          <>
            <View style={styles.section}>
              {owned ? null : <Text style={styles.sectionLabel}>{paywallCopy.plusSection}</Text>}
              <View style={styles.features}>
                {plusFeatures.map((f) => (
                  <FeatureRow key={f.key} symbol={f.symbol} tint={f.tint} title={f.title} sub={f.sub} />
                ))}
              </View>
            </View>

            {owned ? null : (
              <>
                <FreeForever lumiName={name} />

                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>{paywallCopy.plansSection}</Text>
                  {packages ? (
                    <View style={styles.plans} accessibilityRole="radiogroup">
                      {packages.map((p) => (
                        <PlanCard
                          key={p.id}
                          pkg={p}
                          selected={p.id === selected}
                          onSelect={() => setSelected(p.id)}
                          disabled={busy !== null}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.plansLoading}>
                      <ActivityIndicator color={Colors.lavender} />
                      <Text style={styles.small}>{paywallCopy.loadingPlans}</Text>
                    </View>
                  )}
                </View>

                {trial ? (
                  <View style={styles.trialBox}>
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
              </>
            )}
          </>
        )}
      </ScrollView>

      {success ? null : (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          {owned ? (
            <>
              <WideButton label={paywallCopy.close} onPress={close} />
              <View style={styles.linksRow}>
                {/* Cancelar o cambiar de plan se hace en Apple; lo dejamos a un toque. */}
                <SmallLink
                  label="Gestionar suscripción"
                  onPress={() => void Linking.openURL('https://apps.apple.com/account/subscriptions')}
                />
              </View>
              {__DEV__ ? (
                <View style={styles.linksRow}>
                  <SmallLink label={paywallCopy.devRemove} onPress={onDevRemove} />
                </View>
              ) : null}
            </>
          ) : (
            <>
              {notice ? <Text style={styles.notice}>{notice}</Text> : null}
              <WideButton
                label={pkg ? paywallCopy.cta(pkg) : paywallCopy.ctaFallback}
                onPress={onPurchase}
                loading={busy === 'purchase'}
                disabled={!pkg || busy === 'restore'}
              />
              {pkg ? <Text style={styles.honest}>{paywallCopy.honest(pkg, now)}</Text> : null}
              <View style={styles.linksRow}>
                <SmallLink
                  label={busy === 'restore' ? paywallCopy.restoring : paywallCopy.restore}
                  onPress={onRestore}
                  disabled={busy !== null}
                />
                <Text style={styles.sep}>·</Text>
                <SmallLink label={paywallCopy.terms} onPress={() => router.push('/legal/terminos')} />
                <Text style={styles.sep}>·</Text>
                <SmallLink label={paywallCopy.privacy} onPress={() => router.push('/legal/privacidad')} />
              </View>
              <Text style={styles.tender}>{paywallCopy.noPressure}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.nightDeep },
  // Hermana mayor de la tarjeta de Ajustes: resplandor ámbar sobre la noche índigo.
  background: {
    position: 'absolute',
    inset: 0,
    experimental_backgroundImage: `radial-gradient(ellipse 420px 320px at 50% 0%, rgba(255, 201, 107, 0.28) 0%, transparent 70%), linear-gradient(180deg, ${Colors.indigo}, ${Colors.night} 45%, ${Colors.nightDeep})`,
  },
  closeWrap: { position: 'absolute', top: 14, right: 16, zIndex: 2 },
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24, gap: 22 },
  contentCentered: { flexGrow: 1, justifyContent: 'center', paddingBottom: 64 },
  header: { alignItems: 'center', gap: 6, marginTop: -6 },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 30,
    lineHeight: 35,
    color: Colors.amberPale,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  section: { gap: 12 },
  sectionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  features: {
    gap: 14,
    padding: 16,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255, 201, 107, 0.3)',
    experimental_backgroundImage: `radial-gradient(ellipse 260px 160px at 90% 0%, rgba(255, 201, 107, 0.2) 0%, transparent 70%), linear-gradient(${Colors.indigo}, ${Colors.indigo})`,
  },
  plans: { gap: 10 },
  plansLoading: { height: 132, alignItems: 'center', justifyContent: 'center', gap: 8 },
  trialBox: { gap: 12, marginTop: -6 },
  small: { fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 17, color: Colors.textTertiary, textAlign: 'center' },

  footer: {
    gap: 10,
    paddingTop: 14,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.hairline,
    backgroundColor: 'rgba(19, 17, 46, 0.96)',
  },
  notice: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.peach, textAlign: 'center' },
  honest: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 17, color: Colors.textSecondary, textAlign: 'center' },
  linksRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  sep: { fontSize: 12, color: Colors.textTertiary },
  tender: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 16, color: Colors.textTertiary, textAlign: 'center' },
});
