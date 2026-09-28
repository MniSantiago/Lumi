import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseButton } from '@/components/paywall/paywall-parts';
import { Colors, Fonts } from '@/constants/theme';

/**
 * Hoja modal sencilla (se cierra deslizando o con la ×): título, texto,
 * contenido con scroll y, si hace falta, un pie fijo con el botón principal.
 */
export function Sheet({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <View pointerEvents="none" style={styles.background} />
      <View style={styles.closeWrap}>
        <CloseButton onPress={closeSheet} />
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {children}
      </ScrollView>
      {footer ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>{footer}</View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

export function closeSheet() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.nightDeep },
  background: {
    position: 'absolute',
    inset: 0,
    experimental_backgroundImage: `radial-gradient(ellipse 420px 300px at 80% -40px, rgba(140, 123, 216, 0.35) 0%, transparent 70%), linear-gradient(180deg, ${Colors.night}, ${Colors.nightDeep})`,
  },
  closeWrap: { position: 'absolute', top: 14, right: 16, zIndex: 2 },
  content: { paddingHorizontal: 18, paddingTop: 28, paddingBottom: 32, gap: 22 },
  header: { gap: 6, paddingRight: 44 },
  title: { fontFamily: Fonts.displayBold, fontSize: 28, lineHeight: 33, color: Colors.text, letterSpacing: -0.3 },
  subtitle: { fontFamily: Fonts.body, fontSize: 15, lineHeight: 21, color: Colors.textSecondary },
  footer: {
    gap: 8,
    paddingTop: 14,
    paddingHorizontal: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.hairline,
    backgroundColor: 'rgba(19, 17, 46, 0.96)',
  },
});
