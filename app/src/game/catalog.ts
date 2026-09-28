import type { CatalogEntry } from '@/game/types';

/**
 * Catálogo de objetos y criaturas amigas que Lumi puede traer.
 * PROVISIONAL: lo amplía el agente de contenido (objetivo: 36 objetos, 12 amigos).
 * Mantén los nombres de las exportaciones.
 */
export const ITEM_CATALOG: CatalogEntry[] = [
  { id: 'piedra', name: 'Piedra lisa', icon: 'piedra', article: 'una' },
  { id: 'semilla', name: 'Semilla voladora', icon: 'semilla', article: 'una' },
  { id: 'trebol', name: 'Trébol', icon: 'trebol', article: 'un' },
  { id: 'seta', name: 'Seta brillante', icon: 'seta', article: 'una' },
  { id: 'cristal', name: 'Cristal pequeño', icon: 'cristal', article: 'un' },
  { id: 'farolillo', name: 'Farolillo', icon: 'farolillo', article: 'un' },
];

export const FRIEND_CATALOG: CatalogEntry[] = [
  { id: 'musguito', name: 'Musguito', icon: 'musguito', article: 'un' },
  { id: 'hollin', name: 'Hollín', icon: 'hollin', article: 'un' },
  { id: 'nubecilla', name: 'Nubecilla', icon: 'nubecilla', article: 'una' },
];

export const itemById = (id: string) => ITEM_CATALOG.find((i) => i.id === id);
export const friendById = (id: string) => FRIEND_CATALOG.find((f) => f.id === id);
