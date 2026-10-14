import { describe, expect, it } from '@jest/globals';

import { DESTINATIONS } from '@/game/destinations';
import { MAX_ITEMS_PER_POSTCARD, pickDestination, rewardTier, rollExpedition } from '@/game/rewards';
import type { Threshold } from '@/lumi/states';

const owned = { items: [] as string[], friends: [] as string[] };
const SEEDS = Array.from({ length: 400 }, (_, i) => i * 7919 + 13);

function counts(threshold: Threshold) {
  const out: number[] = [];
  for (const d of DESTINATIONS) {
    for (const seed of SEEDS) out.push(rollExpedition(d, { owned, threshold, seed }).itemIds.length);
  }
  return out;
}

describe('rollExpedition: objetos por postal', () => {
  it('nunca pasa del tope y siempre trae al menos uno', () => {
    for (const th of [0, 25, 50, 75, 100] as Threshold[]) {
      for (const n of counts(th)) {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(MAX_ITEMS_PER_POSTCARD);
      }
    }
  });

  it('lo normal es 1; con poco uso hay más segundos objetos que con uso medio', () => {
    const share2 = (th: Threshold) => {
      const c = counts(th);
      return c.filter((n) => n === 2).length / c.length;
    };
    const low = share2(0);
    const mid = share2(25);
    expect(low).toBeLessThan(0.5);
    expect(low).toBeGreaterThan(mid);
    expect(share2(50)).toBe(0);
  });

  it('es determinista por semilla', () => {
    const d = DESTINATIONS[0];
    expect(rollExpedition(d, { owned, threshold: 0, seed: 42 })).toEqual(
      rollExpedition(d, { owned, threshold: 0, seed: 42 }),
    );
  });

  it('mantiene las chispas y las amigas por umbral', () => {
    expect(rewardTier(0)).toMatchObject({ friendChance: 0.35, sparksMin: 16, sparksMax: 24 });
    expect(rewardTier(25)).toMatchObject({ friendChance: 0.2, sparksMin: 10, sparksMax: 17 });
  });
});

describe('orden de las zonas Plus', () => {
  const CHAPTERS = [2, 3, 4];

  it('la zona Plus abre su capítulo, para poder llegar dentro de la prueba', () => {
    for (const chapter of CHAPTERS) {
      const order = DESTINATIONS.filter((d) => d.chapter === chapter);
      expect(order[0].plus).toBe(true);
    }
  });

  it('su puerta de días de luz no es más tardía que la de su capítulo', () => {
    for (const chapter of CHAPTERS) {
      const all = DESTINATIONS.filter((d) => d.chapter === chapter);
      const opens = Math.min(...all.map((d) => d.unlockAfterBrightDays));
      expect(all[0].unlockAfterBrightDays).toBe(opens);
    }
  });

  it('con Plus, cada capítulo empieza por su zona Plus en cuanto se abre', () => {
    for (const chapter of CHAPTERS) {
      const all = DESTINATIONS.filter((d) => d.chapter === chapter);
      const brightDays = all[0].unlockAfterBrightDays;
      // Lo anterior ya visto: lo siguiente que toca es la zona Plus del capítulo.
      const visited = DESTINATIONS.filter((d) => d.chapter < chapter).map((d) => d.id);
      const next = pickDestination({ brightDays, isPlus: true, visited, seed: 1 });
      expect(next.id).toBe(all[0].id);
    }
  });

  it('el final de la historia sigue siendo el último lugar', () => {
    expect(DESTINATIONS[DESTINATIONS.length - 1].id).toBe('jardin-estrellas');
  });
});
