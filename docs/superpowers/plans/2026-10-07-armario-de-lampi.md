# Armario de Lampi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que Lampi pueda llevar puestos los objetos que ha traído, un amigo de compañero y accesorios especiales comprados con chispas.

**Architecture:** Dominio puro en `game/wardrobe.ts` (equipar, comprar, saneado) sobre `GameState`, expuesto por `useGame()`. El dibujo es una capa `Outfit` dentro del contenedor animado de `LumiAvatar`, colocada con anclas por estado en un JSON compartido con el script de previsualización. La UI es una hoja `/armario` más accesos desde el Hogar y la Colección.

**Tech Stack:** Expo SDK 57 / React Native 0.86, Expo Router, Reanimated, Jest (`jest-expo`), Python + PIL para el arte (APIMart `seedream-5-0-lite`).

**Spec:** `docs/superpowers/specs/2026-10-07-armario-de-lampi-design.md`

## Global Constraints

- Idiomas: todo texto de usuario con `tr({ es, en, zh, hi, fr })` (`@/i18n`).
- `GameState` sigue en `version: 1`; los campos nuevos tienen valor por defecto en `EMPTY_STATE` (sin migración).
- `sparks` = total ganado (no baja); saldo = `sparks - spent`, nunca negativo.
- Los huecos son `'cabeza' | 'cuello' | 'mano'`; un objeto = un hueco; el compañero es aparte y solo admite amigos poseídos.
- Equipar es gratis para objetos de `items` y accesorios de `unlocked`. Sin dinero real, sin caducidades ni presión.
- Rutas en `app/src/app/` (Expo Router); código no-ruta fuera de esa carpeta.
- Antes de cerrar cada tarea: `cd app && npx tsc --noEmit && npx expo lint && npx jest`.
- Cada commit termina con `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Rama: `armario-lampi`. No incluir en los commits los cambios ajenos del árbol (`.gitignore`, `screen-time/native.ts`, `assets/apimart/videos.json`…): `git add` solo de los archivos de cada tarea.

## Review Focus

- Estado antiguo sin `outfit`/`unlocked`/`spent` (o con tipos corruptos) debe cargar sin romper → Task 1 (`sanitizeWardrobe`) y Task 2 (`toGameState`).
- Restaurar desde la cuenta un estado que lleva puesto un objeto que ya no se posee → se descarta del `outfit` (Task 1).
- Comprar con saldo exacto, con saldo de más, con 1 chispa de menos y dos veces el mismo accesorio → Task 1.
- Equipar un objeto en un hueco que no le corresponde, un id inexistente o un objeto no poseído → no hace nada (Task 1).
- Textos largos (fr/hi) en botones y precios del armario no deben desbordar → Task 5 (`numberOfLines`, revisión visual).

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `app/src/game/types.ts` (mod) | tipos `Slot`, `Outfit` |
| `app/src/game/wardrobe.ts` (nuevo) | huecos de los 36 objetos, accesorios especiales, reglas puras |
| `app/src/game/engine.ts` (mod) | campos nuevos de `GameState` y `EMPTY_STATE` |
| `app/src/game/store.tsx` (mod) | acciones y saldo en `useGame()`, saneado al cargar |
| `app/src/components/collection-icon.tsx` (mod) | registrar el arte de los 9 accesorios |
| `app/assets/collection/<id>.webp` (nuevos) | arte de los accesorios (APIMart) |
| `tools/apimart_generate.py` (mod) | hoja `objetos-5` con los accesorios |
| `app/src/lumi/outfit-anchors.json` (nuevo) | anclas por estado, fuente única TS + Python |
| `tools/outfit_preview.py` (nuevo) | compone objetos sobre los PNG de Lampi para afinar |
| `app/src/components/outfit.tsx` (nuevo) | capa de accesorios y compañero |
| `app/src/components/lumi-avatar.tsx` (mod) | prop `outfit`, pinta `<OutfitLayer>` |
| `app/src/app/armario.tsx` (nuevo) + `_layout.tsx` (mod) | hoja del armario |
| `app/src/app/(tabs)/index.tsx`, `coleccion.tsx`, `components/collection-detail.tsx`, `tour/definitions.ts` (mod) | accesos y saldo |

Desvíos respecto a la spec (decididos al planificar): el hueco y el `fit` de los objetos viven en `wardrobe.ts` (`ITEM_SLOTS`, `ITEM_FIT`) en vez de en `CatalogEntry`, para no tocar los 5 ficheros de contenido; `equip(state, id)` deduce el hueco del id; hay **9** accesorios especiales (la hoja de APIMart es 3×3), total 830 chispas; la postal nocturna no muestra a Lampi, así que Lampi vestida se ve en Hogar y Armario.

---

### Task 1: Dominio del armario

**Files:**
- Modify: `app/src/game/types.ts` (añadir al final)
- Modify: `app/src/game/engine.ts:48-71` (GameState + EMPTY_STATE)
- Create: `app/src/game/wardrobe.ts`
- Test: `app/src/game/__tests__/wardrobe.test.ts`

**Interfaces:**
- Produces (types.ts): `type Slot = 'cabeza' | 'cuello' | 'mano'`; `type Outfit = { cabeza?: string; cuello?: string; mano?: string; companion?: string }`.
- Produces (engine.ts): `GameState` gana `outfit: Outfit; unlocked: string[]; spent: number`.
- Produces (wardrobe.ts): `SLOTS: Slot[]`; `ITEM_SLOTS: Record<string, Slot>`; `ITEM_FIT: Record<string, { scale?: number; rotate?: number }>`; `type SpecialAccessory = { id: string; slot: Slot; price: number; icon: string; name: string; a: string; feminine: boolean }`; `SPECIAL_ACCESSORIES: SpecialAccessory[]`; `specialById(id)`; `slotOf(id): Slot | undefined`; `balance(state): number`; `canWear(state, id): boolean`; `equip(state, id): GameState`; `unequip(state, slot): GameState`; `setCompanion(state, friendId: string | null): GameState`; `buy(state, id): GameState`; `sanitizeWardrobe(state): GameState`; `wardrobeEntry(id): { id; name; icon } | undefined` (objeto o accesorio).

- [ ] **Step 1: Escribir el test que falla**

`app/src/game/__tests__/wardrobe.test.ts`:

```ts
import { describe, expect, it } from '@jest/globals';

