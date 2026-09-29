import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { ApiError } from '@/api/client';
import { Colors, Fonts } from '@/constants/theme';
import { tr } from '@/i18n';

/** Mensaje de error (o aviso, con `info`) de un formulario, anunciado por VoiceOver. */
export function FormError({ message, info }: { message: string | null; info?: boolean }) {
  if (!message) return null;
  return (
    <Text
      style={[styles.error, info && styles.info]}
      accessibilityRole={info ? undefined : 'alert'}
      accessibilityLiveRegion={info ? 'polite' : 'assertive'}>
      {message}
    </Text>
  );
}

/** Enlace de texto discreto bajo el botón principal. */
export function SecondaryLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="link"
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => pressed && { opacity: 0.7 }}>
      <Text style={styles.link}>{label}</Text>
    </Pressable>
  );
}

/** Ejecuta una acción del formulario con estado de carga y mensaje de error. */
export function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : tr({
              es: 'Algo ha fallado. Vuelve a intentarlo en un momento.',
              en: 'Something went wrong. Try again in a moment.',
              zh: '出了点问题。请稍后再试。',
              hi: 'कुछ गड़बड़ हो गई। थोड़ी देर में फिर कोशिश करो।',
              fr: 'Un problème est survenu. Réessaie dans un instant.',
            }),
      );
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, setError, run };
}

/** Props comunes de los campos de contraseña. */
export const passwordInput = {
  secureTextEntry: true,
  autoCapitalize: 'none',
  autoCorrect: false,
  maxLength: 128,
} as const;

export const emailInput = {
  keyboardType: 'email-address',
  autoCapitalize: 'none',
  autoComplete: 'email',
  textContentType: 'emailAddress',
  maxLength: 254,
} as const;

const styles = StyleSheet.create({
  error: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 19, color: Colors.peach, textAlign: 'center' },
  info: { color: Colors.lavenderPale },
  link: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.amberPale,
    textAlign: 'center',
    paddingVertical: 4,
  },
});
