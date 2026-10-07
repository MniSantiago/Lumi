import type { Slot } from '@/game/types';
import { ITEM_FIT } from '@/game/wardrobe';

/** Tamaño base de cada hueco, en fracción del tamaño de Lampi (mismos valores que `tools/outfit_preview.py`). */
export const SLOT_SCALE: Record<Slot, number> = { cabeza: 0.3, cuello: 0.27, mano: 0.32 };

/** Dónde cae la ilustración de Lampi dentro del cuadrado de `LumiAvatar`. */
export type Art = { w: number; h: number; x: number; y: number };
type Fit = { scale?: number; rotate?: number };

/** Posición (esquina superior izquierda), lado y giro de la pieza centrada en el ancla. */
export function placeItem(
  anchor: [number, number],
  art: Art,
  size: number,
  slot: Slot,
  id: string,
  fit: Fit = ITEM_FIT[id] ?? {},
) {
  const side = size * SLOT_SCALE[slot] * (fit.scale ?? 1);
  return {
    left: art.x + anchor[0] * art.w - side / 2,
    top: art.y + anchor[1] * art.h - side / 2,
    size: side,
    rotate: fit.rotate ?? 0,
  };
}
