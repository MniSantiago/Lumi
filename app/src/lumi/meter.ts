import { tr } from '@/i18n';
import type { Threshold } from '@/lumi/states';
import { formatLimit } from '@/lumi/store';

/**
 * Nota del medidor "Luz de hoy" en el tramo del límite que toca, con el límite
 * real del usuario (no siempre es una hora). Solo sabemos el último umbral
 * cruzado, así que se habla de tramos, no de minutos exactos.
 */
export function meterNote(threshold: Threshold, limitMinutes: number) {
  const at = (pct: number) => formatLimit(Math.round((limitMinutes * pct) / 100));
  const limit = formatLimit(limitMinutes);
  if (threshold >= 100)
    return tr({
      es: `Has llegado a tu límite (${limit})`,
      en: `You’ve reached your limit (${limit})`,
      zh: `已到达你的上限（${limit}）`,
      hi: `तुम अपनी सीमा तक पहुँच गए (${limit})`,
      fr: `Tu as atteint ta limite (${limit})`,
    });
  if (threshold >= 75)
    return tr({
      es: `Más de ${at(75)} de ${limit}`,
      en: `Over ${at(75)} of ${limit}`,
      zh: `${limit}中已用超过 ${at(75)}`,
      hi: `${limit} में से ${at(75)} से ज़्यादा`,
      fr: `Plus de ${at(75)} sur ${limit}`,
    });
  const between = (a: string, b: string) =>
    tr({
      es: `Entre ${a} y ${b}`,
      en: `Between ${a} and ${b}`,
      zh: `${a}到${b}之间`,
      hi: `${a} और ${b} के बीच`,
      fr: `Entre ${a} et ${b}`,
    });
  if (threshold >= 50) return between(at(50), at(75));
  if (threshold >= 25) return between(at(25), at(50));
  return tr({
    es: `Menos de ${at(25)} de ${limit}`,
    en: `Under ${at(25)} of ${limit}`,
    zh: `${limit}中用了不到 ${at(25)}`,
    hi: `${limit} में से ${at(25)} से कम`,
    fr: `Moins de ${at(25)} sur ${limit}`,
  });
}
