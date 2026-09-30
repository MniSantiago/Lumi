import { DESTINATIONS } from '@/game/destinations';
import type { Destination, ExpeditionResult } from '@/game/types';
import type { Threshold } from '@/lumi/states';

/**
 * Reglas de las expediciones: adónde va Lampi y qué trae.
 * Funciones puras y deterministas por `seed` (mismo día → mismo resultado).
 *
 * Recompensas según el umbral máximo del día (menos uso → mejor):
 * | umbral | objetos | amiga nueva | chispas |
 * |--------|---------|-------------|---------|
 * | 0      | 2–3     | 35 %        | 16–24   |
 * | 25     | 1–2     | 20 %        | 10–17   |
 * | ≥ 50   | 1       | 10 %        | 10      |  (normalmente no hay expedición)
 * Los objetos que aún no tienes salen primero; la amiga solo si queda alguna
 * por conocer en ese destino.
 */

export type PickContext = {
  /** Ids de destinos ya visitados (con postal en el álbum). */
  visited: string[];
  /** Días brillantes acumulados (días con expedición). */
  brightDays: number;
  isPlus: boolean;
  seed: number;
};

/** PRNG pequeño y determinista (mulberry32). Devuelve valores en [0, 1). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mezcla la semilla con un texto para que cada tirada sea independiente. */
function mix(seed: number, salt: string): number {
  let h = (seed ^ 0x9e3779b9) >>> 0;
  for (let i = 0; i < salt.length; i++) h = Math.imul(h ^ salt.charCodeAt(i), 16777619);
  return h >>> 0;
}

const pickOne = <T,>(list: readonly T[], rand: () => number): T => list[Math.floor(rand() * list.length)];

/** Fisher–Yates con el PRNG dado (no muta la entrada). */
function shuffled<T>(list: readonly T[], rand: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Destinos a los que Lampi puede ir hoy, en orden de historia (capítulo, luego orden del array). */
export function availableDestinations(ctx: Pick<PickContext, 'brightDays' | 'isPlus'>): Destination[] {
  return DESTINATIONS.map((d, i) => ({ d, i }))
    .filter(({ d }) => (!d.plus || ctx.isPlus) && d.unlockAfterBrightDays <= ctx.brightDays)
    .sort((a, b) => a.d.chapter - b.d.chapter || a.i - b.i)
    .map(({ d }) => d);
}

/**
 * Destino del día. Lampi solo sale si `threshold` < 50 (ver LUMI_STATES.*.exploring).
 * Primero, el siguiente lugar sin visitar en orden de historia; si ya los conoce
 * todos, una revisita al azar (evitando repetir el último visitado si hay más).
 */
export function pickDestination(ctx: PickContext): Destination {
  const available = availableDestinations(ctx);
  if (available.length === 0) return DESTINATIONS[0];

  const visited = new Set(ctx.visited);
  const fresh = available.find((d) => !visited.has(d.id));
  if (fresh) return fresh;

  const last = ctx.visited[ctx.visited.length - 1];
  const pool = available.length > 1 ? available.filter((d) => d.id !== last) : available;
  return pickOne(pool, mulberry32(mix(ctx.seed, 'pick')));
}

export type RollContext = {
  owned: { items: string[]; friends: string[] };
  /** Umbral máximo del día: menos uso → mejores recompensas. */
  threshold: Threshold;
  seed: number;
  /**
   * Opcional: cuántas veces había ido Lampi antes a este destino. Con 0, cuenta
   * siempre la primera historia (la de presentación); con 1 o más, una de las
   * otras. Sin el dato, cualquiera al azar.
   */
  timesVisited?: number;
};

/** Historia del día: la 0 presenta el lugar; las demás son para las revisitas. */
function pickStory(count: number, timesVisited: number | undefined, rand: () => number): number {
  const roll = rand();
  if (count <= 1) return 0;
  if (timesVisited === undefined) return Math.floor(roll * count);
  if (timesVisited <= 0) return 0;
  return 1 + Math.floor(roll * (count - 1));
}

function rewardTier(threshold: Threshold) {
  if (threshold <= 0) return { minItems: 2, maxItems: 3, friendChance: 0.35, sparksMin: 16, sparksMax: 24 };
  if (threshold <= 25) return { minItems: 1, maxItems: 2, friendChance: 0.2, sparksMin: 10, sparksMax: 17 };
  return { minItems: 1, maxItems: 1, friendChance: 0.1, sparksMin: 10, sparksMax: 10 };
}

export function rollExpedition(destination: Destination, ctx: RollContext): ExpeditionResult {
  const rand = mulberry32(mix(ctx.seed, destination.id));
  const tier = rewardTier(ctx.threshold);

  const storyIndex = pickStory(destination.stories.length, ctx.timesVisited, rand);

  // Objetos: primero los que aún no tiene (en orden aleatorio), luego repetidos.
  const ownedItems = new Set(ctx.owned.items);
  const shuffledLoot = shuffled(destination.lootItems, rand);
  const ordered = [
    ...shuffledLoot.filter((id) => !ownedItems.has(id)),
    ...shuffledLoot.filter((id) => ownedItems.has(id)),
  ];
  const count = tier.minItems + Math.floor(rand() * (tier.maxItems - tier.minItems + 1));
  const itemIds = ordered.slice(0, Math.min(count, ordered.length));

  // Amiga: solo si queda alguna por conocer aquí.
  const ownedFriends = new Set(ctx.owned.friends);
  const newFriends = destination.lootFriends.filter((id) => !ownedFriends.has(id));
  const friendRoll = rand();
  const friendId = newFriends.length > 0 && friendRoll < tier.friendChance ? pickOne(newFriends, rand) : null;

  const sparks = tier.sparksMin + Math.floor(rand() * (tier.sparksMax - tier.sparksMin + 1));

  return { destinationId: destination.id, storyIndex, itemIds, friendId, sparks };
}

/** Semilla estable a partir de la fecha ('YYYY-MM-DD'). */
export function seedFromDate(date: string): number {
  let h = 2166136261;
  for (let i = 0; i < date.length; i++) h = Math.imul(h ^ date.charCodeAt(i), 16777619);
  return h >>> 0;
}
