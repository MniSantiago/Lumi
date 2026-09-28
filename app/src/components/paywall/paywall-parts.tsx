import { SymbolView, type SFSymbol } from 'expo-symbols';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';
import type { PlusPackage } from '@/purchases';

import { freeForever, paywallCopy } from './copy';

/** Botón redondo de cerrar, arriba a la derecha de la hoja. */
export function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={paywallCopy.closeA11y}
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [styles.close, pressed && { opacity: 0.7 }]}>
      <SymbolView name="xmark" size={13} weight="bold" tintColor={Colors.lavenderPale} />
    </Pressable>
  );
}

/** Ventaja de Plus con su orbe de color. */
export function FeatureRow({
  symbol,
  tint,
  title,
  sub,
}: {
  symbol: SFSymbol;
  tint: string;
  title: string;
  sub: string;
}) {
  return (
    <View style={styles.feature}>
      <View
        style={[
          styles.featureOrb,
          { experimental_backgroundImage: `radial-gradient(circle, ${tint}55 0%, ${tint}1F 60%, transparent 100%)` },
        ]}>
        <SymbolView name={symbol} size={16} tintColor={tint} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSub}>{sub}</Text>
      </View>
    </View>
  );
}

/** Lo que nunca se paga: la parte generosa. */
export function FreeForever({ lumiName }: { lumiName: string }) {
  return (
    <View style={styles.free}>
      <Text style={styles.freeTitle}>{paywallCopy.freeTitle}</Text>
      <View style={styles.freeList}>
        {freeForever.map((item) => (
          <View key={item} style={styles.freeItem}>
            <SymbolView name="checkmark" size={11} weight="bold" tintColor={Colors.moss} />
            <Text style={styles.freeItemText}>{item}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.freeNote}>{paywallCopy.freeNote(lumiName)}</Text>
    </View>
  );
}

/** Tarjeta de plan seleccionable; borde ámbar cuando está elegida. */
export function PlanCard({
  pkg,
  selected,
  onSelect,
  disabled,
}: {
  pkg: PlusPackage;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const badge = pkg.savingsPercent ? paywallCopy.badgeSavings(pkg.savingsPercent) : null;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={`${pkg.title}. ${paywallCopy.planLine(pkg)}. ${pkg.perMonth}`}
      disabled={disabled}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.plan,
        selected ? styles.planOn : styles.planOff,
        pressed && { transform: [{ scale: 0.99 }] },
      ]}>
      <View style={[styles.radio, selected ? styles.radioOn : styles.radioOff]}>
        {selected ? <SymbolView name="checkmark" size={11} weight="bold" tintColor={Colors.onAmber} /> : null}
      </View>
      <View style={styles.planText}>
        <View style={styles.planTitleRow}>
          <Text style={styles.planTitle}>{pkg.title}</Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.planLine}>{paywallCopy.planLine(pkg)}</Text>
      </View>
      <Text style={[styles.perMonth, selected && { color: Colors.amberPale }]}>{pkg.perMonth}</Text>
    </Pressable>
  );
}

/** Cuándo pasa cada cosa en la prueba: honestidad antes que sorpresa. */
export function TrialTimeline({ steps }: { steps: { when: string; what: string; date?: string }[] }) {
  return (
    <View style={styles.timeline}>
      {steps.map((s, i) => (
        <View key={s.when} style={styles.step}>
          <View style={styles.stepTrack}>
            <View style={[styles.stepDot, i === 0 && styles.stepDotNow]} />
            {i < steps.length - 1 ? <View style={styles.stepLine} /> : null}
          </View>
          <Text style={styles.stepWhen}>{s.when}</Text>
          <Text style={styles.stepWhat}>{s.what}</Text>
          {s.date ? <Text style={styles.stepDate}>{s.date}</Text> : null}
        </View>
      ))}
    </View>
  );
}

