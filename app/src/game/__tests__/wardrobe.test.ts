import { describe, expect, it } from '@jest/globals';

import { ITEM_CATALOG } from '@/game/catalog';
import { EMPTY_STATE, type GameState } from '@/game/engine';
import { toGameState } from '@/game/store';
import {
  balance,
  buy,
  equip,
  ITEM_SLOTS,
  missingSparks,
  sanitizeWardrobe,
  setCompanion,
  SLOTS,
  SPECIAL_ACCESSORIES,
  unequip,
} from '@/game/wardrobe';

const rich: GameState = { ...EMPTY_STATE, sparks: 500, items: ['bufanda', 'farolillo', 'seta'], friends: ['musguito'] };

describe('catálogo del armario', () => {
  it('cada objeto del catálogo tiene hueco válido', () => {
    for (const item of ITEM_CATALOG) expect(SLOTS).toContain(ITEM_SLOTS[item.id]);
  });
  it('no sobran huecos de objetos que no existen', () => {
    const ids = new Set(ITEM_CATALOG.map((i) => i.id));
    for (const id of Object.keys(ITEM_SLOTS)) expect(ids.has(id)).toBe(true);
  });
  it('accesorios: ids únicos, precio positivo entero, hueco válido, sin chocar con objetos', () => {
    const ids = SPECIAL_ACCESSORIES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of SPECIAL_ACCESSORIES) {
      expect(Number.isInteger(a.price) && a.price > 0).toBe(true);
      expect(SLOTS).toContain(a.slot);
      expect(ITEM_SLOTS[a.id]).toBeUndefined();
    }
  });
});

describe('equip / unequip', () => {
  it('equipa un objeto poseído en su hueco', () => {
    expect(equip(rich, 'bufanda').outfit).toEqual({ cuello: 'bufanda' });
  });
  it('equipar dos objetos de huecos distintos los conserva', () => {
    expect(equip(equip(rich, 'seta'), 'bufanda').outfit).toEqual({ cabeza: 'seta', cuello: 'bufanda' });
  });
  it('ignora ids inexistentes y objetos no poseídos', () => {
    expect(equip(rich, 'nada')).toBe(rich);
    expect(equip(rich, 'catalejo')).toBe(rich);
  });
  it('un accesorio especial solo se pone si está comprado', () => {
    expect(equip(rich, 'corona-luz')).toBe(rich);
    const bought = buy(rich, 'corona-luz');
    expect(equip(bought, 'corona-luz').outfit.cabeza).toBe('corona-luz');
  });
  it('un accesorio sustituye al objeto que hubiera en su hueco', () => {
    const s = equip(buy(equip(rich, 'seta'), 'corona-luz'), 'corona-luz');
    expect(s.outfit.cabeza).toBe('corona-luz');
  });
  it('unequip quita el hueco y es no-op si está vacío', () => {
    const s = equip(rich, 'bufanda');
    expect(unequip(s, 'cuello').outfit).toEqual({});
    expect(unequip(rich, 'mano')).toBe(rich);
  });
});

describe('compañero', () => {
  it('solo amigos poseídos; null lo quita', () => {
    const s = setCompanion(rich, 'musguito');
    expect(s.outfit.companion).toBe('musguito');
    expect(setCompanion(rich, 'hollin')).toBe(rich);
    expect(setCompanion(s, null).outfit.companion).toBeUndefined();
  });
});

