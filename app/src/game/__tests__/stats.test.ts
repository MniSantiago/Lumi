import { describe, expect, it } from '@jest/globals';

import { longestStreak, pastWeeks } from '@/game/stats';
import type { DayRecord } from '@/game/types';

const trip = { destinationId: 'bosque-musgo', storyIndex: 0, itemIds: [], friendId: null, sparks: 10 };
const day = (date: string, kind: 'trip' | 'rest' | 'home'): DayRecord => ({
  date,
  maxThreshold: 0,
  restDay: kind === 'rest',
  expedition: kind === 'trip' ? trip : null,
  closed: true,
});

describe('longestStreak', () => {
  it('cuenta expediciones seguidas; el descanso no rompe y un día en casa sí', () => {
    const history = [
      day('2026-09-01', 'trip'),
      day('2026-09-02', 'rest'),
      day('2026-09-03', 'trip'),
      day('2026-09-04', 'home'),
      day('2026-09-05', 'trip'),
    ];
    expect(longestStreak(history)).toBe(2);
  });

  it('un hueco sin registro rompe la racha', () => {
    expect(longestStreak([day('2026-09-01', 'trip'), day('2026-09-03', 'trip'), day('2026-09-04', 'trip')])).toBe(2);
  });

  it('sin historia, cero', () => {
    expect(longestStreak([])).toBe(0);
  });
});

describe('pastWeeks', () => {
  it('cuenta los días con expedición de cada semana anterior, de lunes a domingo', () => {
    // 2026-09-28 es lunes: la semana actual no cuenta.
    const history = [
      day('2026-09-21', 'trip'),
      day('2026-09-27', 'trip'),
      day('2026-09-24', 'rest'),
      day('2026-09-14', 'trip'),
      day('2026-09-28', 'trip'),
    ];
    const weeks = pastWeeks(history, '2026-09-29', 2);
    expect(weeks).toEqual([
      { monday: '2026-09-14', sunday: '2026-09-20', brightDays: 1 },
      { monday: '2026-09-21', sunday: '2026-09-27', brightDays: 2 },
    ]);
  });
});
