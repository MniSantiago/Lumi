import { NativeModule, requireOptionalNativeModule } from 'expo';

export type AuthorizationStatus = 'notDetermined' | 'denied' | 'approved';

/** Cuántas apps, categorías y webs eligió el usuario en el selector de Apple. */
export type SelectionSummary = { apps: number; categories: number; webDomains: number };

export type ConfigureOptions = {
  lumiName: string;
  limitMinutes: number;
  /** "HH:mm" */
  nightStart: string;
  nightEnd: string;
  strictShield: boolean;
};

type Events = { onThreshold: (event: { threshold: number }) => void };

declare class LampiScreenTimeModule extends NativeModule<Events> {
  authorizationStatus(): AuthorizationStatus;
  requestAuthorization(): Promise<AuthorizationStatus>;
  pickApps(title: string, done: string, cancel: string): Promise<SelectionSummary | null>;
  getSelectionSummary(): SelectionSummary;
  configure(options: ConfigureOptions): Promise<void>;
  getThreshold(): number;
  getSnoozesToday(): number;
  stop(): void;
}

/**
 * `null` donde no existe el módulo nativo: Expo Go, web o cualquier build sin las
 * extensiones de Screen Time. La app cae entonces al mock.
 */
export default requireOptionalNativeModule<LampiScreenTimeModule>('LampiScreenTime');
