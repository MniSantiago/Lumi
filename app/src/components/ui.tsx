import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'caption' | 'label';

const variants: Record<Variant, TextStyle> = {
  display: { fontFamily: Fonts.display, fontSize: 32, lineHeight: 38, color: Colors.text, letterSpacing: -0.3 },
  title: { fontFamily: Fonts.display, fontSize: 22, lineHeight: 28, color: Colors.text },
  heading: { fontFamily: Fonts.bodySemiBold, fontSize: 16, lineHeight: 22, color: Colors.text },
  body: { fontFamily: Fonts.body, fontSize: 15, lineHeight: 21, color: Colors.textSecondary },
  bodyStrong: { fontFamily: Fonts.bodyMedium, fontSize: 15, lineHeight: 21, color: Colors.text },
  caption: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.textTertiary },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
};

export function AppText({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <Text {...rest} style={[variants[variant], style]} />;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Pantalla con scroll y cabecera de cuento. Bajo las pestañas nativas, el inset lo pone iOS. */
export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.screenContent}>
      <View style={styles.header}>
        <AppText variant="display">{title}</AppText>
        {subtitle ? <AppText>{subtitle}</AppText> : null}
      </View>
      {children}
    </ScrollView>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <AppText variant="title">{children}</AppText>
      {action}
    </View>
  );
}

export function Button({
  label,
  kind = 'primary',
  style,
  ...rest
}: PressableProps & { label: string; kind?: 'primary' | 'ghost'; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [
        styles.button,
        kind === 'primary' ? styles.buttonPrimary : styles.buttonGhost,
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        style,
      ]}>
      <Text style={[styles.buttonLabel, kind === 'primary' ? { color: Colors.onAmber } : { color: Colors.lavender }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Pill({
  children,
  tone = 'lavender',
  style,
}: {
  children: ReactNode;
  tone?: 'lavender' | 'amber';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.pill, tone === 'amber' ? styles.pillAmber : styles.pillLavender, style]}>
      <Text style={[styles.pillText, { color: tone === 'amber' ? Colors.amberPale : Colors.lavenderPale }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.night },
  screenContent: { paddingHorizontal: Spacing.three + 4, paddingBottom: Spacing.six, gap: Spacing.four },
  header: { gap: Spacing.one, paddingTop: Spacing.three },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
    padding: Spacing.three,
    borderCurve: 'continuous',
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  button: {
    minHeight: 50,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  buttonPrimary: {
    backgroundColor: Colors.amber,
    boxShadow: `0 0 24px ${Colors.amber}66`,
  },
  buttonGhost: { backgroundColor: 'rgba(201, 191, 242, 0.12)' },
  buttonLabel: { fontFamily: Fonts.bodyBold, fontSize: 16 },
  pill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  pillLavender: { backgroundColor: 'rgba(201, 191, 242, 0.16)' },
  pillAmber: { backgroundColor: 'rgba(255, 201, 107, 0.18)' },
  pillText: { fontFamily: Fonts.bodySemiBold, fontSize: 12 },
});
