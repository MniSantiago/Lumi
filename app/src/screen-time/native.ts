import { AppState } from 'react-native';

import type { Threshold } from '@/lumi/states';
import { shieldCopy } from '@/shield/copy';

import type { ScreenTimeSource } from './index';

/**
 * Screen Time de verdad (FamilyControls + DeviceActivity + ManagedSettings),
 * con `react-native-device-activity`. Solo en un development build o en la
 * versión de la tienda, con el entitlement de Family Controls.
 *
 * ⚠️ Sin compilar ni probar en un iPhone todavía (ver el PR y `APP_STORE.md`).
 *
 * Cómo encaja con Lumi (BRIEF.md, sección 4):
 * - `lumiDia` (00:00-23:59, cada día): eventos al 25/50/75/100 % del límite,
 *   sumando las apps ladronas. Al 100 %, tapa las apps con el escudo de Lumi.
 *   Al empezar el día, las destapa (cada día empieza de cero).
 * - `lumiNoche` (horario de noche): tapa al empezar y destapa al terminar.
 * - "5 min más" en el escudo: destapa y vuelve a tapar al cabo de 5 minutos
 *   de uso (`lumiPausa`).
 *
 * Los nombres no llevan "_": la librería separa las claves por ese carácter.
 */

type DAModule = typeof import('react-native-device-activity');
let loaded: DAModule | null = null;
/**
 * Carga perezosa: el paquete registra vistas nativas al importarse y en Expo Go
 * no existen. `screen-time/index.ts` solo llega aquí fuera de Expo Go.
 */
function da(): DAModule {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  loaded ??= require('react-native-device-activity') as DAModule;
  return loaded;
}

const SELECTION_ID = 'ladronas';
const DAY = 'lumiDia';
const NIGHT = 'lumiNoche';
const PAUSE = 'lumiPausa';
const THRESHOLDS: Exclude<Threshold, 0>[] = [25, 50, 75, 100];
const eventName = (t: Threshold) => `u${t}`;

const night = { red: 27, green: 24, blue: 64 };
const amber = { red: 255, green: 201, blue: 107 };
const text = { red: 244, green: 240, blue: 255 };
const soft = { red: 185, green: 176, blue: 230 };

export const nativeScreenTimeAvailable = () => da().isAvailable();

export async function requestScreenTimeAuthorization(): Promise<boolean> {
  await da().requestAuthorization('individual');
  return da().getAuthorizationStatus() === da().AuthorizationStatus.approved;
}

/** Guarda la selección del `FamilyActivityPicker` para usarla por id (el token puede ser enorme). */
export function saveThiefAppsSelection(token: string) {
  da().setFamilyActivitySelectionId({ id: SELECTION_ID, familyActivitySelection: token });
}

export function getThiefAppsSelection(): string | undefined {
  return da().getFamilyActivitySelectionId(SELECTION_ID);
}

/** Cuántas apps y categorías hay elegidas (para enseñarlo en Ajustes). */
export function thiefAppsCount(): number {
  const token = getThiefAppsSelection();
  if (!token) return 0;
  const meta = da().activitySelectionMetadata({ activitySelectionToken: token });
  return (meta?.applicationCount ?? 0) + (meta?.categoryCount ?? 0) + (meta?.webDomainCount ?? 0);
}

const hm = (minutes: number) => ({ hour: Math.floor(minutes / 60), minute: minutes % 60 });
const parseHHMM = (hhmm: string) => {
  const [hour, minute] = hhmm.split(':').map(Number);
  return { hour: hour || 0, minute: minute || 0 };
};

/**
 * Programa el día, la noche y el escudo con los ajustes actuales. Se llama al
 * terminar el onboarding y cada vez que cambian el límite, el horario o las apps.
 */
