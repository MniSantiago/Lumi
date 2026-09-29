import type { Threshold } from '@/lumi/states';
import { formatLimit } from '@/lumi/store';

/**
 * Nota del medidor "Luz de hoy" en el tramo del límite que toca, con el límite
 * real del usuario (no siempre es una hora). Solo sabemos el último umbral
 * cruzado, así que se habla de tramos, no de minutos exactos.
 */
export function meterNote(threshold: Threshold, limitMinutes: number) {
  const at = (pct: number) => formatLimit(Math.round((limitMinutes * pct) / 100));
  if (threshold >= 100) return `Has llegado a tu límite (${formatLimit(limitMinutes)})`;
  if (threshold >= 75) return `Más de ${at(75)} de ${formatLimit(limitMinutes)}`;
  if (threshold >= 50) return `Entre ${at(50)} y ${at(75)}`;
  if (threshold >= 25) return `Entre ${at(25)} y ${at(50)}`;
  return `Menos de ${at(25)} de ${formatLimit(limitMinutes)}`;
}
