import * as Notifications from 'expo-notifications';
import { router, usePathname, useRootNavigationState, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { DESTINATIONS } from '@/game/destinations';
import type { Destination } from '@/game/types';
import { useLumi } from '@/lumi/store';
import { bedtimeContent, nightlyReturnContent, trialReminderContent, weeklySummaryContent } from '@/notifications/copy';

export { permissionDeniedCopy } from '@/notifications/copy';

/**
 * Notificaciones locales de Lumi con `expo-notifications` (funcionan en Expo Go;
 * no hay push, así que no hace falta el config plugin).
 *
 * - El permiso se pide tarde: la primera vez que algo se programa o al
 *   encender "Postal nocturna" en Ajustes. Nunca al abrir la app.
 * - Sin permiso, programar no hace nada (en silencio).
 * - Cada aviso tiene un identificador fijo: programar otra vez sustituye al anterior.
 * - Al tocar un aviso se abre `data.route` (`/postal`, `/plus` o `/resumen`).
 */

const NIGHTLY_ID = 'lumi.nightly-return';
const TRIAL_ID = 'lumi.trial-reminder';
const WEEKLY_ID = 'lumi.weekly-summary';
const BEDTIME_ID = 'lumi.bedtime';

/** El resumen de la semana: domingo (1 en expo-notifications) a las 19:00. */
const WEEKLY_AT = { weekday: 1, hour: 19, minute: 0 };

/** Rutas a las que puede llevar un aviso. */
const ROUTES = ['/postal', '/plus', '/resumen'] as const;
type NotificationRoute = (typeof ROUTES)[number];

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

// Con la app abierta también se enseñan (banner, lista y sonido).
if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function isAllowed(p: Notifications.NotificationPermissionsStatus) {
  return p.granted || p.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

let inFlight: Promise<boolean> | null = null;

/** Pide permiso si hace falta. Devuelve si se pueden mostrar avisos. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!supported) return false;
  // Si llegan dos peticiones a la vez, iOS solo enseña un diálogo.
  inFlight ??= (async () => {
    try {
      const current = await Notifications.getPermissionsAsync();
      if (isAllowed(current)) return true;
      if (!current.canAskAgain) return false;
      const asked = await Notifications.requestPermissionsAsync({
        ios: { allowAlert: true, allowSound: true, allowBadge: false },
      });
      return isAllowed(asked);
    } catch {
      return false;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

/** Hay permiso de avisos, sin preguntar. */
async function canNotify(): Promise<boolean> {
  if (!supported) return false;
  try {
    return isAllowed(await Notifications.getPermissionsAsync());
  } catch {
    return false;
  }
}

/**
 * Programa un aviso. Por defecto no pide permiso: pedirlo de golpe, sin
 * contexto, suele acabar en "No permitir". Se pide donde se explica
 * (onboarding, Ajustes, la prueba de Plus) con `ask`.
 */
async function scheduleAt(
  identifier: string,
  at: Date,
  content: { title: string; body: string },
  route: NotificationRoute,
  { ask = false }: { ask?: boolean } = {},
) {
  await cancel(identifier);
  if (at.getTime() <= Date.now()) return;
  if (!(ask ? await ensureNotificationPermission() : await canNotify())) return;
  try {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: { ...content, sound: 'default', data: { route } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
    });
  } catch {
    // Un aviso que no se programa no debe romper nada.
  }
}

async function cancel(identifier: string) {
  if (!supported) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // No había nada programado.
  }
}

/** Aviso de la vuelta de Lumi ("Lumi ha vuelto del Bosque de Musgo 🌙") a la hora indicada. Sustituye al anterior. */
export async function scheduleNightlyReturn(args: {
  lumiName: string;
  destination: Destination;
  at: Date;
}): Promise<void> {
  await scheduleAt(NIGHTLY_ID, args.at, nightlyReturnContent(args.lumiName, args.destination, args.at), '/postal');
}

export async function cancelNightlyReturn(): Promise<void> {
  await cancel(NIGHTLY_ID);
}

/** Recordatorio 2 días antes de que acabe la prueba de Lumi Plus. */
export async function scheduleTrialReminder(args: { lumiName: string; at: Date }): Promise<void> {
  // El paywall acaba de prometer este aviso: aquí sí tiene sentido pedir permiso.
  await scheduleAt(TRIAL_ID, args.at, trialReminderContent(args.lumiName), '/plus', { ask: true });
}

export async function cancelTrialReminder(): Promise<void> {
  await cancel(TRIAL_ID);
}

/** Aviso semanal con el resumen (se repite cada domingo). No pide permiso: solo se programa si ya lo hay. */
export async function scheduleWeeklySummary(lumiName: string): Promise<void> {
  await cancel(WEEKLY_ID);
  if (!(await canNotify())) return;
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: WEEKLY_ID,
      content: { ...weeklySummaryContent(lumiName), sound: 'default', data: { route: '/resumen' } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, ...WEEKLY_AT },
    });
  } catch {
    // Un aviso que no se programa no debe romper nada.
  }
}

