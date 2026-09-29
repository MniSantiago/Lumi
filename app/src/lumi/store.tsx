import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { screenTime } from '@/screen-time';
import { tr } from '@/i18n';
import { stateForThreshold, type LumiState, type Threshold } from '@/lumi/states';

export type Settings = {
  /** Se pone a true al terminar el onboarding; hasta entonces no se ven las pestañas. */
  onboarded: boolean;
  userName: string;
  lumiName: string;
  /** Límite diario suave, en minutos. */
  limitMinutes: number;
  /** Ids de `THIEF_APP_CATALOG` que apagan la luz de Lumi. */
  thiefApps: string[];
  nightStart: string;
  nightEnd: string;
  nightlyPostcard: boolean;
  /** Aviso del domingo por la tarde con el resumen de la semana. */
  weeklySummary: boolean;
  restDays: boolean;
  /** Suscripción a Lumi Plus activa (de momento, compra simulada). */
  isPlus: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  userName: '',
  lumiName: 'Lumi',
  limitMinutes: 60,
  thiefApps: ['tiktok', 'instagram', 'youtube'],
  nightStart: '23:00',
  nightEnd: '07:00',
  nightlyPostcard: true,
  weeklySummary: true,
  restDays: true,
  isPlus: false,
};

export const LIMIT_OPTIONS = [30, 45, 60, 90, 120] as const;

const STORAGE_KEY = 'lumi.settings.v1';

type LumiContextValue = {
  /** Ya se han leído los ajustes guardados. */
  ready: boolean;
  threshold: Threshold;
  state: LumiState;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
};

const LumiContext = createContext<LumiContextValue | null>(null);

export function LumiProvider({ children }: { children: ReactNode }) {
  const [threshold, setThreshold] = useState<Threshold>(0);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    screenTime.getThreshold().then(setThreshold);
    return screenTime.subscribe(setThreshold);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => raw && setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) }))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const updateSettings = (patch: Partial<Settings>) =>
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

  return (
    <LumiContext value={{ ready, threshold, state: stateForThreshold(threshold), settings, updateSettings }}>
      {children}
    </LumiContext>
  );
}

export function useLumi() {
  const ctx = use(LumiContext);
  if (!ctx) throw new Error('useLumi debe usarse dentro de <LumiProvider>');
  return ctx;
}

export function formatLimit(minutes: number) {
  if (minutes < 60)
    return tr({
      es: `${minutes} min`,
      en: `${minutes} min`,
      zh: `${minutes} 分钟`,
      hi: `${minutes} मिनट`,
      fr: `${minutes} min`,
    });
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const mm = String(m).padStart(2, '0');
  if (!m) return tr({ es: `${h} h`, en: `${h} h`, zh: `${h} 小时`, hi: `${h} घंटा`, fr: `${h} h` });
  return tr({
    es: `${h} h ${mm}`,
    en: `${h} h ${mm}`,
    zh: `${h} 小时 ${m} 分`,
    hi: `${h} घं ${mm} मि`,
    fr: `${h} h ${mm}`,
  });
}
