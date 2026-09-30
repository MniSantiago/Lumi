import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import { Keyboard, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { tr } from '@/i18n';

export const STEP_COUNT = 3;

const enter = (delay: number) => FadeInDown.duration(520).delay(delay).reduceMotion(ReduceMotion.System);

type Cta = { label: string; onPress: () => void; disabled?: boolean; hint?: string };

/**
 * Esqueleto de cada paso: progreso y atrás arriba, título de cuento, contenido
 * con scroll y la acción principal en ámbar abajo, por encima del teclado.
 */
export function StepShell({
  step,
  title,
  subtitle,
  children,
  cta,
  background,
  scrollRef,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  cta: Cta;
  /** Fondo propio (la ilustración del paso 1); por defecto, la noche con resplandor lavanda. */
  background?: ReactNode;
  scrollRef?: RefObject<ScrollView | null>;
}) {
  const insets = useSafeAreaInsets();
  const keyboardUp = useKeyboardVisible();

  return (
    <View style={styles.root}>
      {background ?? <View pointerEvents="none" style={styles.innerBg} />}
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two }]}>
          {step > 1 ? <BackButton /> : <View style={styles.backSpacer} />}
          <ProgressSegments step={step} />
          <View style={styles.backSpacer} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}>
          <Animated.View entering={enter(0)} style={styles.header}>
            <AppText variant="display" accessibilityRole="header">
              {title}
            </AppText>
            {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
          </Animated.View>
          <Animated.View entering={enter(120)} style={styles.body}>
            {children}
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: keyboardUp ? Spacing.three : insets.bottom + Spacing.two }]}>
          {cta.hint ? <Text style={styles.hint}>{cta.hint}</Text> : null}
          <PrimaryButton label={cta.label} onPress={cta.onPress} disabled={cta.disabled} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', () => setVisible(true));
    const hide = Keyboard.addListener('keyboardWillHide', () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}

/** Tres tramos como el medidor de luz: ámbar los hechos y el actual. */
function ProgressSegments({ step }: { step: number }) {
  return (
    <View
      style={styles.segments}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={tr({
        es: `Paso ${step} de ${STEP_COUNT}`,
        en: `Step ${step} of ${STEP_COUNT}`,
        zh: `第 ${step} 步，共 ${STEP_COUNT} 步`,
        hi: `${STEP_COUNT} में से चरण ${step}`,
        fr: `Étape ${step} sur ${STEP_COUNT}`,
      })}>
      {Array.from({ length: STEP_COUNT }, (_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            i < step ? styles.segmentOn : styles.segmentOff,
            i === step - 1 && styles.segmentCurrent,
          ]}
        />
      ))}
    </View>
  );
}

function BackButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={tr({
        es: 'Atrás',
        en: 'Back',
        zh: '返回',
        hi: 'पीछे',
        fr: 'Retour',
      })}
      hitSlop={8}
      onPress={() => router.back()}
      style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}>
      <SymbolView
        name="chevron.left"
        size={16}
        weight="semibold"
        tintColor={Colors.lavenderPale}
        fallback={<Text style={styles.backFallback}>‹</Text>}
      />
    </Pressable>
  );
}

/** Botón principal a todo lo ancho, en el ámbar de la luz de Lampi. */
export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  // Que el teclado no se quede abierto al pasar de paso.
  const handlePress = () => {
    Keyboard.dismiss();
    onPress();
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.primary,
        disabled ? styles.primaryDisabled : styles.primaryEnabled,
        pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
      ]}>
      <Text style={[styles.primaryText, disabled && { color: Colors.textTertiary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.nightDeep },
  innerBg: {
    position: 'absolute',
    inset: 0,
    experimental_backgroundImage: `radial-gradient(ellipse 420px 300px at 80% -40px, rgba(140, 123, 216, 0.35) 0%, transparent 70%), linear-gradient(180deg, ${Colors.night}, ${Colors.nightDeep})`,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: 18,
    paddingBottom: Spacing.two,
  },
  backSpacer: { width: 36, height: 36 },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 191, 242, 0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
  },
  backFallback: { fontFamily: Fonts.bodySemiBold, fontSize: 22, color: Colors.lavenderPale },
  segments: { flex: 1, flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 6, borderRadius: Radius.pill },
  segmentOn: { experimental_backgroundImage: `linear-gradient(90deg, ${Colors.amber}, ${Colors.amberPale})` },
  segmentCurrent: { boxShadow: `0 0 10px ${Colors.amber}80` },
  segmentOff: { backgroundColor: 'rgba(201, 191, 242, 0.16)' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 18, paddingTop: Spacing.two, paddingBottom: Spacing.four, gap: 22 },
  header: { gap: 4 },
  subtitle: { fontSize: 15, lineHeight: 21, color: Colors.textSecondary },
  body: { flexGrow: 1, gap: 22 },
  footer: { paddingHorizontal: 18, paddingTop: Spacing.two, gap: 8 },
  hint: { fontFamily: Fonts.body, fontSize: 13, color: Colors.textTertiary, textAlign: 'center' },
  primary: {
    minHeight: 54,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: Radius.pill,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryEnabled: { backgroundColor: Colors.amber, boxShadow: '0 8px 24px -8px rgba(255, 201, 107, 0.75)' },
  primaryDisabled: { backgroundColor: 'rgba(201, 191, 242, 0.14)' },
  primaryText: { fontFamily: Fonts.bodyBold, fontSize: 16, color: Colors.onAmber },
});