/** Aviso diario a la hora de dormir. Como el semanal, no pide permiso: solo se programa si ya lo hay. */
export async function scheduleBedtime(lumiName: string, nightStart: string): Promise<void> {
  await cancel(BEDTIME_ID);
  if (!(await canNotify())) return;
  const [hour, minute] = nightStart.split(':').map(Number);
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: BEDTIME_ID,
      content: { ...bedtimeContent(lumiName), sound: 'default' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: hour || 0, minute: minute || 0 },
    });
  } catch {
    // Un aviso que no se programa no debe romper nada.
  }
}

export async function cancelBedtime(): Promise<void> {
  await cancel(BEDTIME_ID);
}

/** Mantiene programado (o quitado) el aviso de buenas noches según los ajustes. */
export function useBedtimeReminder(): void {
  const { ready, settings } = useLumi();
  const on = ready && settings.onboarded && settings.bedtimeReminder;
  useEffect(() => {
    if (!ready) return;
    const sync = () => {
      if (on) scheduleBedtime(settings.lumiName, settings.nightStart).catch(() => {});
      else cancelBedtime().catch(() => {});
    };
    sync();
    const sub = AppState.addEventListener('change', (state) => state === 'active' && sync());
    return () => sub.remove();
  }, [ready, on, settings.lumiName, settings.nightStart]);
}

export async function cancelWeeklySummary(): Promise<void> {
  await cancel(WEEKLY_ID);
}

/**
 * Montado en el layout raíz: mantiene el aviso del domingo al día con el
 * ajuste y el nombre de Lumi (y con el idioma, que se lee al programarlo).
 */
export function useWeeklySummaryReminder(): void {
  const { ready, settings } = useLumi();
  const on = ready && settings.onboarded && settings.weeklySummary;
  useEffect(() => {
    if (!ready) return;
    const sync = () => {
      if (on) scheduleWeeklySummary(settings.lumiName).catch(() => {});
      else cancelWeeklySummary().catch(() => {});
    };
    sync();
    // Al volver a la app: por si se ha dado permiso de avisos mientras tanto (en Ajustes de iOS o al encender otro aviso).
    const sub = AppState.addEventListener('change', (state) => state === 'active' && sync());
    return () => sub.remove();
  }, [ready, on, settings.lumiName]);
}

/**
 * Solo para desarrollo: programa la vuelta nocturna dentro de `seconds` segundos
 * (bloquea el móvil o sal de la app para verla llegar).
 */
export async function debugScheduleNightlyIn(
  seconds = 5,
  args: { lumiName?: string; destination?: Pick<Destination, 'from'> } = {},
): Promise<void> {
  const destination = args.destination ?? DESTINATIONS[0];
  const at = new Date(Date.now() + seconds * 1000);
  await scheduleAt(NIGHTLY_ID, at, nightlyReturnContent(args.lumiName ?? 'Lumi', destination, at), '/postal', {
    ask: true,
  });
}

function routeOf(response: Notifications.NotificationResponse): NotificationRoute | null {
  if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return null;
  const route = response.notification.request.content.data?.route;
  return ROUTES.find((r) => r === route) ?? null;
}

/** Una misma entrega de un aviso (el identificador se repite cada noche; la fecha no). */
function responseKey(response: Notifications.NotificationResponse) {
  return `${response.notification.request.identifier}@${response.notification.date}`;
}

/** Montado en el layout raíz: configura el handler y abre la pantalla adecuada al tocar un aviso. */
export function useNotificationRouting(): void {
  const { ready, settings } = useLumi();
  const navReady = Boolean(useRootNavigationState()?.key);
  const pathname = usePathname();
  // El toque que abrió la app en frío ya está guardado al arrancar; los demás llegan por el listener.
  // (No usamos `useLastNotificationResponse`: compara por identificador y, como el
  // nuestro es fijo, no se enteraría del aviso de la noche siguiente.)
  const [pending, setPending] = useState<Notifications.NotificationResponse | null>(() =>
    supported ? Notifications.getLastNotificationResponse() : null,
  );
  const handled = useRef(new Set<string>());

  useEffect(() => {
    if (!supported) return;
    const sub = Notifications.addNotificationResponseReceivedListener(setPending);
    return () => sub.remove();
  }, []);

  // Las rutas solo existen con los ajustes leídos y el onboarding hecho; hasta entonces, el toque espera.
  const canRoute = ready && settings.onboarded && navReady;

  useEffect(() => {
    if (!pending || !canRoute) return;
    const key = responseKey(pending);
    if (handled.current.has(key)) return;
    handled.current.add(key);
    // Para que un recargado o el siguiente arranque no vuelva a abrir la misma pantalla.
    Notifications.clearLastNotificationResponse();
    const route = routeOf(pending);
    if (route && pathname !== route) router.push(route satisfies Href);
  }, [pending, canRoute, pathname]);
}
