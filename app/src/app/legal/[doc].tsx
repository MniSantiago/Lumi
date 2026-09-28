import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { Colors, Fonts } from '@/constants/theme';
import { isLegalDocId, LEGAL_DOCS } from '@/legal/content';

/** Privacidad y Términos, en una hoja que se abre desde el paywall y Ajustes. */
export default function LegalSheet() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const content = LEGAL_DOCS[isLegalDocId(doc) ? doc : 'privacidad'];

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