import { ITEM_CATALOG } from '@/game/catalog';
import { EMPTY_STATE, type GameState } from '@/game/engine';
import {
  balance,
  buy,
  equip,
  ITEM_SLOTS,
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
  it('sustituye lo que hubiera en ese hueco', () => {
    const s = equip(equip(rich, 'seta'), 'seta');
    expect(s.outfit).toEqual({ cabeza: 'seta' });
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
  it('descarta accesorios desbloqueados que no existen y limita spent a lo gastado en compras', () => {
    const s = sanitizeWardrobe({ ...rich, unlocked: ['corona-luz', 'fantasma', 'corona-luz'], spent: 150 });
    expect(s.unlocked).toEqual(['corona-luz']);
  });
  it('devuelve el mismo objeto si no hay nada que corregir', () => {
    expect(sanitizeWardrobe(rich)).toBe(rich);
  });
});
```

- [ ] **Step 2: Ver que falla**

Run: `cd app && npx jest src/game/__tests__/wardrobe.test.ts`
Expected: FAIL — `Cannot find module '@/game/wardrobe'`.

- [ ] **Step 3: Tipos y estado**

Añadir al final de `app/src/game/types.ts`:

```ts
/** Huecos del cuerpo de Lampi donde se puede llevar un objeto. */
export type Slot = 'cabeza' | 'cuello' | 'mano';

/** Lo que lleva puesto Lampi (ids de objetos o accesorios) y el amigo que la acompaña. */
export type Outfit = { cabeza?: string; cuello?: string; mano?: string; companion?: string };
```

En `app/src/game/engine.ts`, importar `Outfit` en la línea de imports de `@/game/types` (añadirlo a la lista), y en `GameState` añadir tras `restlessNights`:

```ts
  /** Lo que lleva puesto Lampi y su compañero. */
  outfit: Outfit;
  /** Ids de accesorios especiales comprados con chispas. */
  unlocked: string[];
  /** Chispas gastadas (`sparks` es el total ganado; el saldo es `sparks - spent`). */
  spent: number;
```

y en `EMPTY_STATE`, tras `restlessNights: [],`: `outfit: {}, unlocked: [], spent: 0,`.

- [ ] **Step 4: Implementar `wardrobe.ts`**

```ts
import { FRIEND_CATALOG, ITEM_CATALOG, itemById } from '@/game/catalog';
import type { GameState } from '@/game/engine';
import type { Outfit, Slot } from '@/game/types';
import { tr } from '@/i18n';

/**
 * Armario de Lampi: dónde se lleva cada objeto, los accesorios especiales que se
 * compran con chispas y las reglas (puras) para equipar y comprar.
 */
export const SLOTS: Slot[] = ['cabeza', 'cuello', 'mano'];

/** Hueco de cada objeto del catálogo (los 36). */
export const ITEM_SLOTS: Record<string, Slot> = {
  trebol: 'cabeza', seta: 'cabeza', bellota: 'cabeza', pluma: 'cabeza', hoja: 'cabeza',
  'flor-luna': 'cabeza', 'trocito-luna': 'cabeza', nenufar: 'cabeza', pina: 'cabeza', 'polvo-estrella': 'cabeza',
  bufanda: 'cuello', moneda: 'cuello', llave: 'cuello', boton: 'cuello', concha: 'cuello',
  campanilla: 'cuello', cristal: 'cuello', geoda: 'cuello', reloj: 'cuello',
  farolillo: 'mano', catalejo: 'mano', mapa: 'mano', carta: 'mano', taza: 'mano', vela: 'mano',
  fresa: 'mano', galleta: 'mano', barquito: 'mano', gota: 'mano', burbuja: 'mano', engranaje: 'mano',
  piedra: 'mano', semilla: 'mano', canica: 'mano', calcetin: 'mano', ovillo: 'mano',
};

/** Ajuste fino por objeto (escala y giro en grados sobre el tamaño base del hueco). Se afina con `tools/outfit_preview.py`. */
export const ITEM_FIT: Record<string, { scale?: number; rotate?: number }> = {};

export type SpecialAccessory = {
  id: string;
  slot: Slot;
  price: number;
  /** Clave del dibujo en `components/collection-icon.tsx`. */
  icon: string;
  name: string;
  /** Con artículo indefinido: "una corona de luz". */
  a: string;
  feminine: boolean;
};

/** Accesorios que no salen de las postales: se compran con chispas (un solo sitio para ajustar precios). */
export const SPECIAL_ACCESSORIES: SpecialAccessory[] = [
  {
    id: 'gorro-dormir', slot: 'cabeza', price: 50, icon: 'gorro-dormir', feminine: false,
    name: tr({ es: 'Gorro de dormir', en: 'Nightcap', zh: '睡帽', hi: 'सोने की टोपी', fr: 'Bonnet de nuit' }),
    a: tr({ es: 'un gorro de dormir', en: 'a nightcap', zh: '一顶睡帽', hi: 'एक सोने की टोपी', fr: 'un bonnet de nuit' }),
  },
  {
    id: 'antifaz-estrellas', slot: 'cabeza', price: 70, icon: 'antifaz-estrellas', feminine: false,
    name: tr({ es: 'Antifaz de estrellas', en: 'Star eye mask', zh: '星星眼罩', hi: 'तारों वाला आई मास्क', fr: 'Masque d’étoiles' }),
    a: tr({ es: 'un antifaz de estrellas', en: 'a star eye mask', zh: '一个星星眼罩', hi: 'एक तारों वाला आई मास्क', fr: 'un masque d’étoiles' }),
  },
  {
    id: 'corona-luz', slot: 'cabeza', price: 150, icon: 'corona-luz', feminine: true,
    name: tr({ es: 'Corona de luz', en: 'Crown of light', zh: '光之王冠', hi: 'रोशनी का ताज', fr: 'Couronne de lumière' }),
    a: tr({ es: 'una corona de luz', en: 'a crown of light', zh: '一顶光之王冠', hi: 'रोशनी का एक ताज', fr: 'une couronne de lumière' }),
  },
  {
    id: 'lazo-luna', slot: 'cuello', price: 60, icon: 'lazo-luna', feminine: false,
    name: tr({ es: 'Lazo de luna', en: 'Moon bow', zh: '月亮蝴蝶结', hi: 'चाँद का फ़ीता', fr: 'Nœud de lune' }),
    a: tr({ es: 'un lazo de luna', en: 'a moon bow', zh: '一个月亮蝴蝶结', hi: 'चाँद का एक फ़ीता', fr: 'un nœud de lune' }),
  },
  {
    id: 'medallon-sol', slot: 'cuello', price: 100, icon: 'medallon-sol', feminine: false,
    name: tr({ es: 'Medallón del sol', en: 'Sun locket', zh: '太阳吊坠', hi: 'सूरज का लॉकेट', fr: 'Médaillon du soleil' }),
    a: tr({ es: 'un medallón del sol', en: 'a sun locket', zh: '一枚太阳吊坠', hi: 'सूरज का एक लॉकेट', fr: 'un médaillon du soleil' }),
  },
  {
    id: 'capa-estrellas', slot: 'cuello', price: 120, icon: 'capa-estrellas', feminine: true,
    name: tr({ es: 'Capa de estrellas', en: 'Star cape', zh: '星星斗篷', hi: 'तारों वाली केप', fr: 'Cape d’étoiles' }),
    a: tr({ es: 'una capa de estrellas', en: 'a star cape', zh: '一件星星斗篷', hi: 'तारों वाली एक केप', fr: 'une cape d’étoiles' }),
  },
  {
    id: 'varita-luz', slot: 'mano', price: 80, icon: 'varita-luz', feminine: true,
    name: tr({ es: 'Varita de luz', en: 'Light wand', zh: '光之魔杖', hi: 'रोशनी की छड़ी', fr: 'Baguette de lumière' }),
    a: tr({ es: 'una varita de luz', en: 'a light wand', zh: '一根光之魔杖', hi: 'रोशनी की एक छड़ी', fr: 'une baguette de lumière' }),
  },
  {
    id: 'paraguas-nube', slot: 'mano', price: 90, icon: 'paraguas-nube', feminine: false,
    name: tr({ es: 'Paraguas de nube', en: 'Cloud umbrella', zh: '云朵雨伞', hi: 'बादल वाली छतरी', fr: 'Parapluie nuage' }),
    a: tr({ es: 'un paraguas de nube', en: 'a cloud umbrella', zh: '一把云朵雨伞', hi: 'बादल वाली एक छतरी', fr: 'un parapluie nuage' }),
  },
  {
    id: 'linterna-dorada', slot: 'mano', price: 110, icon: 'linterna-dorada', feminine: true,
    name: tr({ es: 'Linterna dorada', en: 'Golden lantern', zh: '金色提灯', hi: 'सुनहरी लालटेन', fr: 'Lanterne dorée' }),
    a: tr({ es: 'una linterna dorada', en: 'a golden lantern', zh: '一盏金色提灯', hi: 'एक सुनहरी लालटेन', fr: 'une lanterne dorée' }),
  },
];

export const specialById = (id: string) => SPECIAL_ACCESSORIES.find((a) => a.id === id);

/** Hueco de un objeto del catálogo o de un accesorio especial. */
export function slotOf(id: string): Slot | undefined {
  return ITEM_SLOTS[id] ?? specialById(id)?.slot;
}

/** Nombre e icono de lo que se puede llevar (objeto o accesorio). */
export function wardrobeEntry(id: string): { id: string; name: string; icon: string } | undefined {
  const special = specialById(id);
  if (special) return special;
  const item = itemById(id);
  return item && ITEM_SLOTS[id] ? item : undefined;
}

/** Chispas disponibles: lo ganado menos lo gastado (nunca negativo). */
export const balance = (state: GameState): number => Math.max(0, state.sparks - state.spent);

/** Se puede llevar: es un objeto poseído o un accesorio comprado. */
export function canWear(state: GameState, id: string): boolean {
  return specialById(id) ? state.unlocked.includes(id) : !!ITEM_SLOTS[id] && state.items.includes(id);
}

export function equip(state: GameState, id: string): GameState {
  const slot = slotOf(id);
  if (!slot || !canWear(state, id) || state.outfit[slot] === id) return state;
  return { ...state, outfit: { ...state.outfit, [slot]: id } };
}

export function unequip(state: GameState, slot: Slot): GameState {
  if (!state.outfit[slot]) return state;
  const { [slot]: _removed, ...rest } = state.outfit;
  return { ...state, outfit: rest };
}

export function setCompanion(state: GameState, friendId: string | null): GameState {
  if (friendId === null) {
    if (!state.outfit.companion) return state;
    const { companion: _removed, ...rest } = state.outfit;
    return { ...state, outfit: rest };
  }
  if (!state.friends.includes(friendId) || !FRIEND_CATALOG.some((f) => f.id === friendId)) return state;
  if (state.outfit.companion === friendId) return state;
  return { ...state, outfit: { ...state.outfit, companion: friendId } };
}

export function buy(state: GameState, id: string): GameState {
  const accessory = specialById(id);
  if (!accessory || state.unlocked.includes(id) || balance(state) < accessory.price) return state;
  return { ...state, unlocked: [...state.unlocked, id], spent: state.spent + accessory.price };
}

/**
 * Deja el armario coherente (al cargar o restaurar): rellena campos que faltan,
 * descarta lo que ya no existe o no se posee y no deja nada en un hueco ajeno.
 * Devuelve el mismo objeto si no hay nada que corregir.
 */
export function sanitizeWardrobe(state: GameState): GameState {
  const unlocked = Array.isArray(state.unlocked)
    ? [...new Set(state.unlocked.filter((id): id is string => typeof id === 'string' && !!specialById(id)))]
    : [];
  const spent = typeof state.spent === 'number' && Number.isFinite(state.spent) && state.spent >= 0 ? state.spent : 0;
  const raw: Outfit = state.outfit && typeof state.outfit === 'object' ? state.outfit : {};
  const probe = { ...state, unlocked } as GameState;

  const outfit: Outfit = {};
  for (const slot of SLOTS) {
    const id = raw[slot];
    if (typeof id === 'string' && slotOf(id) === slot && canWear(probe, id)) outfit[slot] = id;
  }
  if (typeof raw.companion === 'string' && state.friends.includes(raw.companion)) outfit.companion = raw.companion;

  const same =
    spent === state.spent &&
    Array.isArray(state.unlocked) &&
    unlocked.length === state.unlocked.length &&
    unlocked.every((id, i) => id === state.unlocked[i]) &&
    state.outfit === raw &&
    JSON.stringify(outfit) === JSON.stringify(raw);
  return same ? state : { ...state, outfit, unlocked, spent };
}

export { ITEM_CATALOG };
```

(Quitar la última línea `export { ITEM_CATALOG }` si el linter la marca; solo está para no dejar el import sin uso si no se usara — si `ITEM_CATALOG` no se usa, borrar también su import.)

- [ ] **Step 5: Ver que pasa**

Run: `cd app && npx jest src/game/__tests__/wardrobe.test.ts`
Expected: PASS (todas). Si «descarta accesorios… spent» falla por la expectativa de `spent`, el test solo comprueba `unlocked`: no cambiar la regla.

- [ ] **Step 6: Verificar y commit**

```bash
cd app && npx tsc --noEmit && npx expo lint && npx jest
git add app/src/game/types.ts app/src/game/engine.ts app/src/game/wardrobe.ts app/src/game/__tests__/wardrobe.test.ts
git commit -m "Armario: dominio puro (huecos, accesorios con chispas, equipar, comprar, saneado)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 2: API en el store del juego

**Files:**
- Modify: `app/src/game/store.tsx` (GameApi ~línea 60-110; `toGameState` ~línea 91; `restore`; `api`)
- Test: `app/src/game/__tests__/wardrobe.test.ts` (añadir bloque de carga)

**Interfaces:**
- Consumes: `sanitizeWardrobe`, `equip`, `unequip`, `setCompanion`, `buy`, `balance` (Task 1).
- Produces en `GameApi`: `balance: number; outfit: Outfit; unlocked: string[]; equip(id: string): void; unequip(slot: Slot): void; setCompanion(friendId: string | null): void; buy(id: string): boolean`.

- [ ] **Step 1: Test que falla** — añadir a `wardrobe.test.ts`:

```ts
import { toGameState } from '@/game/store';

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
```

Run: `cd app && npx jest src/game/__tests__/wardrobe.test.ts -t toGameState` → Expected: FAIL (`outfit` undefined en el primer caso o el segundo conserva `seta`).

- [ ] **Step 2: Implementar**

En `store.tsx`: importar `{ balance as walletBalance, buy as buyAccessory, equip as equipItem, sanitizeWardrobe, setCompanion as setCompanionOf, unequip as unequipSlot } from '@/game/wardrobe'` y `Outfit, Slot` desde `@/game/types`.

`toGameState` termina con `return sanitizeWardrobe({ ...EMPTY_STATE, ...parsed } as GameState);`.

En `GameApi` añadir (con comentarios en español como el resto):

```ts
  /** Chispas disponibles para gastar (`sparks` es el total ganado). */
  balance: number;
  /** Lo que lleva puesto Lampi y su compañero. */
  outfit: Outfit;
  /** Accesorios especiales comprados. */
  unlocked: string[];
  equip: (id: string) => void;
  unequip: (slot: Slot) => void;
  setCompanion: (friendId: string | null) => void;
  /** Compra un accesorio con chispas; false si no se pudo (saldo, ya comprado, no existe). */
  buy: (id: string) => boolean;
```

Callbacks junto a `markRestlessNight` (estables, con `setState` funcional):

```ts
  const equip = useCallback((id: string) => setState((s) => equipItem(s, id)), []);
  const unequip = useCallback((slot: Slot) => setState((s) => unequipSlot(s, slot)), []);
  const setCompanion = useCallback((friendId: string | null) => setState((s) => setCompanionOf(s, friendId)), []);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  const buy = useCallback((id: string) => {
    const next = buyAccessory(stateRef.current, id);
    if (next === stateRef.current) return false;
    setState((s) => buyAccessory(s, id));
    return true;
  }, []);
```

En `api` añadir `balance: walletBalance(state), outfit: state.outfit, unlocked: state.unlocked, equip, unequip, setCompanion, buy,` y sumar `equip, unequip, setCompanion, buy` a las dependencias del `useMemo`.

- [ ] **Step 3: Pasa** — `cd app && npx jest src/game/__tests__/wardrobe.test.ts` → PASS.

- [ ] **Step 4: Verificar y commit**

```bash
cd app && npx tsc --noEmit && npx expo lint && npx jest
git add app/src/game/store.tsx app/src/game/__tests__/wardrobe.test.ts
git commit -m "Armario: acciones y saldo en useGame, saneado al cargar y restaurar

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Arte de los 9 accesorios (APIMart)

**Files:**
- Modify: `tools/apimart_generate.py` (añadir hoja `objetos-5` tras `objetos-4`)
- Create: `app/assets/collection/{gorro-dormir,antifaz-estrellas,corona-luz,lazo-luna,medallon-sol,capa-estrellas,varita-luz,paraguas-nube,linterna-dorada}.webp`
- Modify: `app/src/components/collection-icon.tsx` (registrar en `ARTWORK`)

**Interfaces:**
- Produces: claves de icono = ids de `SPECIAL_ACCESSORIES` en `CollectionIcon`.

- [ ] **Step 1: Añadir la hoja** a `SHEETS` en `tools/apimart_generate.py`, después de `objetos-4`:

```python
    "objetos-5": {
        "size": "1:1", "ref": "assets/fa783b9e-d615-4151-b0b7-0f5ef3977612.png",
        "ids": ["gorro-dormir", "antifaz-estrellas", "corona-luz", "lazo-luna", "medallon-sol",
                "capa-estrellas", "varita-luz", "paraguas-nube", "linterna-dorada"],
        "prompt": "A 3x3 grid of nine small wearable accessories for a cute round character, shown alone as flat collectible icons for a cozy game inventory. " + STYLE_ICON + " " + cells([
            ["a soft lavender knitted nightcap with a little amber pom-pom", "a sleep eye mask in deep indigo with tiny golden stars", "a small glowing golden crown made of light with three soft points"],
            ["a soft peach-pink ribbon bow decorated with a tiny crescent moon", "a round golden locket pendant on a thin chain engraved with a smiling sun", "a short indigo cape with a lavender lining scattered with golden stars"],
            ["a small wand with a glowing amber star on top and a lavender handle", "a tiny fluffy white cloud-shaped umbrella with a lavender handle", "a small ornate golden lantern with a warm glowing flame inside"],
        ]),
    },
```

- [ ] **Step 2: Generar** (la clave está en `apimartkey`; no imprimirla):

```bash
cd /Users/santiagogonzalez/Desktop/Lumi && APIMART_API_KEY="$(tr -d '[:space:]' < apimartkey)" python3 tools/apimart_generate.py objetos-5
python3 tools/slice_sheets.py objetos-5
```
Expected: `assets/apimart/objetos-5.png`, `assets/apimart/objetos/<id>.png` y `assets/apimart/objetos-5-contacto.jpg`.

- [ ] **Step 3: Revisar** — abrir `assets/apimart/objetos-5-contacto.jpg` con Read. Si alguna pieza sale mal (cortada, otra cosa, texto), regenerar la hoja afinando solo esa celda del prompt y repetir Step 2. Máximo 3 intentos; si una pieza no mejora, sustituirla por otra idea del mismo hueco y ajustar `SPECIAL_ACCESSORIES`.

- [ ] **Step 4: Convertir a webp** (mismo formato que el resto de `assets/collection`; comprobar antes tamaño de uno existente con `python3 -c "from PIL import Image; print(Image.open('app/assets/collection/seta.webp').size)"` y usar ese lado):

```bash
python3 - <<'EOF'
from pathlib import Path
from PIL import Image
root = Path("/Users/santiagogonzalez/Desktop/Lumi")
side = Image.open(root / "app/assets/collection/seta.webp").size[0]
for p in (root / "assets/apimart/objetos").glob("*.png"):
    if p.stem in "gorro-dormir antifaz-estrellas corona-luz lazo-luna medallon-sol capa-estrellas varita-luz paraguas-nube linterna-dorada".split():
        im = Image.open(p).convert("RGBA").resize((side, side), Image.LANCZOS)
        im.save(root / "app/assets/collection" / f"{p.stem}.webp", "WEBP", quality=88)
        print(p.stem)
EOF
```
Expected: 9 nombres impresos.

- [ ] **Step 5: Registrar** en `ARTWORK` de `collection-icon.tsx`, tras `burbuja`, un bloque `// Accesorios especiales (chispas)` con las 9 líneas `'<id>': require('../../assets/collection/<id>.webp'),` (las claves con guion entre comillas).

- [ ] **Step 6: Verificar y commit**

```bash
cd app && npx tsc --noEmit && npx expo lint
cd .. && git add tools/apimart_generate.py app/assets/collection app/src/components/collection-icon.tsx assets/apimart/objetos-5.png assets/apimart/objetos-5-contacto.jpg
git commit -m "Armario: arte de los 9 accesorios especiales (APIMart)

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```
(Si `assets/apimart/objetos-5.png` o el contacto están ignorados por `.gitignore`, no forzarlos.)

---

### Task 4: Capa `Outfit` sobre Lampi y anclas

**Files:**
- Create: `app/src/lumi/outfit-anchors.json`
- Create: `tools/outfit_preview.py`
- Create: `app/src/components/outfit.tsx`
- Modify: `app/src/components/lumi-avatar.tsx` (prop `outfit`, render dentro del contenedor del cuerpo y compañero fuera)
- Modify: `app/src/game/wardrobe.ts` (rellenar `ITEM_FIT` tras revisar)
- Test: `app/src/components/__tests__/outfit.test.tsx`

**Interfaces:**
- Consumes: `Outfit`, `ITEM_FIT`, `wardrobeEntry` (Task 1), `CollectionIcon` (Task 3).
- Produces: `outfit-anchors.json` con forma `{ "<estado>": { "cabeza": [x, y], "cuello": [x, y], "mano": [x, y] } }` (fracciones del ancho y alto de la ilustración, centro de la pieza; estados `radiante|contenta|cansada|apagadita`); `placeItem(anchor, art, size, slot, id)` y `<OutfitLayer outfit art size stateKey />`, `<Companion friendId size />`; `LumiAvatar` acepta `outfit?: Outfit`.

- [ ] **Step 1: Anclas iniciales** — `app/src/lumi/outfit-anchors.json` (valores de partida, se afinan en el Step 3):

```json
{
  "radiante":  { "cabeza": [0.47, 0.19], "cuello": [0.47, 0.57], "mano": [0.12, 0.27] },
  "contenta":  { "cabeza": [0.50, 0.24], "cuello": [0.50, 0.61], "mano": [0.18, 0.70] },
  "cansada":   { "cabeza": [0.48, 0.25], "cuello": [0.48, 0.62], "mano": [0.20, 0.70] },
  "apagadita": { "cabeza": [0.42, 0.40], "cuello": [0.42, 0.66], "mano": [0.20, 0.72] }
}
```

- [ ] **Step 2: Script de previsualización** `tools/outfit_preview.py`:

```python
#!/usr/bin/env python3
"""Compone objetos sobre los PNG de Lampi con las anclas de app/src/lumi/outfit-anchors.json.

Uso (desde la raíz):  python3 tools/outfit_preview.py [id ...]   (por defecto, un surtido)
Salida: assets/apimart/outfit-preview.png (una fila por objeto, una columna por estado).
Los tamaños base deben coincidir con los de app/src/components/outfit.tsx (SLOT_SCALE).
"""
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
LUMI = ROOT / "app" / "assets" / "lumi"
ICONS = ROOT / "app" / "assets" / "collection"
ANCHORS = json.loads((ROOT / "app" / "src" / "lumi" / "outfit-anchors.json").read_text())
SLOT_SCALE = {"cabeza": 0.30, "cuello": 0.24, "mano": 0.28}
SLOT_OF = {
    "cabeza": "trebol seta bellota pluma hoja flor-luna trocito-luna nenufar pina polvo-estrella gorro-dormir antifaz-estrellas corona-luz".split(),
    "cuello": "bufanda moneda llave boton concha campanilla cristal geoda reloj lazo-luna medallon-sol capa-estrellas".split(),
    "mano": "farolillo catalejo mapa carta taza vela fresa galleta barquito gota burbuja engranaje piedra semilla canica calcetin ovillo varita-luz paraguas-nube linterna-dorada".split(),
}
slot_of = {i: s for s, ids in SLOT_OF.items() for i in ids}
DEFAULT = ["seta", "corona-luz", "bufanda", "medallon-sol", "farolillo", "catalejo", "varita-luz", "taza"]
CELL = 360


def render(state, item):
    base = Image.open(LUMI / f"{state}.png").convert("RGBA")
    k = CELL / max(base.size)
    base = base.resize((round(base.width * k), round(base.height * k)), Image.LANCZOS)
    canvas = Image.new("RGBA", (CELL, CELL), (30, 24, 70, 255))
    ox, oy = (CELL - base.width) // 2, (CELL - base.height) // 2
    canvas.alpha_composite(base, (ox, oy))
    slot = slot_of[item]
    ax, ay = ANCHORS[state][slot]
    s = round(CELL * SLOT_SCALE[slot])
    icon = Image.open(ICONS / f"{item}.webp").convert("RGBA").resize((s, s), Image.LANCZOS)
    canvas.alpha_composite(icon, (round(ox + ax * base.width - s / 2), round(oy + ay * base.height - s / 2)))
    return canvas


ids = sys.argv[1:] or DEFAULT
states = list(ANCHORS)
sheet = Image.new("RGBA", (CELL * len(states), CELL * len(ids)))
for r, item in enumerate(ids):
    for c, state in enumerate(states):
        sheet.alpha_composite(render(state, item), (c * CELL, r * CELL))
out = ROOT / "assets" / "apimart" / "outfit-preview.png"
sheet.save(out)
print(out)
```

- [ ] **Step 3: Afinar anclas** — `python3 tools/outfit_preview.py`, abrir `assets/apimart/outfit-preview.png` con Read, y corregir `outfit-anchors.json` (y `SLOT_SCALE` si hace falta) hasta que, en los 4 estados, la cabeza quede entre las antenas sobre la cabeza, el cuello bajo la cara y la mano junto a un lado del cuerpo, sin tapar ojos ni boca. Después repetir con **todos** los ids (`python3 tools/outfit_preview.py $(...)` por hueco) y anotar en `ITEM_FIT` (`wardrobe.ts`) la escala/giro de los que se vean mal (p. ej. `'catalejo': { scale: 1.1, rotate: -20 }`). Los valores finales de `SLOT_SCALE` pasan tal cual a `outfit.tsx`.

- [ ] **Step 4: Test que falla** `app/src/components/__tests__/outfit.test.tsx`:

```tsx
import { describe, expect, it } from '@jest/globals';

import { placeItem } from '@/components/outfit';

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
    const base = placeItem([0.5, 0.5], art, 200, 'cabeza', 'seta').size;
    expect(placeItem([0.5, 0.5], art, 200, 'cabeza', 'seta', { scale: 2 }).size).toBeCloseTo(base * 2);
  });
});
```

Run: `cd app && npx jest src/components/__tests__/outfit.test.tsx` → FAIL (módulo no existe).

- [ ] **Step 5: `outfit.tsx`**

```tsx
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { CollectionIcon } from '@/components/collection-icon';
import { friendById } from '@/game/catalog';
import type { Outfit, Slot } from '@/game/types';
import { ITEM_FIT, SLOTS, wardrobeEntry } from '@/game/wardrobe';
import anchors from '@/lumi/outfit-anchors.json';
import type { LumiStateKey } from '@/lumi/states';

/** Tamaño base de cada hueco, en fracción del tamaño de Lampi (mismos valores que `tools/outfit_preview.py`). */
export const SLOT_SCALE: Record<Slot, number> = { cabeza: 0.3, cuello: 0.24, mano: 0.28 };

export type Art = { w: number; h: number; x: number; y: number };
type Fit = { scale?: number; rotate?: number };

/** Posición (esquina superior izquierda) y lado de la pieza centrada en el ancla. */
export function placeItem(anchor: [number, number], art: Art, size: number, slot: Slot, id: string, fit: Fit = ITEM_FIT[id] ?? {}) {
  const side = size * SLOT_SCALE[slot] * (fit.scale ?? 1);
  return {
    left: art.x + anchor[0] * art.w - side / 2,
    top: art.y + anchor[1] * art.h - side / 2,
    size: side,
    rotate: fit.rotate ?? 0,
  };
}

/** Los objetos que lleva Lampi puestos. Va dentro del contenedor animado del cuerpo. */
export function OutfitLayer({ outfit, art, size, stateKey }: { outfit: Outfit; art: Art; size: number; stateKey: LumiStateKey }) {
  const points = anchors[stateKey] as Record<Slot, [number, number]>;
  return (
    <>
      {SLOTS.map((slot) => {
        const id = outfit[slot];
        const entry = id ? wardrobeEntry(id) : undefined;
        if (!id || !entry) return null;
        const p = placeItem(points[slot], art, size, slot, id);
        return (
          <View
            key={slot}
            pointerEvents="none"
            style={{ position: 'absolute', left: p.left, top: p.top, transform: [{ rotate: `${p.rotate}deg` }] }}>
            <CollectionIcon name={entry.icon} size={p.size} />
          </View>
        );
      })}
    </>
  );
}

/** El amigo que acompaña a Lampi, abajo a la derecha, con un balanceo suave. */
export function Companion({ friendId, size }: { friendId: string; size: number }) {
  const reduced = useReducedMotion();
  const bob = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    bob.value = withRepeat(
      withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.sin), reduceMotion: ReduceMotion.System }),
      -1,
      true,
    );
  }, [reduced, bob]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: -4 * bob.value }] }));
  const friend = friendById(friendId);
  if (!friend) return null;
  const side = size * 0.34;
  return (
    <Animated.View pointerEvents="none" style={[styles.companion, { right: -side * 0.35, bottom: 0 }, style]}>
      <CollectionIcon name={friend.icon} size={side} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({ companion: { position: 'absolute' } });
```

Si TypeScript se queja de importar el JSON, comprobar que `tsconfig.json` tiene `resolveJsonModule` (Expo lo trae en su base); si no, añadirlo en `compilerOptions`.

- [ ] **Step 6: Integrar en `LumiAvatar`** — importar `{ Companion, OutfitLayer }` y `type Outfit`; añadir prop `outfit?: Outfit` (comentario: «Lo que lleva puesto; por defecto, nada»); dentro del `Animated.View` del cuerpo, justo **después** de las `Orb` (para que quede sobre las luces), añadir `{outfit ? <OutfitLayer outfit={outfit} art={art} size={size} stateKey={state.key} /> : null}`; después del cierre de ese `Animated.View` y antes de `{asleep ? <Zzz …` añadir `{outfit?.companion ? <Companion friendId={outfit.companion} size={size} /> : null}`. El compañero queda fuera del contenedor del cuerpo, dentro de `box` (que ya es `alignItems: 'center'`), así que hay que dar a `box` `position: 'relative'` no hace falta (RN lo es por defecto).

- [ ] **Step 7: Pasa** — `cd app && npx jest src/components/__tests__/outfit.test.tsx` → PASS.

- [ ] **Step 8: Verificar y commit**

```bash
cd app && npx tsc --noEmit && npx expo lint && npx jest
cd .. && git add app/src/lumi/outfit-anchors.json tools/outfit_preview.py app/src/components/outfit.tsx app/src/components/lumi-avatar.tsx app/src/components/__tests__/outfit.test.tsx app/src/game/wardrobe.ts
git commit -m "Armario: capa Outfit y compañero sobre LumiAvatar, con anclas por estado

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Hoja del armario y accesos

**Files:**
- Create: `app/src/app/armario.tsx`
- Modify: `app/src/app/_layout.tsx:112` (registrar la ruta modal)
- Modify: `app/src/app/(tabs)/index.tsx` (pasar `outfit`, botón «Armario», saldo en el chip)
- Modify: `app/src/app/chispas.tsx` (título con saldo y frase de uso)
- Modify: `app/src/components/collection-detail.tsx` y `app/src/app/(tabs)/coleccion.tsx` (botón «Ponérselo»)
- Modify: `app/src/tour/definitions.ts` (paso `home.wardrobe`)

**Interfaces:**
- Consumes: `useGame()` (`balance`, `outfit`, `items`, `friends`, `unlocked`, `equip`, `unequip`, `setCompanion`, `buy`), `SLOTS`, `ITEM_SLOTS`, `SPECIAL_ACCESSORIES`, `wardrobeEntry`, `slotOf`, `LumiAvatar` (`outfit`), `Sheet`, `haptic`, `sfx`.

- [ ] **Step 1: Ruta** — en `_layout.tsx`, tras la línea de `chispas`: `<Stack.Screen name="armario" options={{ presentation: 'modal' }} />`.

- [ ] **Step 2: `armario.tsx`** (estilos y colores como `chispas.tsx`/`coleccion.tsx`; todos los textos con `tr`):

```tsx
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CollectionIcon } from '@/components/collection-icon';
import { LumiAvatar } from '@/components/lumi-avatar';
import { Sheet } from '@/components/sheet';
import { SparkGlyph } from '@/components/spark-glyph';
import { Colors, Fonts } from '@/constants/theme';
import { FRIEND_CATALOG, ITEM_CATALOG } from '@/game/catalog';
import { useGame } from '@/game/store';
import type { Slot } from '@/game/types';
import { ITEM_SLOTS, SPECIAL_ACCESSORIES } from '@/game/wardrobe';
import { haptic } from '@/haptics';
import { tr } from '@/i18n';
import { LUMI_STATES } from '@/lumi/states';
import { useLumi } from '@/lumi/store';
import { sfx } from '@/sound';

