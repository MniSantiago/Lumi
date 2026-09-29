import { describe, expect, it } from '@jest/globals';

import {
  closeDay,
  EMPTY_STATE,
  emptyDay,
  evolutionFor,
  expeditionProgress,
  litFor,
  markRestlessNight,
  NIGHT_BONUS,
  recordThreshold,
  streakFor,
  syncToday,
  type GameState,
  type StoredDay,
} from '@/game/engine';
import { atTime } from '@/game/clock';
import { DESTINATIONS } from '@/game/destinations';

const ctx = { isPlus: false, restDays: true };
const firstFree = DESTINATIONS.find((d) => !d.plus && d.unlockAfterBrightDays === 0)!;
const MORNING = (date: string) => atTime(date, '10:00');

/** Estado con un día abierto hacia `firstFree` y el umbral dado. */
function withDay(date: string, maxThreshold: StoredDay['maxThreshold'], base: GameState = EMPTY_STATE): GameState {
  return {
    ...base,
    days: { ...base.days, [date]: { ...emptyDay(date), destinationId: firstFree.id, maxThreshold } },
  };
}

describe('closeDay', () => {
  it('con poco uso, Lumi vuelve con postal, objetos y chispas', () => {
    const next = closeDay(withDay('2026-09-28', 25), '2026-09-28', ctx, 0);
    const day = next.days['2026-09-28'];
    expect(day.closed).toBe(true);
    expect(day.expedition?.destinationId).toBe(firstFree.id);
    expect(next.pending?.destinationId).toBe(firstFree.id);
    expect(next.sparks).toBeGreaterThan(0);
  });

  it('al 50 % o más se queda en casa y cuenta como descanso, sin perder nada', () => {
    const next = closeDay(withDay('2026-09-28', 50), '2026-09-28', ctx, 0);
    expect(next.days['2026-09-28']).toMatchObject({ closed: true, expedition: null, restDay: true });
    expect(next.sparks).toBe(0);
  });

  it('sin días de descanso activados, quedarse en casa no es descanso', () => {
    const next = closeDay(withDay('2026-09-28', 75), '2026-09-28', { ...ctx, restDays: false }, 0);
    expect(next.days['2026-09-28'].restDay).toBe(false);
  });

  it('como mucho 2 días de descanso por semana (lunes a domingo)', () => {
    // 2026-09-28 es lunes.
    let s: GameState = EMPTY_STATE;
    for (const d of ['2026-09-28', '2026-09-29', '2026-09-30']) s = closeDay(withDay(d, 100, s), d, ctx, 0);
    expect(['2026-09-28', '2026-09-29', '2026-09-30'].map((d) => s.days[d].restDay)).toEqual([true, true, false]);
  });

  it('si había otra postal sin ver, se guarda sola en el álbum', () => {
    let s = closeDay(withDay('2026-09-28', 0), '2026-09-28', ctx, 1);
    s = closeDay(withDay('2026-09-29', 0, s), '2026-09-29', ctx, 2);
    expect(s.album.map((a) => a.date)).toEqual(['2026-09-28']);
    expect(s.pending?.date).toBe('2026-09-29');
  });

  it('cerrar dos veces no cambia nada', () => {
    const once = closeDay(withDay('2026-09-28', 0), '2026-09-28', ctx, 0);
    expect(closeDay(once, '2026-09-28', ctx, 0)).toBe(once);
  });
});

describe('syncToday', () => {
  it('el primer día elige destino y apunta el umbral', () => {
    const s = syncToday(EMPTY_STATE, '2026-09-28', ctx, MORNING('2026-09-28'), 25);
    expect(s.days['2026-09-28'].destinationId).toBeTruthy();
    expect(s.days['2026-09-28'].maxThreshold).toBe(25);
    expect(s.days['2026-09-28'].closed).toBe(false);
  });

  it('a las 21:00 cierra el día', () => {
    const s = syncToday(EMPTY_STATE, '2026-09-28', ctx, atTime('2026-09-28', '21:00'), 0);
    expect(s.days['2026-09-28'].closed).toBe(true);
  });

  it('no cambia nada si ya está al día (mismo objeto)', () => {
    const s = syncToday(EMPTY_STATE, '2026-09-28', ctx, MORNING('2026-09-28'), 25);
    expect(syncToday(s, '2026-09-28', ctx, MORNING('2026-09-28'), 25)).toBe(s);
  });

  it('cierra el día pasado y rellena los días sin abrir la app', () => {
    const monday = syncToday(EMPTY_STATE, '2026-09-28', ctx, MORNING('2026-09-28'), 0);
    const thursday = syncToday(monday, '2026-10-01', ctx, MORNING('2026-10-01'), 0);
    expect(thursday.days['2026-09-28'].closed).toBe(true);
    expect(thursday.days['2026-09-29']).toMatchObject({ missed: true, closed: true });
    expect(thursday.days['2026-09-30']).toMatchObject({ missed: true, closed: true });
    expect(thursday.days['2026-10-01'].closed).toBe(false);
  });
});

