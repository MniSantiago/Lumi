import type { Threshold } from '@/lumi/states';

/**
 * Fuente de uso de pantalla. La app solo conoce esta interfaz.
 *
 * - `mockScreenTime` (ahora): el umbral se cambia a mano desde el hogar, y
 *   funciona en Expo Go.
 * - Fuente nativa (pendiente): un módulo de Expo con FamilyControls,
 *   DeviceActivityMonitor (eventos al 25/50/75/100 %) y ShieldConfiguration.
 *   Necesita development build y el entitlement de Family Controls (paso 4
 *   de PROCESO.md).
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

export const screenTime: ScreenTimeSource = createMockScreenTime(25);
