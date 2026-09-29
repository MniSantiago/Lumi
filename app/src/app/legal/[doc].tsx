import { useLocalSearchParams } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { Colors, Fonts } from '@/constants/theme';
import { TextLink } from '@/components/ui';
import { CONTACT_EMAIL, isLegalDocId, LEGAL_DOCS } from '@/legal/content';
import { tr } from '@/i18n';

/** Privacidad, Términos y Ayuda, en una hoja que se abre desde el paywall y Ajustes. */
export default function LegalSheet() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const id = isLegalDocId(doc) ? doc : 'privacidad';
  const content = LEGAL_DOCS[id];

  return (
    <Sheet title={content.title} subtitle={content.intro}>
      {content.sections.map((s) => (
        <View key={s.heading} style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">
            {s.heading}
          </Text>
          {s.body.map((p) => (
            <Text key={p} style={styles.body}>
              {p}
            </Text>
          ))}
        </View>
      ))}
      {id === 'ayuda' && CONTACT_EMAIL ? (
        <View style={styles.section}>
          <Text style={styles.heading} accessibilityRole="header">
            {tr({ es: '¿Algo más?', en: 'Anything else?', zh: '还有别的问题？', hi: 'कुछ और?', fr: 'Autre chose ?' })}
          </Text>
          <TextLink
            label={tr({
              es: `Escríbenos a ${CONTACT_EMAIL}`,
              en: `Write to us at ${CONTACT_EMAIL}`,
              zh: `写信给我们：${CONTACT_EMAIL}`,
              hi: `हमें लिखो: ${CONTACT_EMAIL}`,
              fr: `Écris-nous à ${CONTACT_EMAIL}`,
            })}
            onPress={() => void Linking.openURL(`mailto:${CONTACT_EMAIL}`)}
          />
        </View>
      ) : null}
      <Text style={styles.updated}>
        {tr({
          es: 'Última actualización',
          en: 'Last updated',
          zh: '最后更新',
          hi: 'आख़िरी अपडेट',
          fr: 'Dernière mise à jour',
        })}
        : {content.updated}
      </Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  heading: { fontFamily: Fonts.bodySemiBold, fontSize: 16, lineHeight: 22, color: Colors.text },
  body: { fontFamily: Fonts.body, fontSize: 15, lineHeight: 22, color: Colors.textSecondary },
  updated: { fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 17, color: Colors.textTertiary },
});
