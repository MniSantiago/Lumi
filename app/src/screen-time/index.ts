import Constants, { ExecutionEnvironment } from 'expo-constants';

import type { Threshold } from '@/lumi/states';
import { createNativeScreenTime, nativeScreenTimeAvailable } from '@/screen-time/native';

/**
 * Fuente de uso de pantalla. La app solo conoce esta interfaz.
 *
 * - Nativa (`screen-time/native.ts`): FamilyControls, DeviceActivityMonitor
 *   (eventos al 25/50/75/100 %) y el escudo de Lumi. Necesita development
 *   build, el entitlement de Family Controls y `LUMI_SCREEN_TIME=1` al
 *   compilar (ver `app.config.ts`).
 * - Mock: en Expo Go, en web o sin el módulo nativo. El umbral se cambia a
 *   mano desde el Hogar ("Simular uso").
 */
export interface ScreenTimeSource {
  /** Último umbral cruzado hoy. */
  getThreshold(): Promise<Threshold>;
  /** Avisa cada vez que se cruza un umbral. Devuelve la función para darse de baja. */
  subscribe(listener: (t: Threshold) => void): () => void;
  /** Solo en el mock: simular que se ha llegado a un umbral. */
  simulate?(t: Threshold): void;
}

function createMockScreenTime(initial: Threshold): ScreenTimeSource {
  let current = initial;
  const listeners = new Set<(t: Threshold) => void>();
  return {
    getThreshold: async () => current,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    simulate(t) {
      current = t;
      listeners.forEach((l) => l(t));
    },
  };
}

const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/** `true` si el uso viene de Screen Time de verdad; `false` con el mock. */
export const realScreenTime = !inExpoGo && nativeScreenTimeAvailable();

export const screenTime: ScreenTimeSource = realScreenTime ? createNativeScreenTime() : createMockScreenTime(25);
