import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { Fraunces_600SemiBold, Fraunces_700Bold, Fraunces_800ExtraBold, useFonts } from '@expo-google-fonts/fraunces';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { LumiProvider, useLumi } from '@/lumi/store';

SplashScreen.preventAutoHideAsync();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: Colors.night, card: Colors.nightDeep, primary: Colors.amber },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Fraunces_800ExtraBold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  if (!loaded && !error) return null;

  return (
    <ThemeProvider value={navTheme}>
      <LumiProvider>
        <StatusBar style="light" />
        <RootStack />
      </LumiProvider>
    </ThemeProvider>
  );
}

/**
 * Onboarding hasta que el usuario lo completa; después, las pestañas.
 * El escudo es una pantalla completa por encima de todo (en iOS real lo
 * pinta ShieldConfiguration; aquí es su maqueta navegable).
 */
function RootStack() {
  const { ready, settings } = useLumi();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Esperamos a leer los ajustes guardados para no enseñar el onboarding un instante.
  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.night } }}>
      <Stack.Protected guard={!settings.onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={settings.onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="escudo" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  );
}
