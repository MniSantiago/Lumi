/**
 * Lo que Lumi trae esta noche de su expedición (BRIEF.md, "Ciclo diario"),
 * listo para la postal nocturna. Sale de la vuelta pendiente del juego.
 */
import { friendById, itemById } from '@/game/catalog';
import type { PendingReturn } from '@/game/store';
import type { CatalogEntry, Destination } from '@/game/types';

export type NightlyReturn = {
  destination: Destination;
  /** Fragmento de historia elegido para esta vuelta, en la voz de Lumi. */
  story: string;
  /** Lo que se trae en el bolsillo. */
  keepsakes: CatalogEntry[];
  /** Criatura amiga que la ha seguido hasta casa (no todas las noches). */
  friend: CatalogEntry | null;
  /** El amigo aún no estaba en la colección. */
  friendIsNew: boolean;
  sparks: number;
};

export function nightlyReturnFrom(pending: PendingReturn): NightlyReturn {
  const { destination, result } = pending;
  return {
    destination,
    story: destination.stories[result.storyIndex] ?? destination.stories[0] ?? destination.caption,
    keepsakes: result.itemIds.flatMap((id) => {
      const item = itemById(id);
      return item ? [item] : [];
    }),
    friend: (result.friendId && friendById(result.friendId)) || null,
    friendIsNew: pending.newFriend,
    sparks: result.sparks,
  };
}
