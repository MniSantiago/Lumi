import { FRIEND_CATALOG, itemById } from '@/game/catalog';
import type { GameState } from '@/game/engine';
import type { Outfit, Slot } from '@/game/types';
import { tr } from '@/i18n';
import fit from '@/lumi/outfit-fit.json';

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
export const ITEM_FIT: Record<string, { scale?: number; rotate?: number }> = fit;

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
  /**
   * Viene incluido con Lampi Plus. No se vende por chispas (ni con Plus): se
   * tiene desde el primer día de la suscripción. Es lo único que Plus da nada
   * más pagar, y por eso existe — lo demás de Plus tarda días en notarse.
   * Se mantiene la línea roja: las chispas siguen sin venderse.
   */
  plus?: boolean;
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
    id: 'corona-luz', slot: 'cabeza', price: 150, icon: 'corona-luz', feminine: true, plus: true,
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

/** Lo que trae puesto la suscripción. */
export const PLUS_ACCESSORIES = SPECIAL_ACCESSORIES.filter((a) => a.plus);

/** Se tiene por Plus, no por chispas: ni se compra ni se enseña con precio. */
export const isPlusAccessory = (id: string) => !!specialById(id)?.plus;

/**
 * Pone a disposición lo que trae Plus. Solo da, nunca quita: si la suscripción
 * caduca, la corona se queda. Es deliberado — retirar algo que Lampi ya llevaba
 * puesto sería castigar por dejar de pagar, y además no hay forma de distinguir
 * lo regalado por Plus de lo que alguien pudiera haber comprado con chispas
 * antes de que esto existiera. Devuelve el mismo objeto si no hay nada que dar.
 */
export function grantPlusAccessories(state: GameState, isPlus: boolean): GameState {
  if (!isPlus) return state;
  const missing = PLUS_ACCESSORIES.filter((a) => !state.unlocked.includes(a.id)).map((a) => a.id);
  return missing.length === 0 ? state : { ...state, unlocked: [...state.unlocked, ...missing] };
}

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

/** Chispas que faltan para comprar un accesorio (0 si alcanza, ya está comprado, no se vende o no existe). */
export function missingSparks(state: GameState, id: string): number {
  const accessory = specialById(id);
  if (!accessory || accessory.plus || state.unlocked.includes(id)) return 0;
  return Math.max(0, accessory.price - balance(state));
}

/** Se puede llevar: es un objeto poseído o un accesorio comprado. */
export function canWear(state: GameState, id: string): boolean {
  return specialById(id) ? state.unlocked.includes(id) : !!ITEM_SLOTS[id] && state.items.includes(id);
}

export function equip(state: GameState, id: string): GameState {
  const slot = slotOf(id);
  if (!slot || !canWear(state, id) || state.outfit[slot] === id) return state;
  return { ...state, outfit: { ...state.outfit, [slot]: id } };
}

/**
 * Traje de prueba (vista previa en la tienda): pone `id` en su hueco sin comprobar
 * si se posee. Devuelve el mismo objeto si el id no existe o ya está puesto.
 */
export function previewOutfit(outfit: Outfit, id: string): Outfit {
  const slot = slotOf(id);
  if (!slot || outfit[slot] === id) return outfit;
  return { ...outfit, [slot]: id };
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
  // Lo de Plus no está a la venta: se tiene con la suscripción o no se tiene.
  if (!accessory || accessory.plus || state.unlocked.includes(id) || balance(state) < accessory.price) return state;
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
