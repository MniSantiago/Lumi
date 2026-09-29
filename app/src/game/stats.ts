import { addDays, daysBetween, mondayOf } from '@/game/clock';
import type { DateKey, DayRecord } from '@/game/types';

/**
 * La racha más larga de toda la historia, con las mismas reglas que la actual:
 * cuenta los días con expedición, los días de descanso no la rompen y un día
 * sin nada (o sin abrir la app) sí.
 */
export function longestStreak(history: DayRecord[]): number {
  const days = [...history].sort((a, b) => (a.date < b.date ? -1 : 1));
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of days) {
    if (prev && daysBetween(prev, day.date) !== 1) run = 0;
    if (day.expedition) run += 1;
    else if (!day.restDay) run = 0;
    best = Math.max(best, run);
    prev = day.date;
  }
  return best;
}

export type PastWeek = { monday: DateKey; sunday: DateKey; brightDays: number };

/** Las `count` semanas anteriores a la actual (lunes a domingo), de la más antigua a la más reciente. */
export function pastWeeks(history: DayRecord[], today: DateKey, count = 4): PastWeek[] {
  const thisMonday = mondayOf(today);
  return Array.from({ length: count }, (_, i) => {
    const monday = addDays(thisMonday, -7 * (count - i));
    const sunday = addDays(monday, 6);
    const brightDays = history.filter((d) => d.expedition && d.date >= monday && d.date <= sunday).length;
    return { monday, sunday, brightDays };
  });
}
