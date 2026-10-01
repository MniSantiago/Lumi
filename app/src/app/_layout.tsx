import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { Fraunces_600SemiBold, Fraunces_700Bold, Fraunces_800ExtraBold, useFonts } from '@expo-google-fonts/fraunces';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { SessionProvider } from '@/account/session';
import { CrashScreen } from '@/components/crash-screen';
import { ProgressSync } from '@/account/sync';
import { Colors } from '@/constants/theme';
import { GameProvider } from '@/game/store';
import { LumiProvider, useLumi } from '@/lumi/store';
import { useNotificationRouting, useBedtimeReminder, useWeeklySummaryReminder } from '@/notifications';
import { ParentalProvider } from '@/parental/store';
import { PlusSync } from '@/purchases/plus-sync';
import { TourProvider } from '@/tour/store';

SplashScreen.preventAutoHideAsync();

/** Si algo falla dentro de la app, Lampi dormida en vez de una pantalla en blanco. */
export const ErrorBoundary = CrashScreen;

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
        <SessionProvider>
          <GameProvider>
            <TourProvider>
              <ParentalProvider>
                <StatusBar style="light" />
                <RootStack />
                <ProgressSync />
                <PlusSync />
              </ParentalProvider>
            </TourProvider>
          </GameProvider>
        </SessionProvider>
      </LumiProvider>
    </ThemeProvider>
  );
}

/**
 * Onboarding hasta que el usuario lo completa; después, las pestañas.
 * Por encima de todo, a pantalla completa: el escudo (en iOS real lo pinta
 * ShieldConfiguration; aquí es su maqueta navegable) y la postal nocturna.
 * Lampi Plus (el paywall) y las hojas de Ajustes son modales que se cierran deslizando.
 */
function RootStack() {
  const { ready, settings } = useLumi();
  useNotificationRouting();
  useWeeklySummaryReminder();
  useBedtimeReminder();

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
        <Stack.Screen name="postal" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
        <Stack.Screen name="plus" options={{ presentation: 'modal' }} />
        <Stack.Screen name="apps" options={{ presentation: 'modal' }} />
        <Stack.Screen name="nombres" options={{ presentation: 'modal' }} />
        <Stack.Screen name="pin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="chispas" options={{ presentation: 'modal' }} />
        <Stack.Screen name="cuenta/contrasena" options={{ presentation: 'modal' }} />
        <Stack.Screen name="cuenta/eliminar" options={{ presentation: 'modal' }} />
        <Stack.Screen name="resumen" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      </Stack.Protected>
      {/*
        Siempre disponibles: también desde el onboarding (recuperar a Lampi en un iPhone nuevo, leer la privacidad).
        Al final: la primera pantalla disponible es la que se abre al cambiar el guard, y tiene que ser el onboarding o las pestañas.
      */}
      <Stack.Screen name="legal/[doc]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="cuenta/index" options={{ presentation: 'modal' }} />
      <Stack.Screen name="cuenta/verificar" options={{ presentation: 'modal' }} />
      <Stack.Screen name="cuenta/olvido" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
