import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useSession } from '@/account/session';
import { resendVerification, verifyEmail } from '@/api/generated';
import { FormError, SecondaryLink, useSubmit } from '@/components/account/form';
import { Field } from '@/components/onboarding/controls';
import { PrimaryButton } from '@/components/onboarding/step-shell';
import { closeSheet, Sheet } from '@/components/sheet';

const RESEND_WAIT_S = 30;

/** Verificar el correo con el código de 6 cifras. Se puede dejar para más tarde. */
export default function VerifyEmailSheet() {
  const { user, setUser } = useSession();
  const [code, setCode] = useState('');
  const [wait, setWait] = useState(RESEND_WAIT_S);
  const [notice, setNotice] = useState<string | null>(null);
  const { busy, error, run } = useSubmit();

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const submit = () =>
    run(async () => {
      setUser(await verifyEmail({ code }));
      closeSheet();
    });

  const resend = () =>
    run(async () => {
      await resendVerification();
      setWait(RESEND_WAIT_S);
      setNotice('Te hemos enviado un código nuevo.');
    });

  return (
    <Sheet
      title="Revisa tu correo"
      subtitle={`Te hemos enviado un código de 6 cifras${user ? ` a ${user.email}` : ''}. Si no lo ves, mira en spam.`}
      footer={
        <>
          {error ? <FormError message={error} /> : <FormError message={notice} info />}
          <PrimaryButton
            label={busy ? 'Un momento…' : 'Confirmar'}
            onPress={submit}
            disabled={busy || code.length !== 6}
          />
          <SecondaryLink label="Más tarde" onPress={closeSheet} />
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
          onSubmitEditing={submit}
        />
        <SecondaryLink
          label={wait > 0 ? `Reenviar el código en ${wait} s` : 'Reenviar el código'}
          onPress={() => wait <= 0 && resend()}
        />
      </View>
    </Sheet>
  );
}
