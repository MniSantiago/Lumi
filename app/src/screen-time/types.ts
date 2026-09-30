import type { Threshold } from '@/lumi/states';

/**
 * Fuente de uso de pantalla. La app solo conoce esta interfaz.
 *
 * - `mockScreenTime`: el umbral se cambia a mano desde el hogar, y funciona en Expo Go.
 * - Fuente nativa (`native.ts`): módulo `lampi-screen-time` con FamilyControls,
 *   DeviceActivityMonitor (eventos al 25/50/75/100 %) y ShieldConfiguration.
 *   Necesita development build con el entitlement de Family Controls.
 */
export interface ScreenTimeSource {
  /** Último umbral cruzado hoy. */
  getThreshold(): Promise<Threshold>;
  /** Avisa cada vez que se cruza un umbral. Devuelve la función para darse de baja. */
  subscribe(listener: (t: Threshold) => void): () => void;
  /** Solo en el mock: simular que se ha llegado a un umbral. */
  simulate?(t: Threshold): void;
}
