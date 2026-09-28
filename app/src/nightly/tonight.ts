/**
 * Lo que Lumi trae esta noche de su expedición (BRIEF.md, "Ciclo diario").
 * De momento es un mock; más adelante saldrá de la expedición real del día,
 * y solo habrá vuelta los días en que tuvo luz para salir.
 */
import { CURRENT_EXPEDITION, FRIENDS, ITEMS, ZONES, type Item } from '@/lumi/data';

/** Algo que Lumi se trae en el bolsillo, con su artículo para las frases ("una seta brillante"). */
export type Keepsake = { item: Item & { name: string }; article: 'un' | 'una' };

export type NightlyReturn = {
  zone: string;
  /** Ilustración provisional del lugar (degradado CSS). */
  art: string;
  chapter: number;
  chapterTitle: string;
  /** Pie de la postal, en la voz de Lumi. */
  caption: string;
  /** Fragmento de historia, 2-3 frases en primera persona. */
  story: string;
  keepsakes: Keepsake[];
  /** Criatura amiga que la ha seguido hasta casa (no todas las noches). */
  newFriend?: Item & { name: string };
  sparks: number;
};

function named(list: Item[], icon: string): Item & { name: string } {
  const found = list.find((i) => i.icon === icon);
  return { id: found?.id ?? icon, icon, name: found?.name ?? icon };
}

const zone = ZONES.find((z) => z.name === CURRENT_EXPEDITION.zone);

export const TONIGHT: NightlyReturn = {
  zone: CURRENT_EXPEDITION.zone,
  art: zone?.art ?? 'linear-gradient(160deg, #3E6A6A, #1D2446)',
  chapter: 3,
  chapterTitle: 'El bosque que susurra',
  caption: 'Aquí todo es blandito. Hasta el silencio.',
  story:
    'El musgo estaba tan blandito que me eché una siesta sin querer. Al despertar, una seta me alumbró el camino de vuelta, así que me la traje (le pedí permiso). Y alguien pequeñito y verde me ha seguido hasta casa… creo que quiere quedarse.',
  keepsakes: [
    { item: named(ITEMS, 'seta'), article: 'una' },
    { item: named(ITEMS, 'trebol'), article: 'un' },
  ],
  newFriend: named(FRIENDS, 'musguito'),
  sparks: 14,
};
