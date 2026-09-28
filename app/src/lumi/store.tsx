import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { screenTime } from '@/screen-time';
import { stateForThreshold, type LumiState, type Threshold } from '@/lumi/states';

export type Settings = {
  userName: string;
  lumiName: string;
  /** Límite diario suave, en minutos. */
  limitMinutes: number;
  nightStart: string;
  nightEnd: string;
  nightlyPostcard: boolean;
  restDays: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  userName: 'Santi',
  lumiName: 'Lumi',
  limitMinutes: 60,
  nightStart: '23:00',
  nightEnd: '07:00',
  nightlyPostcard: true,
  restDays: true,
};

export const LIMIT_OPTIONS = [30, 45, 60, 90, 120] as const;

const STORAGE_KEY = 'lumi.settings.v1';

type LumiContextValue = {
  threshold: Threshold;
  state: LumiState;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
};

const LumiContext = createContext<LumiContextValue | null>(null);

export function LumiProvider({ children }: { children: ReactNode }) {
  const [threshold, setThreshold] = useState<Threshold>(0);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    screenTime.getThreshold().then(setThreshold);
    return screenTime.subscribe(setThreshold);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => raw && setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) }))
      .catch(() => {});
  }, []);

  const updateSettings = (patch: Partial<Settings>) =>
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });

  return (
    <LumiContext value={{ threshold, state: stateForThreshold(threshold), settings, updateSettings }}>
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
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m}` : `${h} h`;
}
