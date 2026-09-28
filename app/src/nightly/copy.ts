/**
 * Textos de la postal nocturna. Lumi vuelve contenta, cuenta y nunca juzga.
 */
import type { Postcard } from '@/lumi/data';
import type { NightlyReturn } from '@/nightly/tonight';

/** Lugares femeninos por su primera palabra; el resto va con "el". */
const FEMININE: Partial<Record<string, 'la' | 'las'>> = {
  Colina: 'la',
  Pradera: 'la',
  Nube: 'la',
  Madriguera: 'la',
  Cuevas: 'las',
};

/** "del Bosque de Musgo", "de la Nube Baja", "de las Cuevas de Cristal". */
export function fromPlace(place: string) {
  const article = FEMININE[place.split(' ')[0]];
  return article ? `de ${article} ${place}` : `del ${place}`;
}

/** Aviso de la vuelta; se reutilizará para la notificación real. */
export function nightlyNotification(lumiName: string, result: Pick<NightlyReturn, 'zone'>) {
  return {
    title: `${lumiName} ha vuelto ${fromPlace(result.zone)} 🌙`,
    body: 'Trae una postal y los bolsillos llenos. Te espera despierta para enseñártelo.',
  };
}

export const nightlyCopy = {
  header: (lumiName: string) => `${lumiName} ha vuelto 🌙`,
  rereadHeader: (place: string) => `Postal ${fromPlace(place)}`,
  chapter: (n: number, title?: string) => (title ? `Capítulo ${n} · ${title}` : `Capítulo ${n}`),
  broughtLabel: 'Te ha traído',
  newFriend: '¡Amigo nuevo!',
  sparksUnit: 'chispas',
  skipHint: 'Toca para verlo todo',

  save: 'Guardar en el álbum',
  saved: 'Guardada. Mañana, más aventuras ✨',
  share: 'Compartir',
  close: 'Cerrar',
};

export function shareTonight(lumiName: string, result: NightlyReturn) {
  const first = result.keepsakes[0];
  const what = first ? ` con ${first.article} ${first.item.name.toLowerCase()}` : '';
  const friend = result.newFriend ? ` y un amigo nuevo, ${result.newFriend.name}` : '';
  return `Mi ${lumiName} ha vuelto ${fromPlace(result.zone)}${what}${friend} ✨`;
}

export function shareReread(lumiName: string, postcard: Postcard) {
  return `Mi ${lumiName} me mandó una postal ${fromPlace(postcard.place)}: «${postcard.quote}» ✨`;
}
