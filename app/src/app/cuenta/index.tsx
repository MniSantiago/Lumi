import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useSession } from '@/account/session';
import { emailInput, FormError, passwordInput, SecondaryLink, useSubmit } from '@/components/account/form';
import { Field } from '@/components/onboarding/controls';
import { PrimaryButton } from '@/components/onboarding/step-shell';
import { closeSheet, Sheet } from '@/components/sheet';
import { Colors, Fonts } from '@/constants/theme';
import { useLumi } from '@/lumi/store';

type Mode = 'signup' | 'signin';

/** Crear cuenta o entrar. La cuenta es opcional: sirve para guardar el progreso. */
export default function AccountSheet() {
  const { settings, updateSettings } = useLumi();
  const { signIn, signUp } = useSession();
  const { modo } = useLocalSearchParams<{ modo?: string }>();
  const [mode, setMode] = useState<Mode>(modo === 'entrar' ? 'signin' : 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>(null);
  const { busy, error, setError, run } = useSubmit();
  const signup = mode === 'signup';

  const submit = () =>
    run(async () => {
      if (signup) {
        await signUp({ email, password, name: settings.userName, lumiName: settings.lumiName });
        router.replace('/cuenta/verificar');
      } else {
        const fromOnboarding = !settings.onboarded;
        const user = await signIn(email, password);
        // Los nombres de la cuenta mandan sobre los de este dispositivo. Si entra desde el
        // onboarding (iPhone nuevo), se lo salta: el progreso de la cuenta llega con ProgressSync.
        updateSettings({
          userName: user.name || settings.userName,
          lumiName: user.lumiName || settings.lumiName,
          onboarded: true,
        });
        // Desde el onboarding no hay a dónde volver (desaparece del stack): al Hogar, cuando ya exista.
        if (fromOnboarding) setTimeout(() => router.replace('/'), 0);
        else closeSheet();
      }
    });

  const switchMode = () => {
    setMode(signup ? 'signin' : 'signup');
    setError(null);
  };

  return (
    <Sheet
      title={signup ? 'Guarda tu progreso' : 'Entra en tu cuenta'}
      subtitle={
        signup
          ? `Con una cuenta, ${settings.lumiName} te encuentra si cambias de iPhone. Es opcional: todo funciona igual sin ella.`
          : `Para recuperar a ${settings.lumiName} y todo lo que ha traído.`
      }
      footer={
        <>
          <FormError message={error} />
          <PrimaryButton
            label={busy ? 'Un momento…' : signup ? 'Crear cuenta' : 'Entrar'}
            onPress={submit}
            disabled={busy || !email.trim() || password.length < (signup ? 8 : 1)}
          />
          <SecondaryLink label={signup ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'} onPress={switchMode} />
        </>
      }>
      <View style={{ gap: 16 }}>
        <Field
          label="Correo"
          placeholder="tu@correo.com"
          value={email}
          onChangeText={setEmail}
          {...emailInput}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <Field
          ref={passwordRef}
          label="Contraseña"
          placeholder={signup ? 'Al menos 8 caracteres' : 'Tu contraseña'}
          value={password}
          onChangeText={setPassword}
          {...passwordInput}
          autoComplete={signup ? 'new-password' : 'current-password'}
          textContentType={signup ? 'newPassword' : 'password'}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {signup ? null : (
          <SecondaryLink label="¿Se te olvidó la contraseña?" onPress={() => router.push('/cuenta/olvido')} />
        )}
      </View>
      {signup ? (
        <Text style={styles.legal}>
          Al crearla aceptas los Términos y la Política de privacidad. Tus datos de uso nunca salen de tu iPhone.
        </Text>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  legal: { fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 17, color: Colors.textTertiary, paddingHorizontal: 6 },
});
