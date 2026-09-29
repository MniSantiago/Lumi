import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { useSession } from '@/account/session';
import { changePassword } from '@/api/generated';
import { FormError, passwordInput, SecondaryLink, useSubmit } from '@/components/account/form';
import { Field } from '@/components/onboarding/controls';
import { PrimaryButton } from '@/components/onboarding/step-shell';
import { closeSheet, Sheet } from '@/components/sheet';
import { tr } from '@/i18n';

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
      title={tr({
        es: 'Cambiar la contraseña',
        en: 'Change password',
        zh: '修改密码',
        hi: 'पासवर्ड बदलो',
        fr: 'Changer le mot de passe',
      })}
      subtitle={tr({
        es: 'Al cambiarla, cerramos la sesión en tus otros dispositivos.',
        en: 'When you change it, we sign you out on your other devices.',
        zh: '修改后，你的其他设备会退出登录。',
        hi: 'बदलने पर, हम तुम्हारे दूसरे डिवाइस से साइन आउट कर देंगे।',
        fr: 'En le changeant, on te déconnecte de tes autres appareils.',
      })}
      footer={
        <>
          <FormError message={error} />
          <PrimaryButton
            label={
              busy
                ? tr({ es: 'Un momento…', en: 'One moment…', zh: '请稍候……', hi: 'एक पल…', fr: 'Un instant…' })
                : tr({ es: 'Guardar', en: 'Save', zh: '保存', hi: 'सहेजो', fr: 'Enregistrer' })
            }
            onPress={submit}
            disabled={busy || !current || next.length < 8}
          />
        </>
      }>
      <View style={{ gap: 16 }}>
        <Field
          label={tr({
            es: 'Contraseña actual',
            en: 'Current password',
            zh: '当前密码',
            hi: 'मौजूदा पासवर्ड',
            fr: 'Mot de passe actuel',
          })}
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
          value={next}
          onChangeText={setNext}
          {...passwordInput}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <SecondaryLink
          label={tr({
            es: 'No la recuerdo',
            en: 'I don’t remember it',
            zh: '我不记得了',
            hi: 'मुझे याद नहीं',
            fr: 'Je ne m’en souviens pas',
          })}
          onPress={() => router.replace('/cuenta/olvido')}
        />
      </View>
    </Sheet>
  );
}
