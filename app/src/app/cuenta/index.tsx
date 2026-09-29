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
import { tr } from '@/i18n';

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
      title={
        signup
          ? tr({
              es: 'Guarda tu progreso',
              en: 'Save your progress',
              zh: '保存你的进度',
              hi: 'अपनी प्रगति सहेजो',
              fr: 'Sauvegarde ta progression',
            })
          : tr({
              es: 'Entra en tu cuenta',
              en: 'Sign in to your account',
              zh: '登录你的账户',
              hi: 'अपने खाते में जाओ',
              fr: 'Connecte-toi à ton compte',
            })
      }
      subtitle={
        signup
          ? tr({
              es: `Con una cuenta, ${settings.lumiName} te encuentra si cambias de iPhone. Es opcional: todo funciona igual sin ella.`,
              en: `With an account, ${settings.lumiName} finds you if you change iPhones. It’s optional: everything works the same without it.`,
              zh: `有了账户，换 iPhone 时${settings.lumiName}也能找到你。账户是可选的：没有它一切照常。`,
              hi: `खाते के साथ, iPhone बदलने पर भी ${settings.lumiName} तुम्हें ढूँढ लेगी। यह वैकल्पिक है: इसके बिना भी सब वैसे ही चलता है।`,
              fr: `Avec un compte, ${settings.lumiName} te retrouve si tu changes d’iPhone. C’est facultatif : tout marche pareil sans.`,
            })
          : tr({
              es: `Para recuperar a ${settings.lumiName} y todo lo que ha traído.`,
              en: `To get back ${settings.lumiName} and everything she’s brought.`,
              zh: `找回${settings.lumiName}和她带回的一切。`,
              hi: `${settings.lumiName} और उसकी लाई हर चीज़ वापस पाने के लिए।`,
              fr: `Pour retrouver ${settings.lumiName} et tout ce qu’elle a rapporté.`,
            })
      }
      footer={
        <>
          <FormError message={error} />
          <PrimaryButton
            label={
              busy
                ? tr({ es: 'Un momento…', en: 'One moment…', zh: '请稍候……', hi: 'एक पल…', fr: 'Un instant…' })
                : signup
                  ? tr({
                      es: 'Crear cuenta',
                      en: 'Create account',
                      zh: '创建账户',
                      hi: 'खाता बनाओ',
                      fr: 'Créer un compte',
                    })
                  : tr({ es: 'Entrar', en: 'Sign in', zh: '登录', hi: 'साइन इन', fr: 'Se connecter' })
            }
            onPress={submit}
            disabled={busy || !email.trim() || password.length < (signup ? 8 : 1)}
          />
          <SecondaryLink
            label={
              signup
                ? tr({
                    es: 'Ya tengo cuenta',
                    en: 'I already have an account',
                    zh: '我已有账户',
                    hi: 'मेरा खाता पहले से है',
                    fr: 'J’ai déjà un compte',
                  })
                : tr({
                    es: 'Crear una cuenta nueva',
                    en: 'Create a new account',
                    zh: '创建新账户',
                    hi: 'नया खाता बनाओ',
                    fr: 'Créer un nouveau compte',
                  })
            }
            onPress={switchMode}
          />
        </>
      }>
      <View style={{ gap: 16 }}>
        <Field
          label={tr({
            es: 'Correo',
            en: 'Email',
            zh: '邮箱',
            hi: 'ईमेल',
            fr: 'E-mail',
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
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <Field
          ref={passwordRef}
          label={tr({
            es: 'Contraseña',
            en: 'Password',
            zh: '密码',
            hi: 'पासवर्ड',
            fr: 'Mot de passe',
          })}
          placeholder={
            signup
              ? tr({
                  es: 'Al menos 8 caracteres',
                  en: 'At least 8 characters',
                  zh: '至少 8 个字符',
                  hi: 'कम से कम 8 अक्षर',
                  fr: 'Au moins 8 caractères',
                })
              : tr({
                  es: 'Tu contraseña',
                  en: 'Your password',
                  zh: '你的密码',
                  hi: 'तुम्हारा पासवर्ड',
                  fr: 'Ton mot de passe',
                })
          }
          value={password}
          onChangeText={setPassword}
          {...passwordInput}
          autoComplete={signup ? 'new-password' : 'current-password'}
          textContentType={signup ? 'newPassword' : 'password'}
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {signup ? null : (
          <SecondaryLink
            label={tr({
              es: '¿Se te olvidó la contraseña?',
              en: 'Forgot your password?',
              zh: '忘记密码了？',
              hi: 'पासवर्ड भूल गए?',
              fr: 'Mot de passe oublié ?',
            })}
            onPress={() => router.push('/cuenta/olvido')}
          />
        )}
      </View>
      {signup ? (
        <Text style={styles.legal}>
          {tr({
            es: 'Al crearla aceptas los Términos y la Política de privacidad. Tus datos de uso nunca salen de tu iPhone.',
            en: 'By creating it you accept the Terms and the Privacy Policy. Your usage data never leaves your iPhone.',
            zh: '创建账户即表示你同意条款和隐私政策。你的使用数据永远不会离开你的 iPhone。',
            hi: 'इसे बनाकर तुम शर्तें और गोपनीयता नीति स्वीकार करते हो। तुम्हारा उपयोग डेटा कभी तुम्हारे iPhone से बाहर नहीं जाता।',
            fr: 'En le créant, tu acceptes les Conditions et la Politique de confidentialité. Tes données d’usage ne quittent jamais ton iPhone.',
          })}
        </Text>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  legal: { fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 17, color: Colors.textTertiary, paddingHorizontal: 6 },
});