describe('buy', () => {
  const price = SPECIAL_ACCESSORIES.find((a) => a.id === 'gorro-dormir')!.price;
  it('descuenta y desbloquea con saldo justo', () => {
    const s = buy({ ...EMPTY_STATE, sparks: price }, 'gorro-dormir');
    expect(s.unlocked).toEqual(['gorro-dormir']);
    expect(s.spent).toBe(price);
    expect(balance(s)).toBe(0);
  });
  it('no compra con una chispa de menos', () => {
    const s = { ...EMPTY_STATE, sparks: price - 1 };
    expect(buy(s, 'gorro-dormir')).toBe(s);
  });
  it('no compra dos veces ni ids inexistentes', () => {
    const once = buy(rich, 'gorro-dormir');
    expect(buy(once, 'gorro-dormir')).toBe(once);
    expect(buy(rich, 'nada')).toBe(rich);
  });
  it('el saldo nunca es negativo', () => {
    expect(balance({ ...EMPTY_STATE, sparks: 5, spent: 50 })).toBe(0);
  });
});

describe('sanitizeWardrobe', () => {
  it('rellena los campos que faltan en un estado antiguo', () => {
    const old = { ...EMPTY_STATE } as Partial<GameState>;
    delete old.outfit;
    delete old.unlocked;
    delete old.spent;
    const s = sanitizeWardrobe(old as GameState);
    expect(s.outfit).toEqual({});
    expect(s.unlocked).toEqual([]);
    expect(s.spent).toBe(0);
  });
  it('tolera tipos corruptos', () => {
    const bad = { ...EMPTY_STATE, outfit: 'x', unlocked: 7, spent: 'y' } as unknown as GameState;
    const s = sanitizeWardrobe(bad);
    expect(s.outfit).toEqual({});
    expect(s.unlocked).toEqual([]);
    expect(s.spent).toBe(0);
  });
  it('descarta lo puesto que ya no se posee o está en otro hueco', () => {
    const s = sanitizeWardrobe({
      ...rich,
      outfit: { cabeza: 'catalejo', cuello: 'seta', mano: 'farolillo', companion: 'hollin' },
    });
    expect(s.outfit).toEqual({ mano: 'farolillo' });
  });
  it('descarta accesorios desbloqueados que no existen y duplicados', () => {
    const s = sanitizeWardrobe({ ...rich, unlocked: ['corona-luz', 'fantasma', 'corona-luz'], spent: 150 });
    expect(s.unlocked).toEqual(['corona-luz']);
  });
  it('devuelve el mismo objeto si no hay nada que corregir', () => {
    expect(sanitizeWardrobe(rich)).toBe(rich);
  });
});

describe('toGameState', () => {
  it('carga un estado guardado antes del armario sin perder nada', () => {
    const old = { version: 1, days: {}, album: [], items: ['seta'], friends: [], sparks: 40, pending: null, restlessNights: [] };
    const s = toGameState(old);
    expect(s.sparks).toBe(40);
    expect(s.items).toEqual(['seta']);
    expect(s.outfit).toEqual({});
    expect(s.unlocked).toEqual([]);
    expect(s.spent).toBe(0);
  });
  it('limpia un outfit con objetos no poseídos al restaurar', () => {
    const s = toGameState({ ...EMPTY_STATE, outfit: { cabeza: 'seta' } });
    expect(s.outfit).toEqual({});
  });
});

describe('missingSparks', () => {
  const price = SPECIAL_ACCESSORIES.find((a) => a.id === 'gorro-dormir')!.price;
  it('dice cuántas chispas faltan para un accesorio', () => {
    expect(missingSparks({ ...EMPTY_STATE, sparks: price - 7 }, 'gorro-dormir')).toBe(7);
  });
  it('descuenta lo ya gastado (usa el saldo, no el total ganado)', () => {
    expect(missingSparks({ ...EMPTY_STATE, sparks: 100, spent: 100 }, 'gorro-dormir')).toBe(price);
  });
  it('es 0 si alcanza, si ya está comprado o si el id no existe', () => {
    expect(missingSparks({ ...EMPTY_STATE, sparks: price }, 'gorro-dormir')).toBe(0);
    expect(missingSparks(buy({ ...EMPTY_STATE, sparks: 999 }, 'gorro-dormir'), 'gorro-dormir')).toBe(0);
    expect(missingSparks(EMPTY_STATE, 'nada')).toBe(0);
  });
});
