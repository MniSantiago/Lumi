import type { Destination } from '@/game/types';

/**
 * Los destinos de las expediciones.
 * PROVISIONAL: lo completa el agente de contenido (objetivo: ~20 destinos del MVP).
 * Mantén los nombres de las exportaciones y sus firmas.
 */
export const DESTINATIONS: Destination[] = [
  {
    id: 'bosque-musgo',
    name: 'Bosque de Musgo',
    article: 'el',
    art: 'linear-gradient(170deg, #8FD1A6, #3E6A6A 55%, #1D2446)',
    chapter: 1,
    chapterTitle: 'El bosque que susurra',
    caption: 'Aquí todo es blandito. Hasta el silencio.',
    quote: 'Me eché una siesta sin querer.',
    stories: ['El musgo estaba tan blandito que me eché una siesta sin querer.'],
    plus: false,
    unlockAfterBrightDays: 0,
    lootItems: ['seta', 'trebol'],
    lootFriends: ['musguito'],
  },
];

export const destinationById = (id: string) => DESTINATIONS.find((d) => d.id === id);

/** "del Bosque de Musgo", "de la Colina…", "de los…", "de las Cuevas…". */
export function fromDestination(d: Pick<Destination, 'name' | 'article'>): string {
  return d.article === 'el' ? `del ${d.name}` : `de ${d.article} ${d.name}`;
}

/** "el Bosque de Musgo", "las Cuevas de Cristal". */
export function withArticle(d: Pick<Destination, 'name' | 'article'>): string {
  return `${d.article} ${d.name}`;
}
