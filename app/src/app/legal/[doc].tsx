import { useLocalSearchParams } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { Colors, Fonts } from '@/constants/theme';
import { TextLink } from '@/components/ui';
import { CONTACT_EMAIL, isLegalDocId, LEGAL_DOCS } from '@/legal/content';

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
            ¿Algo más?
          </Text>
          <TextLink label={`Escríbenos a ${CONTACT_EMAIL}`} onPress={() => void Linking.openURL(`mailto:${CONTACT_EMAIL}`)} />
        </View>
      ) : null}
      <Text style={styles.updated}>Última actualización: {content.updated}</Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  heading: { fontFamily: Fonts.bodySemiBold, fontSize: 16, lineHeight: 22, color: Colors.text },
  body: { fontFamily: Fonts.body, fontSize: 15, lineHeight: 22, color: Colors.textSecondary },
  updated: { fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 17, color: Colors.textTertiary },
});