/** Botón ancho (como el del escudo); ámbar o fantasma, con estado de carga. */
export function WideButton({
  label,
  onPress,
  ghost = false,
  loading = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  ghost?: boolean;
  loading?: boolean;
  disabled?: boolean;
}) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        ghost ? styles.ghost : styles.primary,
        disabled && !loading && { opacity: 0.55 },
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}>
      {loading ? (
        <ActivityIndicator color={ghost ? Colors.text : Colors.night} />
      ) : (
        <Text style={[styles.buttonText, { color: ghost ? Colors.text : Colors.night }]}>{label}</Text>
      )}
    </Pressable>
  );
}

/** Enlace pequeño del pie ("Restaurar compras", "Términos"…). */
export function SmallLink({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="link" hitSlop={8} onPress={onPress} disabled={disabled}>
      {({ pressed }) => <Text style={[styles.smallLink, (pressed || disabled) && { opacity: 0.6 }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  close: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 240, 255, 0.12)',
  },

  feature: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  featureOrb: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, gap: 1, paddingTop: 1 },
  featureTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 15, lineHeight: 20, color: Colors.text },
  featureSub: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.textSecondary },

  free: {
    gap: 10,
    padding: 16,
    borderRadius: Radius.lg,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(143, 209, 166, 0.35)',
    backgroundColor: 'rgba(143, 209, 166, 0.07)',
  },
  freeTitle: { fontFamily: Fonts.display, fontSize: 17, lineHeight: 22, color: Colors.text },
  freeList: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 6 },
  freeItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  freeItemText: { fontFamily: Fonts.bodyMedium, fontSize: 13.5, lineHeight: 18, color: Colors.lavenderPale },
  freeNote: { fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 17, color: Colors.textTertiary },

  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderCurve: 'continuous',
    borderWidth: 1.5,
  },
  planOn: {
    borderColor: Colors.amber,
    experimental_backgroundImage: `radial-gradient(ellipse 220px 120px at 90% 0%, rgba(255, 201, 107, 0.22) 0%, transparent 70%), linear-gradient(${Colors.indigo}, ${Colors.indigo})`,
  },
  planOff: { borderColor: Colors.hairline, backgroundColor: Colors.card },
  radio: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: Colors.amber },
  radioOff: { borderWidth: 1.5, borderColor: 'rgba(201, 191, 242, 0.4)' },
  planText: { flex: 1, gap: 2 },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  planTitle: { fontFamily: Fonts.bodyBold, fontSize: 16, lineHeight: 21, color: Colors.text },
  planLine: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.textSecondary },
  perMonth: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textTertiary,
    fontVariant: ['tabular-nums'],
  },
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 201, 107, 0.2)',
  },
  badgeText: { fontFamily: Fonts.bodyBold, fontSize: 11, lineHeight: 15, color: Colors.amberPale },

  timeline: { flexDirection: 'row', paddingHorizontal: 4 },
  step: { flex: 1, gap: 2 },
  stepTrack: { flexDirection: 'row', alignItems: 'center', height: 12, marginBottom: 4 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.violet },
  stepDotNow: { backgroundColor: Colors.amber, boxShadow: `0 0 8px ${Colors.amber}` },
  stepLine: { flex: 1, height: 2, marginHorizontal: 4, borderRadius: 1, backgroundColor: 'rgba(201, 191, 242, 0.25)' },
  stepWhen: { fontFamily: Fonts.bodySemiBold, fontSize: 12.5, lineHeight: 17, color: Colors.text },
  stepWhat: { fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 17, color: Colors.textSecondary },
  stepDate: { fontFamily: Fonts.body, fontSize: 11.5, lineHeight: 15, color: Colors.textTertiary },

  button: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderRadius: Radius.pill,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  primary: { backgroundColor: Colors.amber, boxShadow: '0 6px 20px -6px rgba(255, 201, 107, 0.7)' },
  ghost: { backgroundColor: 'rgba(244, 240, 255, 0.1)' },
  buttonText: { fontFamily: Fonts.bodyBold, fontSize: 16, lineHeight: 20, textAlign: 'center' },

  smallLink: { fontFamily: Fonts.bodySemiBold, fontSize: 12, lineHeight: 16, color: Colors.textSecondary },
});
