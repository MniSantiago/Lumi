import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DateKey } from '@/game/types';

/**
 * Reloj del juego. Es el reloj real más un desfase de días que solo se usa en
 * desarrollo (`dev.nextDay`) y que se guarda para sobrevivir a recargas.
 */
const STORAGE_KEY = 'lumi.clock.v1';
const DAY_MS = 24 * 60 * 60 * 1000;

let dayOffset = 0;

export async function loadClock(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as { dayOffset?: number }) : null;
    dayOffset = typeof parsed?.dayOffset === 'number' ? parsed.dayOffset : 0;
  } catch {
    dayOffset = 0;
  }
}

export function setDayOffset(days: number): void {
  dayOffset = days;
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ dayOffset })).catch(() => {});
}

export function getDayOffset(): number {
  return dayOffset;
}

/** Hora del juego. Con desfase, se mueve el calendario pero no la hora del día. */
export function now(): Date {
  const d = new Date();
  if (dayOffset) d.setDate(d.getDate() + dayOffset);
  return d;
}

/** Pasa una fecha del juego a la real (para programar avisos). */
export function toRealDate(gameDate: Date): Date {
  const d = new Date(gameDate);
  if (dayOffset) d.setDate(d.getDate() - dayOffset);
  return d;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Fecha local 'YYYY-MM-DD'. */
export function dateKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayKey(): DateKey {
  return dateKey(now());
}

/** Medianoche local de una fecha. */
export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: DateKey, days: number): DateKey {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

/** Días enteros de `a` a `b` (b − a). */
export function daysBetween(a: DateKey, b: DateKey): number {
  return Math.round((parseDateKey(b).getTime() - parseDateKey(a).getTime()) / DAY_MS);
}

/** Fecha local de `key` a la hora 'HH:MM'. */
export function atTime(key: DateKey, hhmm: string): Date {
  const d = parseDateKey(key);
  const [h, m] = hhmm.split(':').map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

/** Lunes de la semana de `key` (la semana va de lunes a domingo). */
export function mondayOf(key: DateKey): DateKey {
  const dow = (parseDateKey(key).getDay() + 6) % 7; // 0 = lunes
  return addDays(key, -dow);
}
