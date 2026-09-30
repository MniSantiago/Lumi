import { content } from '@/game/content';
import type { Destination } from '@/game/types';

/** Ilustración de cada lugar (`assets/expeditions`); un lugar sin ella usaría solo el degradado de `art`. */
const IMAGES: Record<string, Destination['image']> = {
  'lago-lunas': require('../../assets/expeditions/lago-lunas.jpg'),
  'dientes-de-leon': require('../../assets/expeditions/dientes-de-leon.jpg'),
  'pradera-suave': require('../../assets/expeditions/pradera-suave.jpg'),
  'jardin-setas': require('../../assets/expeditions/jardin-setas.jpg'),
  'nube-baja': require('../../assets/expeditions/nube-baja.jpg'),
  'madriguera-vecino': require('../../assets/expeditions/madriguera-vecino.jpg'),
  'bosque-musgo': require('../../assets/expeditions/bosque-musgo.jpg'),
  'cuevas-cristal': require('../../assets/expeditions/cuevas-cristal.jpg'),
  'faro-dormido': require('../../assets/expeditions/faro-dormido.jpg'),
  'puente-raices': require('../../assets/expeditions/puente-raices.jpg'),
  'charca-ranas': require('../../assets/expeditions/charca-ranas.jpg'),
  'cascada-timida': require('../../assets/expeditions/cascada-timida.jpg'),
  'playa-conchas': require('../../assets/expeditions/playa-conchas.jpg'),
  'muelle-barcas': require('../../assets/expeditions/muelle-barcas.jpg'),
  'isla-reloj': require('../../assets/expeditions/isla-reloj.jpg'),
  'mercadillo-buhos': require('../../assets/expeditions/mercadillo-buhos.jpg'),
  'tejados-aldea': require('../../assets/expeditions/tejados-aldea.jpg'),
  'montana-manta': require('../../assets/expeditions/montana-manta.jpg'),
  'jardin-estrellas': require('../../assets/expeditions/jardin-estrellas.jpg'),
  'observatorio-cometas': require('../../assets/expeditions/observatorio-cometas.jpg'),
};

/** Lo que no depende del idioma; los textos vienen de `game/content/<idioma>.ts`. */
type DestinationData = Omit<Destination, 'image' | 'name' | 'the' | 'from' | 'chapterTitle' | 'caption' | 'quote' | 'stories'>;

/**
 * Los 20 destinos del MVP, en 4 capítulos de 5 lugares.
 * El orden del array es el orden de la historia: `pickDestination` propone
 * primero los que Lampi aún no conoce, en este orden.
 *
 * Hilo largo: una estrellita se cayó del cielo hace poco. Lampi encuentra
 * pistas sueltas (polvo dorado, una carta sin remite, un reflejo sin dueña)
 * hasta dar con ella en el Jardín de las Estrellas Caídas.
 */
