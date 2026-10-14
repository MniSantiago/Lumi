import { describe, expect, it } from '@jest/globals';

import { ITEM_CATALOG } from '@/game/catalog';
import { EMPTY_STATE, type GameState } from '@/game/engine';
import { toGameState } from '@/game/store';
import {
  balance,
  buy,
  equip,
  grantPlusAccessories,
  isPlusAccessory,
  ITEM_SLOTS,
  missingSparks,
  PLUS_ACCESSORIES,
  previewOutfit,
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
    expect(equip(rich, 'gorro-dormir')).toBe(rich);
    const bought = buy(rich, 'gorro-dormir');
    expect(equip(bought, 'gorro-dormir').outfit.cabeza).toBe('gorro-dormir');
  });
  it('un accesorio sustituye al objeto que hubiera en su hueco', () => {
    const s = equip(buy(equip(rich, 'seta'), 'gorro-dormir'), 'gorro-dormir');
    expect(s.outfit.cabeza).toBe('gorro-dormir');
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

describe('accesorios de Plus', () => {
  const plusId = PLUS_ACCESSORIES[0].id;
  it('hay al menos uno, y no es de los que se compran', () => {
    expect(PLUS_ACCESSORIES.length).toBeGreaterThan(0);
    expect(isPlusAccessory(plusId)).toBe(true);
    expect(isPlusAccessory('gorro-dormir')).toBe(false);
  });
  it('no se compra con chispas por mucho saldo que haya', () => {
    const loaded = { ...EMPTY_STATE, sparks: 9999 };
    expect(buy(loaded, plusId)).toBe(loaded);
  });
  it('no pide chispas: no está a la venta', () => {
    expect(missingSparks(EMPTY_STATE, plusId)).toBe(0);
  });
  it('con Plus se tiene desde el primer momento, y se puede poner', () => {
    const s = grantPlusAccessories(EMPTY_STATE, true);
    expect(s.unlocked).toContain(plusId);
    expect(s.spent).toBe(0);
    expect(equip(s, plusId).outfit.cabeza).toBe(plusId);
  });
  it('sin Plus no da nada y devuelve el mismo objeto', () => {
    expect(grantPlusAccessories(EMPTY_STATE, false)).toBe(EMPTY_STATE);
  });
  it('no lo da dos veces', () => {
    const once = grantPlusAccessories(EMPTY_STATE, true);
    expect(grantPlusAccessories(once, true)).toBe(once);
  });
  it('si la suscripción se va, lo que ya llevaba puesto se queda', () => {
    const withPlus = equip(grantPlusAccessories(EMPTY_STATE, true), plusId);
    const after = sanitizeWardrobe(grantPlusAccessories(withPlus, false));
    expect(after.unlocked).toContain(plusId);
    expect(after.outfit.cabeza).toBe(plusId);
  });
});

describe('previewOutfit', () => {
  it('pone el accesorio en su hueco sin tocar los demás', () => {
    const outfit = { cabeza: 'seta', cuello: 'bufanda', companion: 'musguito' };
    expect(previewOutfit(outfit, 'medallon-sol')).toEqual({ cabeza: 'seta', cuello: 'medallon-sol', companion: 'musguito' });
  });
  it('no modifica el traje original', () => {
    const outfit = { cabeza: 'seta' };
    previewOutfit(outfit, 'corona-luz');
    expect(outfit).toEqual({ cabeza: 'seta' });
  });
  it('rellena un hueco vacío', () => {
    expect(previewOutfit({}, 'varita-luz')).toEqual({ mano: 'varita-luz' });
  });
  it('devuelve el mismo objeto si el id no existe o ya está puesto', () => {
    const outfit = { cabeza: 'corona-luz' };
    expect(previewOutfit(outfit, 'nada')).toBe(outfit);
    expect(previewOutfit(outfit, 'corona-luz')).toBe(outfit);
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