type Tab = Slot | 'amigo';
const TABS: { key: Tab; label: string }[] = [
  { key: 'cabeza', label: tr({ es: 'Cabeza', en: 'Head', zh: '头部', hi: 'सिर', fr: 'Tête' }) },
  { key: 'cuello', label: tr({ es: 'Cuello', en: 'Neck', zh: '颈部', hi: 'गला', fr: 'Cou' }) },
  { key: 'mano', label: tr({ es: 'Mano', en: 'Hand', zh: '手', hi: 'हाथ', fr: 'Main' }) },
  { key: 'amigo', label: tr({ es: 'Amigo', en: 'Friend', zh: '朋友', hi: 'दोस्त', fr: 'Ami' }) },
];

const copy = {
  empty: tr({
    es: 'Aún no tienes nada para este sitio. Lo que traiga de sus viajes aparecerá aquí.',
    en: 'Nothing for this spot yet. Whatever she brings back from her trips will show up here.',
    zh: '这里还没有东西。她旅行带回来的东西会出现在这里。',
    hi: 'इस जगह के लिए अभी कुछ नहीं है। सफ़र से जो वो लाएगी, यहाँ दिखेगा।',
    fr: 'Rien pour cet endroit pour l’instant. Ce qu’elle rapportera de ses voyages apparaîtra ici.',
  }),
  none: tr({ es: 'Quitar', en: 'Remove', zh: '取下', hi: 'हटाओ', fr: 'Retirer' }),
  shop: tr({ es: 'Con chispas', en: 'With sparks', zh: '用火花换', hi: 'चिंगारियों से', fr: 'Avec des étincelles' }),
  get: tr({ es: 'Conseguir', en: 'Get', zh: '获得', hi: 'पाओ', fr: 'Obtenir' }),
};

