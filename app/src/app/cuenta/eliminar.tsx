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

/**
 * Eliminar la cuenta desde la app, como exige Apple (guía 5.1.1(v)).
 * Borra la cuenta del servidor; Lumi y su progreso en este iPhone se quedan.
 */
export default function DeleteAccountSheet() {
  const { settings } = useLumi();
  const { user, forget } = useSession();
  const [password, setPassword] = useState('');
  const { busy, error, run } = useSubmit();

  const confirm = () =>
    Alert.alert('¿Eliminar tu cuenta?', 'No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          run(async () => {
            await deleteAccount({ password });
            await forget();
            closeSheet();
          }),
      },
    ]);

  return (
    <Sheet
      title="Eliminar la cuenta"
      subtitle={`Borramos tu cuenta${user ? ` (${user.email})` : ''} y todo lo que guarda en nuestro servidor. ${settings.lumiName} y su progreso en este iPhone se quedan contigo.`}
      footer={
        <>
          <FormError message={error} />
          <WideButton label="Eliminar mi cuenta" ghost onPress={confirm} loading={busy} disabled={!password} />
        </>
      }>
      <View style={{ gap: 16 }}>
        <Field
          label="Tu contraseña, para confirmar"
          value={password}
          onChangeText={setPassword}
          {...passwordInput}
          autoComplete="current-password"
          textContentType="password"
        />
        <Text style={styles.note}>
          Si tienes Lumi Plus, eliminar la cuenta no cancela la suscripción: se gestiona en Ajustes de tu iPhone ›
          tu nombre › Suscripciones.
        </Text>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  note: { fontFamily: Fonts.body, fontSize: 13, lineHeight: 18, color: Colors.textTertiary, paddingHorizontal: 6 },
});
