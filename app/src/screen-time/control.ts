import { Linking } from 'react-native';

import { LampiScreenTime, type AuthorizationStatus, type SelectionSummary } from '../../modules/lampi-screen-time';
import type { Settings } from '@/lumi/store';

/**
 * Lo que la app hace con Screen Time además de leer el umbral: pedir permiso, abrir
 * el selector de Apple y mandar los ajustes a las extensiones. Todo es no-op sin el
 * módulo nativo (Expo Go, web), y ahí `available` es false.
 */
export const screenTimeControl = {
  available: LampiScreenTime != null,

  authorizationStatus(): AuthorizationStatus {
    return LampiScreenTime?.authorizationStatus() ?? 'notDetermined';
  },

  requestAuthorization(): Promise<AuthorizationStatus> {
    return LampiScreenTime?.requestAuthorization() ?? Promise.resolve('notDetermined');
  },

  selectionSummary(): SelectionSummary {
    return LampiScreenTime?.getSelectionSummary() ?? { apps: 0, categories: 0, webDomains: 0 };
  },

  /** Pide permiso si hace falta y abre el selector. `null` = se canceló o no hay permiso. */
  async pickApps(labels: { title: string; done: string; cancel: string }): Promise<SelectionSummary | null> {
    if (!LampiScreenTime) return null;
    let status = LampiScreenTime.authorizationStatus();
    if (status !== 'approved') status = await LampiScreenTime.requestAuthorization();
    if (status !== 'approved') return null;
    return LampiScreenTime.pickApps(labels.title, labels.done, labels.cancel);
  },

  /** Manda límite, noche, nombre y escudo a las extensiones y reprograma el monitor. */
  async configure(settings: Pick<Settings, 'lumiName' | 'limitMinutes' | 'nightStart' | 'nightEnd' | 'strictShield' | 'isPlus'>) {
    if (!LampiScreenTime || LampiScreenTime.authorizationStatus() !== 'approved') return;
    await LampiScreenTime.configure({
      lumiName: settings.lumiName,
      limitMinutes: settings.limitMinutes,
      nightStart: settings.nightStart,
      nightEnd: settings.nightEnd,
      // El escudo estricto es de Lampi Plus: sin Plus nunca se aplica.
      strictShield: settings.strictShield && settings.isPlus,
    });
  },

  openSystemSettings: () => Linking.openSettings(),
};
