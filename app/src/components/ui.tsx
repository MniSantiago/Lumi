import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

type Variant = 'display' | 'title' | 'section' | 'heading' | 'body' | 'bodyStrong' | 'caption' | 'label';

const variants: Record<Variant, TextStyle> = {
  display: { fontFamily: Fonts.displayBold, fontSize: 32, lineHeight: 36, color: Colors.text, letterSpacing: -0.3 },
  title: { fontFamily: Fonts.display, fontSize: 22, lineHeight: 28, color: Colors.text },
  section: { fontFamily: Fonts.display, fontSize: 18, lineHeight: 24, color: Colors.text },
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

/**
 * Pantalla interior con scroll y cabecera de cuento, sobre la noche con un
 * resplandor lavanda arriba a la derecha (como `.inner-bg` del mockup).
 * Bajo las pestañas nativas, el inset inferior lo pone iOS.
 */
export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.innerBg} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.screenContent}>
        <View style={styles.header}>
          <AppText variant="display">{title}</AppText>
          {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
        </View>
        {children}
      </ScrollView>
    </View>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <AppText variant="section">{children}</AppText>
      {action}
    </View>
  );
}

/** Botón compacto en ámbar (el `.btn` del mockup), alineado a la izquierda. */
export function PillButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pillButton, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}>
      <Text style={styles.pillButtonText}>{label}</Text>
    </Pressable>
  );
}

/** Enlace de texto en ámbar claro ("Ver álbum", "Editar"). */
export function TextLink({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="link" hitSlop={8} onPress={onPress}>
      <Text style={styles.link}>{label}</Text>
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
  screen: { flex: 1, backgroundColor: Colors.nightDeep },
  innerBg: {
    position: 'absolute',
    inset: 0,
    experimental_backgroundImage: `radial-gradient(ellipse 420px 300px at 80% -40px, rgba(140, 123, 216, 0.35) 0%, transparent 70%), linear-gradient(180deg, ${Colors.night}, ${Colors.nightDeep})`,
  },
  screenContent: { paddingHorizontal: 18, paddingBottom: Spacing.six, gap: 22 },
  header: { gap: 2, paddingTop: Spacing.two, marginBottom: -6 },
  subtitle: { fontSize: 14, lineHeight: 20, color: Colors.textSecondary },
  link: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.amberPale },
  pillButton: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: Colors.amber,
    boxShadow: '0 6px 20px -6px rgba(255, 201, 107, 0.7)',
  },
  pillButtonText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.night },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.hairline,
    padding: Spacing.three,
    borderCurve: 'continuous',
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  pill: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  pillLavender: { backgroundColor: 'rgba(201, 191, 242, 0.16)' },
  pillAmber: { backgroundColor: 'rgba(255, 201, 107, 0.18)' },
  pillText: { fontFamily: Fonts.bodySemiBold, fontSize: 12 },
});
