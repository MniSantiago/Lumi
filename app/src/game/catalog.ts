import { content } from '@/game/content';
import type { EntryText } from '@/game/content/types';
import type { CatalogEntry } from '@/game/types';

const entry =
  (texts: Record<string, EntryText>) =>
  (e: { id: string; icon: string }): CatalogEntry => ({
    ...e,
    ...texts[e.id],
  });

/**
 * Catálogo de objetos (36) y criaturas amigas (12) que Lumi puede traer.
 * `icon` es la clave de su dibujo en `components/collection-icon.tsx`.
 * Todos se pueden conseguir en destinos gratuitos; los de Lumi Plus solo
 * dan más ocasiones de encontrarlos.
 */
export const ITEM_CATALOG: CatalogEntry[] = [
  { id: 'piedra', icon: 'piedra' },
  { id: 'semilla', icon: 'semilla' },
  { id: 'trebol', icon: 'trebol' },
  { id: 'seta', icon: 'seta' },
  { id: 'cristal', icon: 'cristal' },
  { id: 'farolillo', icon: 'farolillo' },
  { id: 'bellota', icon: 'bellota' },
  { id: 'pluma', icon: 'pluma' },
  { id: 'hoja', icon: 'hoja' },
  { id: 'concha', icon: 'concha' },
  { id: 'gota', icon: 'gota' },
  { id: 'llave', icon: 'llave' },
  { id: 'boton', icon: 'boton' },
  { id: 'galleta', icon: 'galleta' },
  { id: 'taza', icon: 'taza' },
  { id: 'barquito', icon: 'barquito' },
  { id: 'canica', icon: 'canica' },
  { id: 'campanilla', icon: 'campanilla' },
  { id: 'flor-luna', icon: 'flor-luna' },
  { id: 'fresa', icon: 'fresa' },
  { id: 'ovillo', icon: 'ovillo' },
  { id: 'mapa', icon: 'mapa' },
  { id: 'carta', icon: 'carta' },
  { id: 'reloj', icon: 'reloj' },
  { id: 'engranaje', icon: 'engranaje' },
  { id: 'vela', icon: 'vela' },
  { id: 'catalejo', icon: 'catalejo' },
  { id: 'polvo-estrella', icon: 'polvo-estrella' },
  { id: 'trocito-luna', icon: 'trocito-luna' },
  { id: 'pina', icon: 'pina' },
  { id: 'geoda', icon: 'geoda' },
  { id: 'nenufar', icon: 'nenufar' },
  { id: 'bufanda', icon: 'bufanda' },
  { id: 'moneda', icon: 'moneda' },
  { id: 'calcetin', icon: 'calcetin' },
  { id: 'burbuja', icon: 'burbuja' },
].map(entry(content.items));

export const FRIEND_CATALOG: CatalogEntry[] = [
  { id: 'musguito', icon: 'musguito' },
  { id: 'hollin', icon: 'hollin' },
  { id: 'nubecilla', icon: 'nubecilla' },
  { id: 'chispin', icon: 'chispin' },
  { id: 'topito', icon: 'topito' },
  { id: 'pinchito', icon: 'pinchito' },
  { id: 'ranita', icon: 'ranita' },
  { id: 'caracolina', icon: 'caracolina' },
  { id: 'burbujo', icon: 'burbujo' },
  { id: 'pinzas', icon: 'pinzas' },
  { id: 'mochuelito', icon: 'mochuelito' },
  { id: 'estrellita', icon: 'estrellita' },
].map(entry(content.friends));

export const itemById = (id: string) => ITEM_CATALOG.find((i) => i.id === id);
export const friendById = (id: string) => FRIEND_CATALOG.find((f) => f.id === id);
