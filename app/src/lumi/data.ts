/**
 * Contenido de ejemplo, el mismo del mockup. Más adelante saldrá del progreso
 * real (expediciones completadas, objetos traídos, racha).
 */

/** Ilustraciones provisionales de cada lugar (los degradados del mockup). */
const ART = {
  lagoLunas: 'linear-gradient(170deg, #C9BFF2, #5F82C8 55%, #2A2560)',
  dientesDeLeon: 'linear-gradient(170deg, #FFE3A3, #FFB4A2 60%, #8C7BD8)',
  praderaSuave: 'linear-gradient(170deg, #8FD1A6, #3E6A6A 60%, #1D2446)',
  jardinSetas: 'linear-gradient(170deg, #FFB4A2, #8C7BD8 60%, #2A2560)',
  nubeBaja: 'linear-gradient(170deg, #E6E0FB, #8C7BD8 50%, #1B1840)',
  madrigueraVecino: 'linear-gradient(170deg, #FFC96B, #6B4A3E 70%)',
};

export type ZoneStatus = 'visited' | 'current' | 'locked' | 'plus';

export type Zone = {
  id: string;
  name: string;
  note: string;
  status: ZoneStatus;
  /** Miniatura: degradado CSS del mockup (`experimental_backgroundImage`). */
  art: string;
};

export const CURRENT_EXPEDITION = {
  zone: 'Bosque de Musgo',
  returnsAt: '21:00',
  progress: 0.68,
};

export const ZONES: Zone[] = [
  { id: 'dientes-de-leon', name: 'Colina de los Dientes de León', note: 'Visitada el lunes. Trajo una semilla que vuela.', status: 'visited', art: ART.dientesDeLeon },
  { id: 'lago-lunas', name: 'Lago de las Lunas', note: 'Visitada el miércoles. Postal y una piedra lisa.', status: 'visited', art: ART.lagoLunas },
  { id: 'bosque-musgo', name: 'Bosque de Musgo', note: 'Ahora mismo. Vuelve a las 21:00.', status: 'current', art: 'radial-gradient(circle at 40% 70%, #8FD1A6 0%, #8FD1A6 10%, transparent 11%), linear-gradient(160deg, #3E6A6A, #1D2446)' },
  { id: 'cuevas-cristal', name: 'Cuevas de Cristal', note: 'Se abre con 3 días más de luz.', status: 'locked', art: 'linear-gradient(160deg, #9FE3F0, #6A5FC0 60%, #1B1840)' },
  { id: 'faro-dormido', name: 'Faro Dormido', note: 'Zona de Lumi Plus.', status: 'plus', art: 'linear-gradient(160deg, #FFC96B, #B06A7A 60%, #2A2560)' },
];

export type Postcard = { id: string; place: string; quote: string; chapter: number; art: string };

export const POSTCARDS: Postcard[] = [
  { id: 'p1', place: 'Lago de las Lunas', quote: 'Había dos lunas y ninguna era de queso.', chapter: 1, art: ART.lagoLunas },
  { id: 'p2', place: 'Colina de los Dientes de León', quote: 'Me hice amiga de un soplido.', chapter: 1, art: ART.dientesDeLeon },
  { id: 'p3', place: 'Pradera Suave', quote: 'Te guardé un trébol.', chapter: 1, art: ART.praderaSuave },
  { id: 'p4', place: 'Jardín de Setas', quote: 'Una seta me guiñó un ojo. Creo.', chapter: 1, art: ART.jardinSetas },
  { id: 'p5', place: 'Nube Baja', quote: 'Estaba blandita y un poco mojada.', chapter: 2, art: ART.nubeBaja },
  { id: 'p6', place: 'Madriguera del Vecino', quote: 'Tenía galletas. No te digo más.', chapter: 2, art: ART.madrigueraVecino },
];
export const TOTAL_DESTINATIONS = 20;

/** `icon` es la clave de su dibujo en `components/collection-icon.tsx`. `name: null` = aún sin descubrir. */
export type Item = { id: string; name: string | null; icon: string };

export const ITEMS: Item[] = [
  { id: 'o1', name: 'Piedra lisa', icon: 'piedra' },
  { id: 'o2', name: 'Semilla voladora', icon: 'semilla' },
  { id: 'o3', name: 'Trébol', icon: 'trebol' },
  { id: 'o4', name: 'Seta brillante', icon: 'seta' },
  { id: 'o5', name: 'Cristal pequeño', icon: 'cristal' },
  { id: 'o6', name: 'Farolillo', icon: 'farolillo' },
  { id: 'o7', name: null, icon: 'misterio-arco' },
  { id: 'o8', name: null, icon: 'misterio-caja' },
  { id: 'o9', name: null, icon: 'misterio-bola' },
];
export const TOTAL_ITEMS = 36;

export const FRIENDS: Item[] = [
  { id: 'f1', name: 'Musguito', icon: 'musguito' },
  { id: 'f2', name: 'Hollín', icon: 'hollin' },
  { id: 'f3', name: 'Nubecilla', icon: 'nubecilla' },
  { id: 'f4', name: null, icon: 'misterio-bola' },
  { id: 'f5', name: null, icon: 'misterio-ovalo' },
  { id: 'f6', name: null, icon: 'misterio-pico' },
];
export const TOTAL_FRIENDS = 12;

/** Luz que le quedó a Lumi al final de cada día, en tramos (0 = día de descanso). */
export const WEEK: { day: string; lit: 0 | 1 | 2 | 3 | 4 }[] = [
  { day: 'L', lit: 3 },
  { day: 'M', lit: 4 },
  { day: 'X', lit: 3 },
  { day: 'J', lit: 0 },
  { day: 'V', lit: 2 },
  { day: 'S', lit: 4 },
  { day: 'D', lit: 3 },
];

export const STREAK_DAYS = 12;

export const EVOLUTION = {
  stages: ['Chispa', 'Farolito', 'Estrella', 'Aurora'],
  current: 0,
  week: 2,
  weeksPerStage: 4,
};

export const THIEF_APPS = [
  { id: 'tiktok', name: 'TikTok', letter: 'T', color: '#25F4EE' },
  { id: 'instagram', name: 'Instagram', letter: 'I', color: '#E1306C' },
  { id: 'youtube', name: 'YouTube', letter: 'Y', color: '#FF4E45', note: 'Solo Shorts no se puede separar en iOS' },
];
