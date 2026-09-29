import { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { useSession } from '@/account/session';
import { forgotPassword, resetPassword } from '@/api/generated';
import { emailInput, FormError, passwordInput, SecondaryLink, useSubmit } from '@/components/account/form';
import { Field } from '@/components/onboarding/controls';
import { PrimaryButton } from '@/components/onboarding/step-shell';
import { closeSheet, Sheet } from '@/components/sheet';
import { tr } from '@/i18n';

/**
 * Recuperar la contraseña en dos pasos, sin salir de la app:
 * 1. el correo, al que llega un código de 6 cifras;
 * 2. el código y la contraseña nueva. Al terminar, entra directamente.
 */
const RESEND_WAIT_S = 30;

export default function ForgotPasswordSheet() {
  const { signIn } = useSession();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>(null);
  const { busy, error, setError, run } = useSubmit();
  const [wait, setWait] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendCode = () =>
    run(async () => {
      await forgotPassword({ email });
      setStep('code');
      setWait(RESEND_WAIT_S);
    });

  const resend = () =>
    run(async () => {
      await forgotPassword({ email });
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

  const reset = () =>
    run(async () => {
      await resetPassword({ email, code, password });
      await signIn(email, password);
      closeSheet();
    });

  if (step === 'email') {
    return (
      <Sheet
        title={tr({
          es: '¿Se te olvidó?',
          en: 'Forgot it?',
          zh: '忘记了？',
          hi: 'भूल गए?',
          fr: 'Oublié ?',
        })}
        subtitle={tr({
          es: 'No pasa nada, a Lumi también se le olvidan cosas. Te enviamos un código para elegir una contraseña nueva.',
          en: 'No worries, Lumi forgets things too. We’ll send you a code to choose a new password.',
          zh: '没关系，Lumi 也会忘事。我们会发一个验证码，让你设置新密码。',
          hi: 'कोई बात नहीं, Lumi भी चीज़ें भूल जाती है। हम तुम्हें नया पासवर्ड चुनने के लिए एक कोड भेजेंगे।',
          fr: 'Pas de souci, Lumi aussi oublie des choses. On t’envoie un code pour choisir un nouveau mot de passe.',
        })}
        footer={
          <>
            <FormError message={error} />
            <PrimaryButton
              label={
                busy
                  ? tr({ es: 'Un momento…', en: 'One moment…', zh: '请稍候……', hi: 'एक पल…', fr: 'Un instant…' })
                  : tr({
                      es: 'Enviar código',
                      en: 'Send code',
                      zh: '发送验证码',
                      hi: 'कोड भेजो',
                      fr: 'Envoyer le code',
                    })
              }
              onPress={sendCode}
              disabled={busy || !email.trim()}
            />
          </>
        }>
        <Field
          label={tr({
            es: 'Correo de tu cuenta',
            en: 'Your account’s email',
            zh: '你的账户邮箱',
            hi: 'तुम्हारे खाते का ईमेल',
            fr: 'E-mail de ton compte',
          })}
          placeholder={tr({
            es: 'tu@correo.com',
            en: 'you@email.com',
            zh: 'you@email.com',
            hi: 'you@email.com',
            fr: 'toi@email.com',
          })}
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
      title={tr({
        es: 'Elige una contraseña nueva',
        en: 'Choose a new password',
        zh: '设置新密码',
        hi: 'नया पासवर्ड चुनो',
        fr: 'Choisis un nouveau mot de passe',
      })}
      subtitle={tr({
        es: `Si ${email.trim()} tiene cuenta, le acaba de llegar un código de 6 cifras. Caduca en 15 minutos.`,
        en: `If ${email.trim()} has an account, a 6-digit code just arrived there. It expires in 15 minutes.`,
        zh: `如果 ${email.trim()} 有账户，刚刚已收到一个 6 位验证码。15 分钟内有效。`,
        hi: `अगर ${email.trim()} का खाता है, तो उस पर अभी 6 अंकों का कोड आया है। यह 15 मिनट में ख़त्म हो जाएगा।`,
        fr: `Si ${email.trim()} a un compte, un code à 6 chiffres vient d’y arriver. Il expire dans 15 minutes.`,
      })}
      footer={
        <>
          {error ? <FormError message={error} /> : <FormError message={notice} info />}
          <PrimaryButton
            label={
              busy
                ? tr({ es: 'Un momento…', en: 'One moment…', zh: '请稍候……', hi: 'एक पल…', fr: 'Un instant…' })
                : tr({
                    es: 'Cambiar y entrar',
                    en: 'Change and sign in',
                    zh: '修改并登录',
                    hi: 'बदलो और साइन इन करो',
                    fr: 'Changer et se connecter',
                  })
            }
            onPress={reset}
            disabled={busy || code.length !== 6 || password.length < 8}
          />
          <SecondaryLink
            label={tr({
              es: 'Usar otro correo',
              en: 'Use another email',
              zh: '使用其他邮箱',
              hi: 'दूसरा ईमेल इस्तेमाल करो',
              fr: 'Utiliser un autre e-mail',
            })}
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
          label={tr({
            es: 'Código',
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
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <Field
          ref={passwordRef}
          label={tr({
            es: 'Contraseña nueva',
            en: 'New password',
            zh: '新密码',
            hi: 'नया पासवर्ड',
            fr: 'Nouveau mot de passe',
          })}
          placeholder={tr({
            es: 'Al menos 8 caracteres',
            en: 'At least 8 characters',
            zh: '至少 8 个字符',
            hi: 'कम से कम 8 अक्षर',
            fr: 'Au moins 8 caractères',
          })}
          value={password}
          onChangeText={setPassword}
          {...passwordInput}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={reset}
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
