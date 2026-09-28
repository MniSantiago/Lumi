import { DESTINATIONS } from '@/game/destinations';
import type { Destination, ExpeditionResult } from '@/game/types';
import type { Threshold } from '@/lumi/states';

/**
 * Reglas de las expediciones: adónde va Lumi y qué trae.
 * PROVISIONAL: lo implementa el agente de contenido. Funciones puras y
 * deterministas por `seed` (mismo día → mismo resultado). Mantén las firmas.
 */

export type PickContext = {
  /** Ids de destinos ya visitados (con postal en el álbum). */
  visited: string[];
  /** Días brillantes acumulados (días con expedición). */
  brightDays: number;
  isPlus: boolean;
  seed: number;
};

/** Destino del día. Lumi solo sale si `threshold` < 50 (ver LUMI_STATES.*.exploring). */
export function pickDestination(ctx: PickContext): Destination {
  void ctx;
  return DESTINATIONS[0];
}

export type RollContext = {
  owned: { items: string[]; friends: string[] };
  /** Umbral máximo del día: menos uso → mejores recompensas. */
  threshold: Threshold;
  seed: number;
};

export function rollExpedition(destination: Destination, ctx: RollContext): ExpeditionResult {
  void ctx;
  return {
    destinationId: destination.id,
    storyIndex: 0,
    itemIds: destination.lootItems.slice(0, 2),
    friendId: destination.lootFriends[0] ?? null,
    sparks: 14,
  };
}

/** Semilla estable a partir de la fecha ('YYYY-MM-DD'). */
export function seedFromDate(date: string): number {
  let h = 2166136261;
  for (let i = 0; i < date.length; i++) h = Math.imul(h ^ date.charCodeAt(i), 16777619);
  return h >>> 0;
}
