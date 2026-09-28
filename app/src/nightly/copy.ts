/**
 * Textos de la postal nocturna. Lumi vuelve contenta, cuenta y nunca juzga.
 * (El texto del aviso lo escribe `notifications/`.)
 */
import { fromDestination } from '@/game/destinations';
import type { CatalogEntry, Destination } from '@/game/types';
import type { NightlyReturn } from '@/nightly/tonight';

export const nightlyCopy = {
  header: (lumiName: string) => `${lumiName} ha vuelto 🌙`,
  rereadHeader: (d: Destination) => `Postal ${fromDestination(d)}`,
  chapter: (n: number, title?: string) => (title ? `Capítulo ${n} · ${title}` : `Capítulo ${n}`),
  broughtLabel: 'Te ha traído',
  /** "¡Amigo nuevo!" / "¡Amiga nueva!" según la criatura. */
  newFriend: (friend: CatalogEntry) =>
    friend.article === 'una' || friend.article === 'unas' ? '¡Amiga nueva!' : '¡Amigo nuevo!',
  sparksUnit: 'chispas',
  skipHint: 'Toca para verlo todo',

  save: 'Guardar en el álbum',
  saved: 'Guardada. Mañana, más aventuras ✨',
  share: 'Compartir',
  close: 'Cerrar',

  /** Sin vuelta pendiente: aún está fuera, o hoy se ha quedado en casa. */
  stillOut: (lumiName: string, returnsAt: string) => `${lumiName} aún está de expedición. Vuelve a las ${returnsAt} 🌙`,
  nothingNew: (lumiName: string) => `Hoy no hay postal nueva. ${lumiName} te espera en casa 🌙`,
};

export function shareTonight(lumiName: string, result: NightlyReturn) {
  const first = result.keepsakes[0];
  const what = first ? ` con ${first.article} ${first.name.toLowerCase()}` : '';
  const friend = result.friend ? ` y se ha traído a ${result.friend.name}` : '';
  return `Mi ${lumiName} ha vuelto ${fromDestination(result.destination)}${what}${friend} ✨`;
}

export function shareReread(lumiName: string, destination: Destination) {
  return `Mi ${lumiName} me mandó una postal ${fromDestination(destination)}: «${destination.quote}» ✨`;
}
