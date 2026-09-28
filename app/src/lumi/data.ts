/**
 * Contenido de ejemplo, el mismo del mockup. Más adelante saldrá del progreso
 * real (expediciones completadas, objetos traídos, racha).
 */

export type ZoneStatus = 'visited' | 'current' | 'locked' | 'plus';

export type Zone = {
  id: string;
  name: string;
  note: string;
  status: ZoneStatus;
  emoji: string;
};

export const CURRENT_EXPEDITION = {
  zone: 'Bosque de Musgo',
  returnsAt: '21:00',
  progress: 0.68,
};

export const ZONES: Zone[] = [
  { id: 'dientes-de-leon', name: 'Colina de los Dientes de León', note: 'Visitada el lunes. Trajo una semilla que vuela.', status: 'visited', emoji: '🌾' },
  { id: 'lago-lunas', name: 'Lago de las Lunas', note: 'Visitada el miércoles. Postal y una piedra lisa.', status: 'visited', emoji: '🌙' },
  { id: 'bosque-musgo', name: 'Bosque de Musgo', note: 'Ahora mismo. Vuelve a las 21:00.', status: 'current', emoji: '🌿' },
  { id: 'cuevas-cristal', name: 'Cuevas de Cristal', note: 'Se abre con 3 días más de luz.', status: 'locked', emoji: '💎' },
  { id: 'faro-dormido', name: 'Faro Dormido', note: 'Zona de Lumi Plus.', status: 'plus', emoji: '🗼' },
];

export type Postcard = { id: string; place: string; quote: string; chapter: number; emoji: string };

export const POSTCARDS: Postcard[] = [
  { id: 'p1', place: 'Lago de las Lunas', quote: 'Había dos lunas y ninguna era de queso.', chapter: 1, emoji: '🌙' },
  { id: 'p2', place: 'Colina de los Dientes de León', quote: 'Me hice amiga de un soplido.', chapter: 1, emoji: '🌾' },
  { id: 'p3', place: 'Pradera Suave', quote: 'Te guardé un trébol.', chapter: 1, emoji: '🍀' },
  { id: 'p4', place: 'Jardín de Setas', quote: 'Una seta me guiñó un ojo. Creo.', chapter: 1, emoji: '🍄' },
  { id: 'p5', place: 'Nube Baja', quote: 'Estaba blandita y un poco mojada.', chapter: 2, emoji: '☁️' },
  { id: 'p6', place: 'Madriguera del Vecino', quote: 'Tenía galletas. No te digo más.', chapter: 2, emoji: '🏡' },
];
export const TOTAL_DESTINATIONS = 20;

export type Item = { id: string; name: string | null; emoji: string };

export const ITEMS: Item[] = [
  { id: 'o1', name: 'Piedra lisa', emoji: '🪨' },
  { id: 'o2', name: 'Semilla voladora', emoji: '🌱' },
  { id: 'o3', name: 'Trébol', emoji: '🍀' },
  { id: 'o4', name: 'Seta brillante', emoji: '🍄' },
  { id: 'o5', name: 'Cristal pequeño', emoji: '💎' },
  { id: 'o6', name: 'Farolillo', emoji: '🏮' },
  { id: 'o7', name: null, emoji: '' },
  { id: 'o8', name: null, emoji: '' },
  { id: 'o9', name: null, emoji: '' },
];
export const TOTAL_ITEMS = 36;

export const FRIENDS: Item[] = [
  { id: 'f1', name: 'Musguito', emoji: '🐛' },
  { id: 'f2', name: 'Hollín', emoji: '🖤' },
  { id: 'f3', name: 'Nubecilla', emoji: '☁️' },
  { id: 'f4', name: null, emoji: '' },
  { id: 'f5', name: null, emoji: '' },
  { id: 'f6', name: null, emoji: '' },
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
