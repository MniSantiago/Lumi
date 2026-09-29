import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useSession } from '@/account/session';
import { resendVerification, verifyEmail } from '@/api/generated';
import { FormError, SecondaryLink, useSubmit } from '@/components/account/form';
import { Field } from '@/components/onboarding/controls';
import { PrimaryButton } from '@/components/onboarding/step-shell';
import { closeSheet, Sheet } from '@/components/sheet';
import { tr } from '@/i18n';

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
      setNotice(
        tr({
          es: 'Te hemos enviado un código nuevo.',
          en: 'We sent you a new code.',
          zh: '我们已发送新的验证码。',
          hi: 'हमने तुम्हें नया कोड भेजा है।',
          fr: 'On t’a envoyé un nouveau code.',
        }),
      );
    });

  return (
    <Sheet
      title={tr({
        es: tr({
          es: 'Revisa tu correo',
          en: 'Check your email',
          zh: '查看你的邮箱',
          hi: 'अपना ईमेल देखो',
          fr: 'Vérifie tes e-mails',
        }),
        en: 'Check your email',
        zh: '查看你的邮箱',
        hi: 'अपना ईमेल देखो',
        fr: 'Vérifie tes e-mails',
      })}
      subtitle={
        user
          ? tr({
              es: `Te hemos enviado un código de 6 cifras a ${user.email}. Si no lo ves, mira en spam.`,
              en: `We sent a 6-digit code to ${user.email}. If you don’t see it, check spam.`,
              zh: `我们已向 ${user.email} 发送了 6 位验证码。如果没看到，请查看垃圾邮件。`,
              hi: `हमने ${user.email} पर 6 अंकों का कोड भेजा है। न दिखे तो स्पैम देखो।`,
              fr: `On t’a envoyé un code à 6 chiffres à ${user.email}. Si tu ne le vois pas, regarde dans les spams.`,
            })
          : tr({
              es: 'Te hemos enviado un código de 6 cifras. Si no lo ves, mira en spam.',
              en: 'We sent you a 6-digit code. If you don’t see it, check spam.',
              zh: '我们已发送 6 位验证码。如果没看到，请查看垃圾邮件。',
              hi: 'हमने तुम्हें 6 अंकों का कोड भेजा है। न दिखे तो स्पैम देखो।',
              fr: 'On t’a envoyé un code à 6 chiffres. Si tu ne le vois pas, regarde dans les spams.',
            })
      }
      footer={
        <>
          {error ? <FormError message={error} /> : <FormError message={notice} info />}
          <PrimaryButton
            label={
              busy
                ? tr({ es: 'Un momento…', en: 'One moment…', zh: '请稍候……', hi: 'एक पल…', fr: 'Un instant…' })
                : tr({ es: 'Confirmar', en: 'Confirm', zh: '确认', hi: 'पुष्टि करो', fr: 'Confirmer' })
            }
            onPress={submit}
            disabled={busy || code.length !== 6}
          />
          <SecondaryLink
            label={tr({
              es: tr({ es: 'Más tarde', en: 'Later', zh: '稍后', hi: 'बाद में', fr: 'Plus tard' }),
              en: 'Later',
              zh: '稍后',
              hi: 'बाद में',
              fr: 'Plus tard',
            })}
            onPress={closeSheet}
          />
        </>
      }>
      <View style={{ gap: 16 }}>
        <Field
          label={tr({
            es: tr({ es: 'Código', en: 'Code', zh: '验证码', hi: 'कोड', fr: 'Code' }),
            en: 'Code',
            zh: '验证码',
            hi: 'कोड',
            fr: 'Code',
          })}
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
          label={
            wait > 0
              ? tr({
                  es: `Reenviar el código en ${wait} s`,
                  en: `Resend the code in ${wait}s`,
                  zh: `${wait} 秒后可重新发送`,
                  hi: `${wait} सेकंड में कोड फिर भेजो`,
                  fr: `Renvoyer le code dans ${wait} s`,
                })
              : tr({
                  es: 'Reenviar el código',
                  en: 'Resend the code',
                  zh: '重新发送验证码',
                  hi: 'कोड फिर भेजो',
                  fr: 'Renvoyer le code',
                })
          }
          onPress={() => wait <= 0 && resend()}
        />
      </View>
    </Sheet>
  );
}
