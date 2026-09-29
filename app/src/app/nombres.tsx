import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

import { useSession } from '@/account/session';
import { updateMe } from '@/api/generated';
import { Field } from '@/components/onboarding/controls';
import { PrimaryButton } from '@/components/onboarding/step-shell';
import { closeSheet, Sheet } from '@/components/sheet';
import { useLumi } from '@/lumi/store';
import { tr } from '@/i18n';

/** Cambiar tu nombre y el de Lumi desde Ajustes. Se guarda al pulsar "Guardar". */
export default function NamesSheet() {
  const { settings, updateSettings } = useLumi();
  const { user, setUser } = useSession();
  const [userName, setUserName] = useState(settings.userName);
  const [lumiName, setLumiName] = useState(settings.lumiName);
  const lumiNameRef = useRef<TextInput>(null);

  const changed = userName.trim() !== settings.userName || (lumiName.trim() || 'Lumi') !== settings.lumiName;

  const save = () => {
    const patch = { userName: userName.trim(), lumiName: lumiName.trim() || 'Lumi' };
    updateSettings(patch);
    // Con cuenta, también en el servidor. Si falla (sin conexión), el cambio local se queda igual.
    if (user) updateMe({ name: patch.userName, lumiName: patch.lumiName }).then(setUser, () => {});
    closeSheet();
  };

  return (
    <Sheet
      title={tr({
        es: 'Nombres',
        en: 'Names',
        zh: '名字',
        hi: 'नाम',
        fr: 'Prénoms',
      })}
      subtitle={tr({
        es: 'Cómo te saluda y cómo se llama tu lucecita.',
        en: 'How she greets you and what your little light is called.',
        zh: '她怎么称呼你，你的小光叫什么。',
        hi: 'वो तुम्हें कैसे बुलाती है और तुम्हारी नन्ही रोशनी का नाम क्या है।',
        fr: 'Comment elle te salue et comment s’appelle ta petite lumière.',
      })}
      footer={
        <PrimaryButton
          label={tr({
            es: 'Guardar',
            en: 'Save',
            zh: '保存',
            hi: 'सहेजो',
            fr: 'Enregistrer',
          })}
          onPress={save}
          disabled={!changed}
        />
      }>
      <View style={{ gap: 16 }}>
        <Field
          label={tr({
            es: 'Tu nombre',
            en: 'Your name',
            zh: '你的名字',
            hi: 'तुम्हारा नाम',
            fr: 'Ton prénom',
          })}
          placeholder={tr({
            es: 'Tu nombre',
            en: 'Your name',
            zh: '你的名字',
            hi: 'तुम्हारा नाम',
            fr: 'Ton prénom',
          })}
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
          label={tr({
            es: 'Nombre de tu lucecita',
            en: 'Your little light’s name',
            zh: '你的小光的名字',
            hi: 'तुम्हारी नन्ही रोशनी का नाम',
            fr: 'Nom de ta petite lumière',
          })}
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
