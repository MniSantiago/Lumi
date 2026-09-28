import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { useSession } from '@/account/session';
import { forgotPassword, resetPassword } from '@/api/generated';
import { emailInput, FormError, passwordInput, SecondaryLink, useSubmit } from '@/components/account/form';
import { Field } from '@/components/onboarding/controls';
import { PrimaryButton } from '@/components/onboarding/step-shell';
import { closeSheet, Sheet } from '@/components/sheet';

/**
 * Recuperar la contraseña en dos pasos, sin salir de la app:
 * 1. el correo, al que llega un código de 6 cifras;
 * 2. el código y la contraseña nueva. Al terminar, entra directamente.
 */
export default function ForgotPasswordSheet() {
  const { signIn } = useSession();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>(null);
  const { busy, error, setError, run } = useSubmit();

  const sendCode = () =>
    run(async () => {
      await forgotPassword({ email });
      setStep('code');
    });

  const reset = () =>
    run(async () => {
      await resetPassword({ email, code, password });
      await signIn(email, password);
      closeSheet();
    });

  if (step === 'email') {
    return (
      <Sheet
        title="¿Se te olvidó?"
        subtitle="No pasa nada, a Lumi también se le olvidan cosas. Te enviamos un código para elegir una contraseña nueva."
        footer={
          <>
            <FormError message={error} />
            <PrimaryButton label={busy ? 'Un momento…' : 'Enviar código'} onPress={sendCode} disabled={busy || !email.trim()} />
          </>
        }>
        <Field
          label="Correo de tu cuenta"
          placeholder="tu@correo.com"
          value={email}
          onChangeText={setEmail}
          {...emailInput}
          autoFocus
          returnKeyType="send"
          onSubmitEditing={sendCode}
        />
      </Sheet>
    );
  }

  return (
    <Sheet
      title="Elige una contraseña nueva"
      subtitle={`Si ${email.trim()} tiene cuenta, le acaba de llegar un código de 6 cifras. Caduca en 15 minutos.`}
      footer={
        <>
          <FormError message={error} />
          <PrimaryButton
            label={busy ? 'Un momento…' : 'Cambiar y entrar'}
            onPress={reset}
            disabled={busy || code.length !== 6 || password.length < 8}
          />
          <SecondaryLink
            label="Usar otro correo"
            onPress={() => {
              setStep('email');
              setCode('');
              setError(null);
            }}
          />
        </>
      }>
      <View style={{ gap: 16 }}>
        <Field
          label="Código"
          placeholder="123456"
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <Field
          ref={passwordRef}
          label="Contraseña nueva"
          placeholder="Al menos 8 caracteres"
          value={password}
          onChangeText={setPassword}
          {...passwordInput}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={reset}
        />
        <SecondaryLink label="Reenviar el código" onPress={() => run(() => forgotPassword({ email }))} />
      </View>
    </Sheet>
  );
}
