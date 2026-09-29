import { daysBetween, parseDateKey } from '@/game/clock';
import type { CatalogEntry, DateKey } from '@/game/types';
import { tr } from '@/i18n';
import { dayMonth, monthName, WEEKDAYS } from '@/i18n/dates';

/** "hoy", "ayer", "el lunes" (esta última semana) o "el 12 de septiembre". */
export function whenLabel(date: DateKey, today: DateKey): string {
  const ago = daysBetween(date, today);
  if (ago === 0) return tr({ es: 'hoy', en: 'today', zh: '今天', hi: 'आज', fr: 'aujourd’hui' });
  if (ago === 1) return tr({ es: 'ayer', en: 'yesterday', zh: '昨天', hi: 'कल', fr: 'hier' });
  const d = parseDateKey(date);
  if (ago > 1 && ago < 7) {
    const w = WEEKDAYS[d.getDay()];
    return tr({ es: `el ${w}`, en: `on ${w}`, zh: w, hi: `${w} को`, fr: w });
  }
  const dm = dayMonth(d);
  return tr({ es: `el ${dm}`, en: `on ${dm}`, zh: dm, hi: `${dm} को`, fr: `le ${dm}` });
}

/** "el lunes" → "El lunes". */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "una seta brillante". */
export function withIndefinite(entry: CatalogEntry): string {
  return entry.a;
}

/** "del 22 al 28 de septiembre" (o "del 29 de septiembre al 5 de octubre"). */
export function rangeLabel(from: DateKey, to: DateKey): string {
  const a = parseDateKey(from);
  const b = parseDateKey(to);
  const x = a.getDate();
  const y = b.getDate();
  if (a.getMonth() === b.getMonth()) {
    const m = monthName(b);
    return tr({
      es: `del ${x} al ${y} de ${m}`,
      en: `${m} ${x}–${y}`,
      zh: `${m}${x}日至${y}日`,
      hi: `${x}–${y} ${m}`,
      fr: `du ${x} au ${y} ${m}`,
    });
  }
  const da = dayMonth(a);
  const db = dayMonth(b);
  return tr({
    es: `del ${da} al ${db}`,
    en: `${da} – ${db}`,
    zh: `${da}至${db}`,
    hi: `${da} – ${db}`,
    fr: `du ${da} au ${db}`,
  });
}
