import { daysBetween, parseDateKey } from '@/game/clock';
import type { CatalogEntry, DateKey } from '@/game/types';

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** "hoy", "ayer", "el lunes" (esta última semana) o "el 12 de septiembre". */
export function whenLabel(date: DateKey, today: DateKey): string {
  const ago = daysBetween(date, today);
  if (ago === 0) return 'hoy';
  if (ago === 1) return 'ayer';
  const d = parseDateKey(date);
  if (ago > 1 && ago < 7) return `el ${WEEKDAYS[d.getDay()]}`;
  return `el ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

/** "el lunes" → "El lunes". */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "una seta brillante". */
export function withIndefinite(entry: CatalogEntry): string {
  return `${entry.article} ${entry.name.toLowerCase()}`;
}

/** "del 22 al 28 de septiembre" (o "del 29 de septiembre al 5 de octubre"). */
export function rangeLabel(from: DateKey, to: DateKey): string {
  const a = parseDateKey(from);
  const b = parseDateKey(to);
  return a.getMonth() === b.getMonth()
    ? `del ${a.getDate()} al ${b.getDate()} de ${MONTHS[b.getMonth()]}`
    : `del ${a.getDate()} de ${MONTHS[a.getMonth()]} al ${b.getDate()} de ${MONTHS[b.getMonth()]}`;
}
