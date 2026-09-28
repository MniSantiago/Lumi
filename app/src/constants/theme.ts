/**
 * Sistema visual de Lumi (ver PROCESO.md, sección 4). Todo sale de la criatura:
 * noche índigo de fondo, lavanda de su piel y ámbar de su luz.
 * Tema oscuro único a propósito: la app es un mundo nocturno.
 */

export const Colors = {
  night: '#1B1840',
  nightDeep: '#13112E',
  indigo: '#2A2560',
  violet: '#8C7BD8',
  lavender: '#C9BFF2',
  lavenderPale: '#E6E0FB',
  /** La luz de Lumi: se reserva para "luz", acentos y acciones principales. */
  amber: '#FFC96B',
  amberPale: '#FFE3A3',
  peach: '#FFB4A2',

  text: '#F4F0FF',
  textSecondary: '#B9B0E6',
  textTertiary: '#A69FD8',
  onAmber: '#2A1D05',

  card: 'rgba(42, 37, 96, 0.72)',
  cardSolid: '#2A2560',
  hairline: 'rgba(201, 191, 242, 0.16)',
} as const;

/** Nombres de familia tal como los registra `useFonts` en el layout raíz. */
export const Fonts = {
  /** Títulos de cuento. */
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodySemiBold: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
} as const;
