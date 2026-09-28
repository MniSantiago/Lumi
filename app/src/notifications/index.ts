import type { Destination } from '@/game/types';

/**
 * Notificaciones locales de Lumi (funcionan en Expo Go).
 * PROVISIONAL: lo implementa el agente de notificaciones con `expo-notifications`.
 * Mantén las firmas: el motor del juego y el paywall las llaman.
 */

/** Pide permiso si hace falta. Devuelve si se pueden mostrar avisos. */
export async function ensureNotificationPermission(): Promise<boolean> {
  return false;
}

/** Aviso de la vuelta de Lumi ("Lumi ha vuelto del Bosque de Musgo 🌙") a la hora indicada. Sustituye al anterior. */
export async function scheduleNightlyReturn(args: { lumiName: string; destination: Destination; at: Date }): Promise<void> {
  void args;
}

export async function cancelNightlyReturn(): Promise<void> {}

/** Recordatorio 2 días antes de que acabe la prueba de Lumi Plus. */
export async function scheduleTrialReminder(args: { lumiName: string; at: Date }): Promise<void> {
  void args;
}

export async function cancelTrialReminder(): Promise<void> {}

/** Montado en el layout raíz: configura el handler y abre la pantalla adecuada al tocar un aviso. */
export function useNotificationRouting(): void {}
