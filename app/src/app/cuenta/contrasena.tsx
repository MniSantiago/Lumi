import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { useSession } from '@/account/session';
import { changePassword } from '@/api/generated';
import { FormError, passwordInput, SecondaryLink, useSubmit } from '@/components/account/form';
import { Field } from '@/components/onboarding/controls';
import { PrimaryButton } from '@/components/onboarding/step-shell';
import { closeSheet, Sheet } from '@/components/sheet';

/** Cambiar la contraseña sabiendo la actual. Cierra la sesión en los demás dispositivos. */
export default function ChangePasswordSheet() {
  const { applySession } = useSession();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const nextRef = useRef<TextInput>(null);
  const { busy, error, run } = useSubmit();

  const submit = () =>
    run(async () => {
      await applySession(await changePassword({ currentPassword: current, newPassword: next }));
      closeSheet();
    });

  return (
    <Sheet
      title="Cambiar la contraseña"
      subtitle="Al cambiarla, cerramos la sesión en tus otros dispositivos."
      footer={
        <>
          <FormError message={error} />
          <PrimaryButton
            label={busy ? 'Un momento…' : 'Guardar'}
            onPress={submit}
            disabled={busy || !current || next.length < 8}
          />
        </>
      }>
      <View style={{ gap: 16 }}>
        <Field
          label="Contraseña actual"
          value={current}
          onChangeText={setCurrent}
          {...passwordInput}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => nextRef.current?.focus()}
        />
        <Field
          ref={nextRef}
          label="Contraseña nueva"
          placeholder="Al menos 8 caracteres"
          value={next}
          onChangeText={setNext}
          {...passwordInput}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <SecondaryLink label="No la recuerdo" onPress={() => router.replace('/cuenta/olvido')} />
      </View>
    </Sheet>
  );
}
