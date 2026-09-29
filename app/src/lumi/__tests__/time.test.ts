import { describe, expect, it } from '@jest/globals';

import { stepTime, toHHMM, toMinutes } from '@/lumi/time';

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