const DATA: DestinationData[] = [
  // ── Capítulo 1 ─────────────────────────────────────────────
  {
    id: 'bosque-musgo',
    art: 'linear-gradient(170deg, #8FD1A6, #3E6A6A 55%, #1D2446)',
    chapter: 1,
    plus: false,
    unlockAfterBrightDays: 0,
    lootItems: ['seta', 'trebol', 'bellota', 'pina', 'hoja'],
    lootFriends: ['musguito'],
  },
  {
    id: 'pradera-suave',
    art: 'linear-gradient(170deg, #FFE3A3, #8FD1A6 50%, #3E6A6A)',
    chapter: 1,
    plus: false,
    unlockAfterBrightDays: 0,
    lootItems: ['trebol', 'fresa', 'semilla', 'calcetin'],
    lootFriends: ['musguito'],
  },
  {
    id: 'dientes-de-leon',
    art: 'linear-gradient(170deg, #FFE3A3, #FFB4A2 60%, #8C7BD8)',
    chapter: 1,
    plus: false,
    unlockAfterBrightDays: 1,
    lootItems: ['semilla', 'pluma', 'burbuja', 'boton'],
    lootFriends: ['chispin'],
  },
  {
    id: 'jardin-setas',
    art: 'linear-gradient(170deg, #FFB4A2, #8C7BD8 60%, #2A2560)',
    chapter: 1,
    plus: false,
    unlockAfterBrightDays: 2,
    lootItems: ['seta', 'gota', 'campanilla', 'canica'],
    lootFriends: ['chispin'],
  },
  {
    id: 'lago-lunas',
    art: 'linear-gradient(170deg, #C9BFF2, #5F82C8 55%, #2A2560)',
    chapter: 1,
    plus: false,
    unlockAfterBrightDays: 3,
    lootItems: ['piedra', 'trocito-luna', 'nenufar', 'gota'],
    lootFriends: ['burbujo'],
  },

  // ── Capítulo 2 ─────────────────────────────────────────────
  {
    id: 'madriguera-vecino',
    art: 'linear-gradient(170deg, #FFC96B, #6B4A3E 70%)',
    chapter: 2,
    plus: false,
    unlockAfterBrightDays: 4,
    lootItems: ['galleta', 'taza', 'ovillo', 'boton', 'llave'],
    lootFriends: ['topito'],
  },
  {
    id: 'nube-baja',
    art: 'linear-gradient(170deg, #E6E0FB, #8C7BD8 50%, #1B1840)',
    chapter: 2,
    plus: false,
    unlockAfterBrightDays: 5,
    lootItems: ['gota', 'burbuja', 'pluma', 'bufanda'],
    lootFriends: ['nubecilla'],
  },
  {
    id: 'puente-raices',
    art: 'linear-gradient(165deg, #8FD1A6, #8C7BD8 55%, #13112E)',
    chapter: 2,
    plus: false,
    unlockAfterBrightDays: 6,
    lootItems: ['bellota', 'hoja', 'carta', 'calcetin'],
    lootFriends: ['pinchito'],
  },
  {
    id: 'cuevas-cristal',
    art: 'linear-gradient(160deg, #9FE3F0, #6A5FC0 60%, #1B1840)',
    chapter: 2,
    plus: false,
    unlockAfterBrightDays: 7,
    lootItems: ['cristal', 'geoda', 'piedra', 'vela', 'moneda'],
    lootFriends: ['hollin'],
  },
  {
    id: 'faro-dormido',
    art: 'linear-gradient(160deg, #FFC96B, #B06A7A 60%, #2A2560)',
    chapter: 2,
    plus: true,
    unlockAfterBrightDays: 4,
    lootItems: ['farolillo', 'vela', 'catalejo', 'concha', 'llave'],
    lootFriends: ['mochuelito'],
  },

  // ── Capítulo 3 ─────────────────────────────────────────────
  {
    id: 'charca-ranas',
    art: 'linear-gradient(165deg, #9FE3F0, #8FD1A6 45%, #2A2560)',
    chapter: 3,
    plus: false,
    unlockAfterBrightDays: 8,
    lootItems: ['nenufar', 'gota', 'canica', 'flor-luna'],
    lootFriends: ['ranita'],
  },
  {
    id: 'cascada-timida',
    art: 'linear-gradient(170deg, #E6E0FB, #9FE3F0 45%, #2A2560)',
    chapter: 3,
    plus: false,
    unlockAfterBrightDays: 9,
    lootItems: ['piedra', 'flor-luna', 'burbuja', 'geoda'],
    lootFriends: ['caracolina'],
  },
  {
    id: 'playa-conchas',
    art: 'linear-gradient(165deg, #FFE3A3, #FFB4A2 50%, #2A2560)',
    chapter: 3,
    plus: false,
    unlockAfterBrightDays: 11,
    lootItems: ['concha', 'moneda', 'barquito', 'canica'],
    lootFriends: ['caracolina', 'pinzas'],
  },
  {
    id: 'muelle-barcas',
    art: 'linear-gradient(170deg, #E6E0FB, #5F82C8 55%, #13112E)',
    chapter: 3,
    plus: false,
    unlockAfterBrightDays: 12,
    lootItems: ['barquito', 'carta', 'bufanda', 'mapa'],
    lootFriends: ['burbujo'],
  },
  {
    id: 'isla-reloj',
    art: 'linear-gradient(160deg, #C9BFF2, #FFC96B 55%, #2A2560)',
    chapter: 3,
    plus: true,
    unlockAfterBrightDays: 10,
    lootItems: ['reloj', 'engranaje', 'llave', 'mapa'],
    lootFriends: ['pinzas'],
  },

  // ── Capítulo 4 ─────────────────────────────────────────────
  {
    id: 'mercadillo-buhos',
    art: 'linear-gradient(165deg, #FFC96B, #8C7BD8 55%, #1B1840)',
    chapter: 4,
    plus: false,
    unlockAfterBrightDays: 13,
    lootItems: ['mapa', 'engranaje', 'moneda', 'catalejo', 'pluma'],
    lootFriends: ['mochuelito', 'pinchito'],
  },
  {
    id: 'tejados-aldea',
    art: 'linear-gradient(170deg, #8C7BD8, #2A2560 55%, #13112E)',
    chapter: 4,
    plus: false,
    unlockAfterBrightDays: 14,
    lootItems: ['farolillo', 'calcetin', 'ovillo', 'vela', 'reloj'],
    lootFriends: ['hollin'],
  },
  {
    id: 'montana-manta',
    art: 'linear-gradient(165deg, #E6E0FB, #C9BFF2 45%, #8C7BD8)',
    chapter: 4,
    plus: false,
    unlockAfterBrightDays: 16,
    lootItems: ['bufanda', 'piedra', 'cristal', 'pina'],
    lootFriends: ['nubecilla'],
  },
  {
    id: 'jardin-estrellas',
    art: 'linear-gradient(165deg, #FFE3A3, #C9BFF2 45%, #2A2560)',
    chapter: 4,
    plus: false,
    unlockAfterBrightDays: 20,
    lootItems: ['polvo-estrella', 'trocito-luna', 'flor-luna', 'farolillo', 'semilla'],
    lootFriends: ['estrellita'],
  },
  {
    id: 'observatorio-cometas',
    art: 'linear-gradient(160deg, #9FE3F0, #2A2560 55%, #13112E)',
    chapter: 4,
    plus: true,
    unlockAfterBrightDays: 15,
    lootItems: ['catalejo', 'engranaje', 'polvo-estrella', 'trocito-luna'],
    lootFriends: ['mochuelito'],
  },
];

export const DESTINATIONS: Destination[] = DATA.map((d) => {
  const text = content.places[d.id];
  return {
    ...d,
    image: IMAGES[d.id],
    name: text.name,
    the: text.the,
    from: text.from,
    chapterTitle: content.chapters[d.chapter as 1 | 2 | 3 | 4],
    caption: text.caption,
    quote: text.quote,
    stories: text.stories,
  };
});

export const destinationById = (id: string) => DESTINATIONS.find((d) => d.id === id);

/** "del Bosque de Musgo", "from the Moss Forest". */
export const fromDestination = (d: Pick<Destination, 'from'>) => d.from;

/** "el Bosque de Musgo", "the Moss Forest". */
export const withArticle = (d: Pick<Destination, 'the'>) => d.the;
