import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Field } from '@/components/onboarding/controls';
import { PrimaryButton } from '@/components/onboarding/step-shell';
import { closeSheet, Sheet } from '@/components/sheet';
import { useLumi } from '@/lumi/store';

/** Cambiar tu nombre y el de Lumi desde Ajustes. Se guarda al pulsar "Guardar". */
export default function NamesSheet() {
  const { settings, updateSettings } = useLumi();
  const [userName, setUserName] = useState(settings.userName);
  const [lumiName, setLumiName] = useState(settings.lumiName);
  const lumiNameRef = useRef<TextInput>(null);

  const changed = userName.trim() !== settings.userName || (lumiName.trim() || 'Lumi') !== settings.lumiName;

  const save = () => {
    updateSettings({ userName: userName.trim(), lumiName: lumiName.trim() || 'Lumi' });
    closeSheet();
  };

  return (
    <Sheet
      title="Nombres"
      subtitle="Cómo te saluda y cómo se llama tu lucecita."
      footer={<PrimaryButton label="Guardar" onPress={save} disabled={!changed} />}>
      <View style={{ gap: 16 }}>
        <Field
          label="Tu nombre"
          placeholder="Tu nombre"
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => lumiNameRef.current?.focus()}
        />
        <Field
          ref={lumiNameRef}
          label="Nombre de tu lucecita"
          placeholder="Lumi"
          value={lumiName}
          onChangeText={setLumiName}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={() => changed && save()}
        />
      </View>
    </Sheet>
  );
}
