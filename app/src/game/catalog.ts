import type { CatalogEntry } from '@/game/types';

/**
 * Catálogo de objetos (36) y criaturas amigas (12) que Lumi puede traer.
 * `icon` es la clave de su dibujo en `components/collection-icon.tsx`.
 * Todos se pueden conseguir en destinos gratuitos; los de Lumi Plus solo
 * dan más ocasiones de encontrarlos.
 */
export const ITEM_CATALOG: CatalogEntry[] = [
  { id: 'piedra', name: 'Piedra lisa', icon: 'piedra', article: 'una' },
  { id: 'semilla', name: 'Semilla voladora', icon: 'semilla', article: 'una' },
  { id: 'trebol', name: 'Trébol', icon: 'trebol', article: 'un' },
  { id: 'seta', name: 'Seta brillante', icon: 'seta', article: 'una' },
  { id: 'cristal', name: 'Cristal pequeño', icon: 'cristal', article: 'un' },
  { id: 'farolillo', name: 'Farolillo', icon: 'farolillo', article: 'un' },
  { id: 'bellota', name: 'Bellota con gorrito', icon: 'bellota', article: 'una' },
  { id: 'pluma', name: 'Pluma de búho', icon: 'pluma', article: 'una' },
  { id: 'hoja', name: 'Hoja dorada', icon: 'hoja', article: 'una' },
  { id: 'concha', name: 'Concha rosa', icon: 'concha', article: 'una' },
  { id: 'gota', name: 'Gota de rocío', icon: 'gota', article: 'una' },
  { id: 'llave', name: 'Llave diminuta', icon: 'llave', article: 'una' },
  { id: 'boton', name: 'Botón perdido', icon: 'boton', article: 'un' },
  { id: 'galleta', name: 'Galleta de avena', icon: 'galleta', article: 'una' },
  { id: 'taza', name: 'Taza sin asa', icon: 'taza', article: 'una' },
  { id: 'barquito', name: 'Barquito de papel', icon: 'barquito', article: 'un' },
  { id: 'canica', name: 'Canica de agua', icon: 'canica', article: 'una' },
  { id: 'campanilla', name: 'Campanilla', icon: 'campanilla', article: 'una' },
  { id: 'flor-luna', name: 'Flor de luna', icon: 'flor-luna', article: 'una' },
  { id: 'fresa', name: 'Fresa silvestre', icon: 'fresa', article: 'una' },
  { id: 'ovillo', name: 'Ovillo de lana', icon: 'ovillo', article: 'un' },
  { id: 'mapa', name: 'Mapa arrugado', icon: 'mapa', article: 'un' },
  { id: 'carta', name: 'Carta sin remite', icon: 'carta', article: 'una' },
  { id: 'reloj', name: 'Reloj de bolsillo', icon: 'reloj', article: 'un' },
  { id: 'engranaje', name: 'Engranaje', icon: 'engranaje', article: 'un' },
  { id: 'vela', name: 'Vela de cera', icon: 'vela', article: 'una' },
  { id: 'catalejo', name: 'Catalejo', icon: 'catalejo', article: 'un' },
  { id: 'polvo-estrella', name: 'Frasco de polvo de estrellas', icon: 'polvo-estrella', article: 'un' },
  { id: 'trocito-luna', name: 'Trocito de luna', icon: 'trocito-luna', article: 'un' },
  { id: 'pina', name: 'Piña', icon: 'pina', article: 'una' },
  { id: 'geoda', name: 'Geoda', icon: 'geoda', article: 'una' },
  { id: 'nenufar', name: 'Nenúfar', icon: 'nenufar', article: 'un' },
  { id: 'bufanda', name: 'Bufanda diminuta', icon: 'bufanda', article: 'una' },
  { id: 'moneda', name: 'Moneda antigua', icon: 'moneda', article: 'una' },
  { id: 'calcetin', name: 'Calcetín suelto', icon: 'calcetin', article: 'un' },
  { id: 'burbuja', name: 'Burbuja que no explota', icon: 'burbuja', article: 'una' },
];

export const FRIEND_CATALOG: CatalogEntry[] = [
  { id: 'musguito', name: 'Musguito', icon: 'musguito', article: 'un' },
  { id: 'hollin', name: 'Hollín', icon: 'hollin', article: 'un' },
  { id: 'nubecilla', name: 'Nubecilla', icon: 'nubecilla', article: 'una' },
  { id: 'chispin', name: 'Chispín', icon: 'chispin', article: 'un' },
  { id: 'topito', name: 'Topito', icon: 'topito', article: 'un' },
  { id: 'pinchito', name: 'Pinchito', icon: 'pinchito', article: 'un' },
  { id: 'ranita', name: 'Ranita Do', icon: 'ranita', article: 'una' },
  { id: 'caracolina', name: 'Caracolina', icon: 'caracolina', article: 'una' },
  { id: 'burbujo', name: 'Burbujo', icon: 'burbujo', article: 'un' },
  { id: 'pinzas', name: 'Pinzas', icon: 'pinzas', article: 'un' },
  { id: 'mochuelito', name: 'Mochuelito', icon: 'mochuelito', article: 'un' },
  { id: 'estrellita', name: 'Estrellita', icon: 'estrellita', article: 'una' },
];

export const itemById = (id: string) => ITEM_CATALOG.find((i) => i.id === id);
export const friendById = (id: string) => FRIEND_CATALOG.find((f) => f.id === id);