describe('recordThreshold', () => {
  it('solo sube, y no con el día cerrado', () => {
    const s = withDay('2026-09-28', 50);
    expect(recordThreshold(s, '2026-09-28', 25)).toBe(s);
    expect(recordThreshold(s, '2026-09-28', 75).days['2026-09-28'].maxThreshold).toBe(75);
    const closed = closeDay(s, '2026-09-28', ctx, 0);
    expect(recordThreshold(closed, '2026-09-28', 100)).toBe(closed);
  });
});

describe('streakFor', () => {
  it('los descansos no rompen la racha y hoy no cuenta hasta cerrarse', () => {
    let s: GameState = EMPTY_STATE;
    s = closeDay(withDay('2026-09-28', 0, s), '2026-09-28', ctx, 0); // expedición
    s = closeDay(withDay('2026-09-29', 100, s), '2026-09-29', ctx, 0); // descanso
    s = closeDay(withDay('2026-09-30', 0, s), '2026-09-30', ctx, 0); // expedición
    s = withDay('2026-10-01', 0, s); // hoy, abierto
    expect(streakFor(s, '2026-10-01')).toBe(2);
  });

  it('un día sin expedición ni descanso la corta', () => {
    let s: GameState = EMPTY_STATE;
    s = closeDay(withDay('2026-09-28', 0, s), '2026-09-28', ctx, 0);
    s = closeDay(withDay('2026-09-29', 100, s), '2026-09-29', { ...ctx, restDays: false }, 0);
    s = closeDay(withDay('2026-09-30', 0, s), '2026-09-30', ctx, 0);
    expect(streakFor(s, '2026-09-30')).toBe(1);
  });
});

describe('litFor, evolutionFor y expeditionProgress', () => {
  it('tramos de luz según el umbral', () => {
    expect([0, 25, 50, 75, 100].map((t) => litFor({ ...emptyDay('d'), maxThreshold: t as 0 }))).toEqual([4, 3, 2, 1, 1]);
    expect(litFor(undefined)).toBe(0);
    expect(litFor({ ...emptyDay('d'), restDay: true })).toBe(0);
  });

  it('una etapa cada 7 días brillantes, con tope en Aurora', () => {
    expect(evolutionFor(0)).toMatchObject({ stage: 0, inStage: 0, maxed: false });
    expect(evolutionFor(8)).toMatchObject({ stage: 1, inStage: 1 });
    expect(evolutionFor(100)).toMatchObject({ stage: 3, inStage: 7, maxed: true });
  });

  it('el progreso de la expedición va de 0 a 1 entre despertar y las 21:00', () => {
    expect(expeditionProgress('2026-09-28', '07:00', atTime('2026-09-28', '06:00'))).toBe(0);
    expect(expeditionProgress('2026-09-28', '07:00', atTime('2026-09-28', '14:00'))).toBeCloseTo(0.5);
    expect(expeditionProgress('2026-09-28', '07:00', atTime('2026-09-28', '23:00'))).toBe(1);
  });
});

describe('noche tranquila', () => {
  const yesterday = '2026-09-27';
  const today = '2026-09-28';
  const withYesterday = withDay(today, 25, withDay(yesterday, 25));

  it('si la noche anterior no se pidió «5 min más», trae chispas de más', () => {
    const bonus = closeDay(withYesterday, today, ctx, 0).pending!.result;
    const plain = closeDay(withDay(today, 25), today, ctx, 0).pending!.result;
    expect(bonus.nightBonus).toBe(NIGHT_BONUS);
    expect(bonus.sparks).toBe(plain.sparks + NIGHT_BONUS);
  });

  it('sin bonus si esa noche se pidió «5 min más»', () => {
    const restless = markRestlessNight(withYesterday, today);
    expect(closeDay(restless, today, ctx, 0).pending!.result.nightBonus).toBeUndefined();
  });

  it('sin bonus el primer día: la app no estaba la noche anterior', () => {
    expect(closeDay(withDay(today, 25), today, ctx, 0).pending!.result.nightBonus).toBeUndefined();
  });

  it('guarda solo las últimas 14 noches movidas, sin repetir', () => {
    let s = EMPTY_STATE;
    for (let d = 1; d <= 20; d++) s = markRestlessNight(s, `2026-09-${String(d).padStart(2, '0')}`);
    s = markRestlessNight(s, '2026-09-20');
    expect(s.restlessNights).toHaveLength(14);
    expect(s.restlessNights[0]).toBe('2026-09-07');
  });
});