export async function applyScreenTimePlan({
  limitMinutes,
  nightStart,
  nightEnd,
  lumiName,
}: {
  limitMinutes: number;
  nightStart: string;
  nightEnd: string;
  lumiName: string;
}) {
  const token = getThiefAppsSelection();
  if (!token) return;

  da().stopMonitoring([DAY, NIGHT, PAUSE]);
  da().cleanUpAfterActivity(DAY);
  da().cleanUpAfterActivity(NIGHT);
  da().cleanUpAfterActivity(PAUSE);

  const block = { type: 'blockSelection', familyActivitySelectionId: SELECTION_ID } as const;
  const unblock = { type: 'unblockSelection', familyActivitySelectionId: SELECTION_ID } as const;

  // El escudo: habla Lumi, nunca riñe.
  da().updateShield(
    {
      title: shieldCopy.title(lumiName),
      titleColor: text,
      subtitle: shieldCopy.body,
      subtitleColor: soft,
      backgroundColor: night,
      iconSystemName: 'moon.zzz.fill',
      iconTint: amber,
      primaryButtonLabel: shieldCopy.leave,
      primaryButtonLabelColor: night,
      primaryButtonBackgroundColor: amber,
      secondaryButtonLabel: shieldCopy.snooze(0),
      secondaryButtonLabelColor: soft,
    },
    {
      primary: { behavior: 'close' },
      secondary: {
        behavior: 'defer',
        actions: [
          unblock,
          {
            type: 'startMonitoring',
            activityName: PAUSE,
            deviceActivityEvents: [{ eventName: 'm5', familyActivitySelection: token, threshold: { minute: 5 } }],
            intervalStartDelayMs: 0,
            // DeviceActivity exige intervalos de al menos 15 minutos.
            intervalEndDelayMs: 20 * 60 * 1000,
          },
        ],
      },
    },
  );

  // Día: umbrales y escudo al 100 %; al empezar el día, todo destapado.
  da().configureActions({ activityName: DAY, callbackName: 'intervalDidStart', actions: [unblock] });
  da().configureActions({ activityName: DAY, callbackName: 'eventDidReachThreshold', eventName: eventName(100), actions: [block] });
  await da().startMonitoring(
    DAY,
    { intervalStart: { hour: 0, minute: 0, second: 0 }, intervalEnd: { hour: 23, minute: 59, second: 59 }, repeats: true },
    THRESHOLDS.map((t) => ({
      eventName: eventName(t),
      familyActivitySelection: token,
      threshold: hm(Math.max(1, Math.round((limitMinutes * t) / 100))),
    })),
  );

  // Pausa de "5 min más": al llegar a 5 minutos, se vuelve a tapar.
  da().configureActions({ activityName: PAUSE, callbackName: 'eventDidReachThreshold', eventName: 'm5', actions: [block] });

  // Noche: se tapa al empezar y se destapa al terminar.
  da().configureActions({ activityName: NIGHT, callbackName: 'intervalDidStart', actions: [block] });
  da().configureActions({ activityName: NIGHT, callbackName: 'intervalDidEnd', actions: [unblock] });
  await da().startMonitoring(
    NIGHT,
    { intervalStart: parseHHMM(nightStart), intervalEnd: parseHHMM(nightEnd), repeats: true },
    [],
  );
}

const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

/** Último umbral cruzado hoy, leído del historial de eventos que guarda la extensión. */
function thresholdToday(): Threshold {
  let max: Threshold = 0;
  for (const e of da().getEvents(DAY)) {
    if (e.callbackName !== 'eventDidReachThreshold' || !isToday(e.lastCalledAt)) continue;
    const t = THRESHOLDS.find((x) => eventName(x) === e.eventName);
    if (t && t > max) max = t;
  }
  return max;
}

export function createNativeScreenTime(): ScreenTimeSource {
  return {
    getThreshold: async () => thresholdToday(),
    subscribe(listener) {
      // Con la app abierta llegan los eventos; si estaba cerrada, se lee el historial al volver.
      const events = da().onDeviceActivityMonitorEvent(() => listener(thresholdToday()));
      const app = AppState.addEventListener('change', (s) => s === 'active' && listener(thresholdToday()));
      return () => {
        events.remove();
        app.remove();
      };
    },
  };
}

/** La hoja nativa del `FamilyActivityPicker` (se carga solo cuando se usa). */
export const selectionSheetView = () => da().DeviceActivitySelectionSheetView;