export default function WardrobeSheet() {
  const { settings } = useLumi();
  const game = useGame();
  const [tab, setTab] = useState<Tab>('cabeza');
  const name = settings.lumiName;

  const owned =
    tab === 'amigo'
      ? FRIEND_CATALOG.filter((f) => game.friends.includes(f.id)).map((f) => ({ id: f.id, name: f.name, icon: f.icon }))
      : [
          ...ITEM_CATALOG.filter((i) => ITEM_SLOTS[i.id] === tab && game.items.includes(i.id)),
          ...SPECIAL_ACCESSORIES.filter((a) => a.slot === tab && game.unlocked.includes(a.id)),
        ].map((e) => ({ id: e.id, name: e.name, icon: e.icon }));
  const shop = tab === 'amigo' ? [] : SPECIAL_ACCESSORIES.filter((a) => a.slot === tab && !game.unlocked.includes(a.id));
  const current = tab === 'amigo' ? game.outfit.companion : game.outfit[tab];

  const pick = (id: string) => {
    if (tab === 'amigo') game.setCompanion(id);
    else game.equip(id);
    haptic.selection();
    sfx.select();
  };
  const remove = () => {
    if (tab === 'amigo') game.setCompanion(null);
    else game.unequip(tab);
    haptic.selection();
  };

  return (
    <Sheet
      title={tr({ es: 'Armario', en: 'Wardrobe', zh: '衣橱', hi: 'अलमारी', fr: 'Garde-robe' })}
      subtitle={tr({
        es: `Lo que ${name} se pone para sus viajes.`,
        en: `What ${name} wears on her trips.`,
        zh: `${name}旅行时穿戴的东西。`,
        hi: `${name} अपने सफ़र पर जो पहनती है।`,
        fr: `Ce que ${name} porte pendant ses voyages.`,
      })}>
      <View style={styles.hero}>
        <LumiAvatar state={LUMI_STATES.contenta} size={170} outfit={game.outfit} alive={false} />
        <View style={styles.balance} accessible accessibilityLabel={`${game.balance}`}>
          <SparkGlyph size={14} color={Colors.amberPale} />
          <Text style={styles.balanceText}>{game.balance}</Text>
        </View>
      </View>

      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t.key }}
            onPress={() => {
              setTab(t.key);
              haptic.selection();
            }}
            style={[styles.tab, tab === t.key && styles.tabOn]}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextOn]} numberOfLines={1}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {owned.length === 0 && shop.length === 0 ? <Text style={styles.empty}>{copy.empty}</Text> : null}
      <View style={styles.grid}>
        {current ? (
          <Pressable accessibilityRole="button" onPress={remove} style={[styles.cell, styles.removeCell]}>
            <Text style={styles.removeText}>{copy.none}</Text>
          </Pressable>
        ) : null}
        {owned.map((e) => (
          <Pressable
            key={e.id}
            accessibilityRole="button"
            accessibilityLabel={e.name}
            accessibilityState={{ selected: current === e.id }}
            onPress={() => pick(e.id)}
            style={[styles.cell, current === e.id && styles.cellOn]}>
            <CollectionIcon name={e.icon} size={52} />
            <Text style={styles.cellName} numberOfLines={2}>
              {e.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {shop.length > 0 ? (
        <View style={{ gap: 10, marginTop: 18 }}>
          <Text style={styles.label}>{copy.shop}</Text>
          <View style={styles.grid}>
            {shop.map((a) => {
              const can = game.balance >= a.price;
              return (
                <Pressable
                  key={a.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${a.name}, ${a.price}`}
                  accessibilityState={{ disabled: !can }}
                  disabled={!can}
                  onPress={() => {
                    if (game.buy(a.id)) {
                      game.equip(a.id);
                      haptic.success();
                      sfx.reward();
                    }
                  }}
                  style={[styles.cell, !can && { opacity: 0.55 }]}>
                  <CollectionIcon name={a.icon} size={52} />
                  <Text style={styles.cellName} numberOfLines={2}>
                    {a.name}
                  </Text>
                  <View style={styles.price}>
                    <SparkGlyph size={11} color={Colors.amberPale} />
                    <Text style={styles.priceText}>{a.price}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: 14 },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  balanceText: { fontFamily: Fonts.bodyBold, color: Colors.amberPale, fontSize: 15, fontVariant: ['tabular-nums'] },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 191, 242, 0.08)',
  },
  tabOn: { backgroundColor: 'rgba(201, 191, 242, 0.22)' },
  tabText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textSecondary },
  tabTextOn: { color: Colors.lavenderPale },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    width: '30.5%',
    minHeight: 104,
    padding: 8,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(201, 191, 242, 0.08)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cellOn: { borderColor: Colors.amberPale, backgroundColor: 'rgba(255, 214, 140, 0.12)' },
  removeCell: { minHeight: 104 },
  removeText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textSecondary },
  cellName: { fontFamily: Fonts.body, fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  price: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  priceText: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.amberPale, fontVariant: ['tabular-nums'] },
  label: { fontFamily: Fonts.bodySemiBold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: Colors.textSecondary },
  empty: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginBottom: 14 },
});
```

Si algún color/fuente (`Colors.amberPale`, `Fonts.bodyBold`…) no existe, usar los de `index.tsx`/`chispas.tsx` (ya importan los mismos).

- [ ] **Step 3: Hogar** — en `(tabs)/index.tsx`: pasar `outfit={game.outfit}` al `LumiAvatar` del Hogar; el chip de chispas muestra `game.balance` (texto y `accessibilityLabel`); y bajo la `<Pill>` del estado (dentro de `styles.stage`) añadir un botón envuelto en `<TourTarget id="home.wardrobe">`:

```tsx
<TourTarget id="home.wardrobe">
  <Pressable
    accessibilityRole="button"
    onPress={() => router.push('/armario')}
    hitSlop={8}
    style={({ pressed }) => [styles.wardrobeButton, pressed && { opacity: 0.75 }]}>
    <Text style={styles.wardrobeText}>{tr({ es: 'Armario', en: 'Wardrobe', zh: '衣橱', hi: 'अलमारी', fr: 'Garde-robe' })}</Text>
  </Pressable>
</TourTarget>
```
con estilos `wardrobeButton: { alignSelf: 'center', marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, borderCurve: 'continuous', backgroundColor: 'rgba(201, 191, 242, 0.14)' }` y `wardrobeText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.lavenderPale }`.

- [ ] **Step 4: Hoja de chispas** — en `chispas.tsx`, el título usa `game.balance` en vez de `sparks`, y tras la lista «Cuántas trae» un párrafo (estilo `styles.label`/texto existentes) con:
`tr({ es: 'Gástalas en el Armario: hay accesorios especiales que no salen de las postales.', en: 'Spend them in the Wardrobe: there are special accessories that postcards never bring.', zh: '可以在衣橱里使用：有些特别配饰明信片里不会出现。', hi: 'इन्हें अलमारी में खर्च करो: कुछ खास एक्सेसरीज़ पोस्टकार्ड से नहीं मिलतीं।', fr: 'Dépense-les dans la garde-robe : certains accessoires spéciaux ne viennent jamais avec les cartes.' })`, y un botón «Abrir el Armario» que haga `router.replace('/armario')` (importar `router` de `expo-router`).

- [ ] **Step 5: «Ponérselo» en la Colección** — `CollectionDetail` recibe `onWear?: () => void` y `worn?: boolean`; si `onWear` existe, bajo `origin` muestra un `Pressable` con texto `worn ? «Lo lleva puesto» : «Ponérselo»` (`tr`: es «Ponérselo»/«Lo lleva puesto», en «Put it on»/«Wearing it», zh «戴上»/«已戴上», hi «पहनाओ»/«पहना हुआ है», fr «Lui mettre»/«Elle le porte»), desactivado si `worn`. En `coleccion.tsx`, al construir `detail`, calcular `wearable = kind === 'friend' || !!ITEM_SLOTS[entry.id]` y pasar `onWear={() => (kind === 'friend' ? game.setCompanion(entry.id) : game.equip(entry.id))}` y `worn={game.outfit.companion === entry.id || Object.values(game.outfit).includes(entry.id)}` solo si `wearable` y el objeto está poseído.

- [ ] **Step 6: Tour** — en `tour/definitions.ts`, en el tour `home`, tras el paso `home.sparks` y antes del `finale`, añadir:

```ts
        step('home.wardrobe', 'corona', {
          title: tr({ es: 'Mi armario', en: 'My wardrobe', zh: '我的衣橱', hi: 'मेरी अलमारी', fr: 'Ma garde-robe' }),
          body: tr({
            es: 'Con lo que traigo de mis viajes me visto, y un amigo puede venir conmigo. Con chispas hay accesorios especiales.',
            en: 'I dress up with what I bring back from my trips, and a friend can tag along. Sparks get you special accessories.',
            zh: '我用旅行带回来的东西打扮自己，还能带一个朋友同行。用火花可以换特别的配饰。',
            hi: 'सफ़र से लाई चीज़ों से मैं सजती हूँ, और एक दोस्त मेरे साथ चल सकता है। चिंगारियों से खास एक्सेसरीज़ मिलती हैं।',
            fr: 'Je m’habille avec ce que je rapporte de mes voyages, et un ami peut m’accompagner. Les étincelles donnent des accessoires spéciaux.',
          }),
        }),
```
(`'corona'` es un arte de tutorial ya existente en la hoja `tutorial`; comprobar que el mapa de arte de `definitions.ts` lo incluye, si no usar `'estrella'`.)

- [ ] **Step 7: Verificación manual** — `cd app && npx expo start` y en simulador: Hogar → Armario; equipar un objeto de cada hueco y un amigo; comprobar los 4 estados (el simulador de umbral del Hogar cambia el estado), dormida incluida; comprar un accesorio con chispas (usar `dev.closeDay`/«Siguiente día» del modo dev para conseguir chispas) y ver que el saldo baja y Progreso conserva el total; probar en francés e hindi que los textos no desbordan; reiniciar la app y comprobar que lo puesto persiste.

- [ ] **Step 8: Verificar y commit**

```bash
cd app && npx tsc --noEmit && npx expo lint && npx jest
cd .. && git add app/src/app/armario.tsx app/src/app/_layout.tsx "app/src/app/(tabs)/index.tsx" "app/src/app/(tabs)/coleccion.tsx" app/src/app/chispas.tsx app/src/components/collection-detail.tsx app/src/tour/definitions.ts
git commit -m "Armario: hoja para vestir a Lampi, compañero y accesorios con chispas, y accesos desde Hogar y Colección

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Cierre

**Files:** memoria del proyecto y spec.

- [ ] **Step 1: Ajustar la spec** a lo decidido en el plan (9 accesorios y 830 chispas; `equip(state, id)`; hueco y `fit` en `wardrobe.ts`; Lampi vestida en Hogar y Armario) y commit `docs:`.
- [ ] **Step 2: Suite completa** — `cd app && npx tsc --noEmit && npx expo lint && npx jest` → todo verde.
- [ ] **Step 3: Memoria** — marcar en `lampi-puntos-y-articulos-pendiente.md` y `lampi-roadmap-contenido.md` que el vestuario está hecho en la rama `armario-lampi`, y guardar un `mem_save` de engram con la decisión y la arquitectura.
- [ ] **Step 4:** invocar `superpowers:finishing-a-development-branch`.
