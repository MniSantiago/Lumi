import { describe, expect, it } from '@jest/globals';

import { meterNote } from '@/lumi/meter';

describe('nota del medidor "Luz de hoy"', () => {
  it('usa el límite real del usuario, no siempre una hora', () => {
    expect(meterNote(0, 30)).toBe('Menos de 8 min de 30 min');
    expect(meterNote(25, 60)).toBe('Entre 15 min y 30 min');
    expect(meterNote(50, 120)).toBe('Entre 1 h y 1 h 30');
    expect(meterNote(75, 90)).toBe('Más de 1 h 08 de 1 h 30');
    expect(meterNote(100, 45)).toBe('Has llegado a tu límite (45 min)');
  });
});
