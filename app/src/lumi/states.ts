import type { ImageSourcePropType } from 'react-native';

/**
 * iOS no deja leer los minutos exactos de Screen Time: solo avisa cuando se
 * cruza un umbral (`DeviceActivityMonitor`). Por eso todo el estado de Lumi se
 * deriva del último umbral alcanzado, no de un contador de minutos.
 */
export type Threshold = 0 | 25 | 50 | 75 | 100;
export const THRESHOLDS: readonly Threshold[] = [0, 25, 50, 75, 100];

export type LumiStateKey = 'radiante' | 'contenta' | 'cansada' | 'apagadita';

export type LumiState = {
  key: LumiStateKey;
  label: string;
  /** Tramos encendidos del medidor "Luz de hoy" (de 4). */
  lit: 1 | 2 | 3 | 4;
  /** Intensidad del halo y de las luciérnagas, 0-1. */
  glow: number;
  /** Cuánto se oscurece el mundo, 0-1 ("tu atención es luz"). */
  dim: number;
  /** Mientras está por encima del 50 %, sale de expedición. */
  exploring: boolean;
  image: ImageSourcePropType;
  bubble: string;
  /** Lo que dice al tocarla, por turnos. Siempre con cariño, nunca riñe. */
  chatter: string[];
  sparks: number;
};

export const LUMI_STATES: Record<LumiStateKey, LumiState> = {
  radiante: {
    key: 'radiante',
    label: 'Radiante',
    lit: 4,
    glow: 1,
    dim: 0,
    exploring: true,
    image: require('@/assets/lumi/radiante.png'),
    bubble: '¡Hoy brillo muchísimo! Me voy de viaje, te traigo algo bonito.',
    chatter: [
      '¡Jiji! Me haces cosquillas en la luz.',
      '¿Sabes? Hoy el mundo se ve más bonito desde aquí.',
      'Te guardo un sitio en la postal de esta noche.',
      '¡Mira cómo brillo! Es gracias a ti.',
    ],
    sparks: 22,
  },
  contenta: {
    key: 'contenta',
    label: 'Contenta',
    lit: 3,
    glow: 0.75,
    dim: 0.08,
    exploring: true,
    image: require('@/assets/lumi/contenta.png'),
    bubble: 'Hoy vamos bien. Si aguantas un ratito más, esta noche te traigo una postal.',
    chatter: [
      'Voy tarareando por el camino. ¿Me oyes?',
      'Un ratito más sin scroll y llego lejísimos.',
      'Me gusta cuando me saludas.',
      'Hoy huele a musgo y a aventura.',
    ],
    sparks: 14,
  },
  cansada: {
    key: 'cansada',
    label: 'Cansada',
    lit: 2,
    glow: 0.42,
    dim: 0.22,
    exploring: false,
    image: require('@/assets/lumi/cansada.png'),
    bubble: 'Uff, se me está gastando la luz… ¿dejamos el móvil un rato y miramos las estrellas?',
    chatter: [
      'Uaaah… perdona, se me escapó un bostezo.',
      '¿Y si miramos por la ventana un ratito?',
      'Me recargo mejor cuando el móvil descansa.',
      'Con un poquito de calma vuelvo a brillar.',
    ],
    sparks: 6,
  },
  apagadita: {
    key: 'apagadita',
    label: 'Apagadita',
    lit: 1,
    glow: 0.16,
    dim: 0.38,
    exploring: false,
    image: require('@/assets/lumi/apagadita.png'),
    bubble: 'Me echo una siestecita. Te echaba de menos, mañana empezamos de cero.',
    chatter: [
      'Zzz… cinco minutitos más…',
      '*se da la vuelta y sonríe en sueños*',
      'Mmm… mañana brillamos juntos…',
      'Zzz… te quiero… zzz…',
    ],
    sparks: 2,
  },
};

export function stateForThreshold(t: Threshold): LumiState {
  if (t >= 75) return LUMI_STATES.apagadita;
  if (t >= 50) return LUMI_STATES.cansada;
  if (t >= 25) return LUMI_STATES.contenta;
  return LUMI_STATES.radiante;
}
