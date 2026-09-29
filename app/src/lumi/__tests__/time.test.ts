import { describe, expect, it } from '@jest/globals';

import { isNightTime, stepTime, toHHMM, toMinutes } from '@/lumi/time';

describe('horas del horario de noche', () => {
  it('convierte entre HH:MM y minutos', () => {
    expect(toMinutes('23:30')).toBe(1410);
    expect(toHHMM(1410)).toBe('23:30');
    expect(toHHMM(-30)).toBe('23:30');
  });

  it('da la vuelta a medianoche en pasos de media hora', () => {
    expect(stepTime('23:30', 1)).toBe('00:00');
    expect(stepTime('00:00', -1)).toBe('23:30');
    expect(stepTime('07:00', 1)).toBe('07:30');
  });
});

describe('isNightTime', () => {
  const at = (hhmm: string) => new Date(`2026-09-29T${hhmm}:00`);

  it('con un horario que cruza la medianoche', () => {
    expect(isNightTime('23:00', '07:00', at('23:30'))).toBe(true);
    expect(isNightTime('23:00', '07:00', at('03:00'))).toBe(true);
    expect(isNightTime('23:00', '07:00', at('07:00'))).toBe(false);
    expect(isNightTime('23:00', '07:00', at('12:00'))).toBe(false);
  });

  it('con un horario dentro del mismo día', () => {
    expect(isNightTime('01:00', '06:00', at('02:00'))).toBe(true);
    expect(isNightTime('01:00', '06:00', at('23:00'))).toBe(false);
  });

  it('si empieza y acaba a la misma hora, nunca es de noche', () => {
    expect(isNightTime('07:00', '07:00', at('07:00'))).toBe(false);
  });
});
