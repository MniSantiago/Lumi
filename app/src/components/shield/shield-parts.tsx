import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius } from '@/constants/theme';
import type { ThiefApp } from '@/lumi/data';

/** La etiqueta de arriba (`.shield .app-tag`), con el icono provisional de la app. */
export function AppTag({ app, label }: { app: ThiefApp; label: string }) {
  return (
    <View style={styles.tag}>
      <View style={[styles.icon, { experimental_backgroundImage: app.icon }]}>
        <Text style={styles.iconLetter}>{app.letter}</Text>
      </View>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

/** Botón ancho del escudo (`.shield .actions .btn`); `ghost` es el secundario. */
export function ShieldButton({
  label,
  onPress,
  ghost = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  ghost?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        ghost ? styles.ghost : styles.primary,
        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}>
      <Text style={[styles.buttonText, { color: ghost ? Colors.text : Colors.night }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingLeft: 5,
    paddingRight: 10,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.hairline,
  },
  icon: {
    width: 16,
    height: 16,
    borderRadius: 5,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    // Apagado como la app: está tapada.
    opacity: 0.8,
  },
  iconLetter: { fontFamily: Fonts.bodyBold, fontSize: 9, lineHeight: 11, color: '#FFFFFF' },
  tagText: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 16, color: Colors.textTertiary },
  button: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  primary: { backgroundColor: Colors.amber, boxShadow: '0 6px 20px -6px rgba(255, 201, 107, 0.7)' },
  ghost: { backgroundColor: 'rgba(244, 240, 255, 0.1)' },
  buttonText: { fontFamily: Fonts.bodyBold, fontSize: 16, lineHeight: 20, textAlign: 'center' },
});
