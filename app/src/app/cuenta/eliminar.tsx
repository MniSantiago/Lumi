import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/account/session';
import { deleteAccount } from '@/api/generated';
import { FormError, passwordInput, useSubmit } from '@/components/account/form';
import { Field } from '@/components/onboarding/controls';
import { closeSheet, Sheet } from '@/components/sheet';
import { WideButton } from '@/components/paywall/paywall-parts';
import { Colors, Fonts } from '@/constants/theme';
import { useLumi } from '@/lumi/store';
import { tr } from '@/i18n';

/**
 * Eliminar la cuenta desde la app, como exige Apple (guía 5.1.1(v)).
 * Borra la cuenta del servidor; Lumi y su progreso en este iPhone se quedan.
 */
export default function DeleteAccountSheet() {
  const { settings } = useLumi();
  const { user, forget } = useSession();
  const email = user ? ` (${user.email})` : '';
  const [password, setPassword] = useState('');
  const { busy, error, run } = useSubmit();

  const confirm = () =>
    Alert.alert(
      tr({
        es: '¿Eliminar tu cuenta?',
        en: 'Delete your account?',
        zh: '删除你的账户？',
        hi: 'अपना खाता हटाएँ?',
        fr: 'Supprimer ton compte ?',
      }),
      tr({
        es: 'No se puede deshacer.',
        en: 'This can’t be undone.',
        zh: '此操作无法撤销。',
        hi: 'इसे वापस नहीं किया जा सकता।',
        fr: 'C’est irréversible.',
      }),
      [
        { text: tr({ es: 'Cancelar', en: 'Cancel', zh: '取消', hi: 'रद्द करो', fr: 'Annuler' }), style: 'cancel' },
        {
          text: tr({ es: 'Eliminar', en: 'Delete', zh: '删除', hi: 'हटाओ', fr: 'Supprimer' }),
          style: 'destructive',
          onPress: () =>
            run(async () => {
              await deleteAccount({ password });
              await forget();
              closeSheet();
            }),
        },
      ],
    );

  return (
    <Sheet
      title={tr({
        es: tr({
          es: 'Eliminar la cuenta',
          en: 'Delete account',
          zh: '删除账户',
          hi: 'खाता हटाओ',
          fr: 'Supprimer le compte',
        }),
        en: 'Delete account',
        zh: '删除账户',
        hi: 'खाता हटाओ',
        fr: 'Supprimer le compte',
      })}
      subtitle={tr({
        es: `Borramos tu cuenta${email} y todo lo que guarda en nuestro servidor. ${settings.lumiName} y su progreso en este iPhone se quedan contigo.`,
        en: `We’ll delete your account${email} and everything it stores on our server. ${settings.lumiName} and her progress on this iPhone stay with you.`,
        zh: `我们会删除你的账户${email}以及它在我们服务器上保存的一切。${settings.lumiName}和她在这台 iPhone 上的进度会留给你。`,
        hi: `हम तुम्हारा खाता${email} और हमारे सर्वर पर उसका सब कुछ मिटा देंगे। ${settings.lumiName} और इस iPhone पर उसकी प्रगति तुम्हारे पास रहेगी।`,
        fr: `Nous supprimons ton compte${email} et tout ce qu’il garde sur notre serveur. ${settings.lumiName} et sa progression sur cet iPhone restent avec toi.`,
      })}
      footer={
        <>
          <FormError message={error} />
          <WideButton
            label={tr({
              es: tr({
                es: 'Eliminar mi cuenta',
                en: 'Delete my account',
                zh: '删除我的账户',
                hi: 'मेरा खाता हटाओ',
                fr: 'Supprimer mon compte',
              }),
              en: 'Delete my account',
              zh: '删除我的账户',
              hi: 'मेरा खाता हटाओ',
              fr: 'Supprimer mon compte',
            })}
            ghost
            onPress={confirm}
            loading={busy}
            disabled={!password}
          />
        </>
      }>
      <View style={{ gap: 16 }}>
        <Field
          label={tr({
            es: tr({
              es: 'Tu contraseña, para confirmar',
              en: 'Your password, to confirm',
              zh: '输入密码以确认',
              hi: 'पुष्टि के लिए तुम्हारा पासवर्ड',
              fr: 'Ton mot de passe, pour confirmer',
            }),
            en: 'Your password, to confirm',
            zh: '输入密码以确认',
            hi: 'पुष्टि के लिए तुम्हारा पासवर्ड',
            fr: 'Ton mot de passe, pour confirmer',
          })}
          value={password}
          onChangeText={setPassword}
          {...passwordInput}
          autoComplete="current-password"
          textContentType="password"
        />
        <Text style={styles.note}>
          {tr({
            es: 'Si tienes Lumi Plus, eliminar la cuenta no cancela la suscripción: se gestiona en Ajustes de tu iPhone › tu nombre › Suscripciones.',
            en: 'If you have Lumi Plus, deleting your account doesn’t cancel the subscription: manage it in your iPhone’s Settings › your name › Subscriptions.',
            zh: '如果你有 Lumi Plus，删除账户不会取消订阅：请在 iPhone 的设置 › 你的名字 › 订阅中管理。',
            hi: 'अगर तुम्हारे पास Lumi Plus है, तो खाता हटाने से सदस्यता रद्द नहीं होती: इसे iPhone की सेटिंग्स › तुम्हारा नाम › सदस्यताएँ में संभालो।',
            fr: 'Si tu as Lumi Plus, supprimer le compte n’annule pas l’abonnement : il se gère dans Réglages de ton iPhone › ton nom › Abonnements.',
          })}
        </Text>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  note: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.textTertiary, paddingHorizontal: 6 },
});
