import { daysBetween } from '@/game/clock';
import type { DayRecord } from '@/game/types';

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
