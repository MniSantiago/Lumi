import type { ErrorBoundaryProps } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { tr } from '@/i18n';
import { LUMI_STATES } from '@/lumi/states';

/**
 * Si una pantalla falla, en vez de una pantalla en blanco: Lumi dormida y un
 * botón para volver a intentarlo. El progreso está guardado, se dice.
 * Usa la fuente del sistema por si el fallo fue al cargar las de la app.
 */
export function CrashScreen({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.body}>
        <Image
          source={LUMI_STATES.apagadita.image}
          style={styles.lumi}
          contentFit="contain"
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.title} accessibilityRole="header">
          {tr({
            es: 'Ups, Lumi se ha tropezado',
            en: 'Oops, Lumi tripped',
            zh: '哎呀，Lumi 绊了一跤',
            hi: 'उफ़, Lumi लड़खड़ा गई',
            fr: 'Oups, Lumi a trébuché',
          })}
        </Text>
        <Text style={styles.text}>
          {tr({
            es: 'Algo no ha ido bien en esta pantalla. Tu progreso está a salvo.',
            en: 'Something went wrong on this screen. Your progress is safe.',
            zh: '这个页面出了点问题。你的进度是安全的。',
            hi: 'इस स्क्रीन पर कुछ गड़बड़ हो गई। तुम्हारी प्रगति सुरक्षित है।',
            fr: 'Un problème est survenu sur cet écran. Ta progression est en sécurité.',
          })}
        </Text>
        {__DEV__ ? <Text style={styles.dev}>{error.message}</Text> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => void retry()}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}>
        <Text style={styles.buttonText}>
          {tr({ es: 'Volver a intentarlo', en: 'Try again', zh: '再试一次', hi: 'फिर कोशिश करो', fr: 'Réessayer' })}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.nightDeep, padding: 24 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  lumi: { width: 150, height: 150, opacity: 0.8, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  text: { fontSize: 15, lineHeight: 21, color: Colors.textSecondary, textAlign: 'center', maxWidth: 300 },
  dev: { fontSize: 12, color: Colors.peach, textAlign: 'center', marginTop: 8 },
  button: {
    minHeight: 54,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: Colors.onAmber },
});
