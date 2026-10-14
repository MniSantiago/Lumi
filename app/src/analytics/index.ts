import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { AppState, Platform } from 'react-native';

import { createAnalytics } from '@/analytics/client';
import { EVENTS } from '@/analytics/events';
import { lang } from '@/i18n';

export { EVENTS } from '@/analytics/events';
export type { EventName, PaywallOrigen } from '@/analytics/events';

/**
 * Medición del embudo de Lampi (Fase 1).
 *
 * **Sin `EXPO_PUBLIC_POSTHOG_KEY` no manda nada.** Eso es a propósito: el
 * código se puede mergear y publicar hoy, y empieza a medir el día que la clave
 * entre en las variables de EAS, sin tocar una línea ni enviar otra build.
 *
 * EU Cloud por defecto: la audiencia es española y los datos se quedan en la UE,
 * así que no hay transferencia internacional que explicar en el RGPD.
 *
 * Lo que no se manda, nunca: qué apps ha elegido el usuario, cuántos minutos ha
 * puesto de límite, y nada de su uso real del móvil. Ni autocaptura, ni grabación
 * de sesión: este cliente no las tiene, así que no hay nada que desactivar.
 */
const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const HOST = (process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com').replace(/\/+$/, '');

export const analytics = createAnalytics({
  key: KEY,
  host: HOST,
  storage: AsyncStorage,
  fetchImpl: (...args) => fetch(...args),
  baseProps: {
    plataforma: Platform.OS,
    version_app: Constants.expoConfig?.version ?? 'desconocida',
    idioma: lang,
    // Para poder separar en PostHog lo que sale de una build de tienda de lo que
    // sale de un simulador o de Expo Go mientras se prueba.
    entorno: __DEV__ ? 'desarrollo' : 'produccion',
  },
  debug: __DEV__ ? (event, props) => console.debug('[medición]', event, props) : undefined,
});

/** `true` si la medición está conectada. Lo usa Ajustes para no prometer lo que no hay. */
export const measuring = analytics.enabled;

const STORAGE_KEY_SEEN = 'lampi.analytics.vista';

let started = false;

/**
 * Arranca la medición: el evento de apertura y el envío al irse la app al fondo.
 * Se llama una vez, desde el layout raíz.
 */
export function startAnalytics() {
  if (started) return;
  started = true;

  void firstOpen().then((primeraVez) => analytics.track(EVENTS.appAbierta, { primera_vez: primeraVez }));

  // Al irse al fondo se manda lo pendiente: es el único momento en que se sabe
  // que la app puede no volver a abrirse en un rato.
  AppState.addEventListener('change', (state) => {
    if (state !== 'active') void analytics.flush();
  });
}

/** Si es la primera vez que esta instalación abre la app. */
async function firstOpen(): Promise<boolean> {
  try {
    const seen = await AsyncStorage.getItem(STORAGE_KEY_SEEN);
    if (seen) return false;
    await AsyncStorage.setItem(STORAGE_KEY_SEEN, '1');
    return true;
  } catch {
    return false;
  }
}
