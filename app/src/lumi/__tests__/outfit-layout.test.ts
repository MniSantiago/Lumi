import { describe, expect, it } from '@jest/globals';

import { placeItem } from '@/lumi/outfit-layout';

const art = { w: 200, h: 200, x: 0, y: 0 };

describe('placeItem', () => {
  it('centra la pieza en el ancla (fracciones de la ilustración)', () => {
    const p = placeItem([0.5, 0.25], art, 200, 'cabeza', 'seta');
    expect(p.left + p.size / 2).toBeCloseTo(100);
    expect(p.top + p.size / 2).toBeCloseTo(50);
  });
  it('respeta el desplazamiento de la ilustración dentro del cuadrado', () => {
    const p = placeItem([0.5, 0.5], { w: 100, h: 200, x: 50, y: 0 }, 200, 'mano', 'taza');
    expect(p.left + p.size / 2).toBeCloseTo(100);
    expect(p.top + p.size / 2).toBeCloseTo(100);
  });
  it('multiplica el tamaño base por la escala del objeto', () => {
    const base = placeItem([0.5, 0.5], art, 200, 'cabeza', 'seta', {}).size;
    expect(placeItem([0.5, 0.5], art, 200, 'cabeza', 'seta', { scale: 2 }).size).toBeCloseTo(base * 2);
  });
  it('usa el ajuste del catálogo por defecto (el catalejo se gira)', () => {
    expect(placeItem([0.5, 0.5], art, 200, 'mano', 'catalejo').rotate).toBe(-25);
  });
});
