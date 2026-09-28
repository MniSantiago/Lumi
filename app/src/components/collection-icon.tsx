import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

/** Dibujos de objetos y criaturas amigas, los mismos SVG (40×40) del mockup. */
const ICONS: Record<string, ReactNode> = {
  piedra: (
    <>
      <Circle cx={20} cy={22} r={11} fill="#C9BFF2" />
      <Circle cx={16} cy={18} r={3} fill="#fff" opacity={0.6} />
    </>
  ),
  semilla: (
    <>
      <Path d="M20 34 V16" stroke="#8FD1A6" strokeWidth={2} />
      <G stroke="#FFE3A3" strokeWidth={1.5}>
        <Path d="M20 14 L20 4 M20 14 L28 8 M20 14 L12 8 M20 14 L30 15 M20 14 L10 15" />
      </G>
    </>
  ),
  trebol: <Path d="M20 8 C 26 16, 30 20, 20 32 C 10 20, 14 16, 20 8Z" fill="#8FD1A6" />,
  seta: (
    <>
      <Rect x={18} y={20} width={4} height={12} rx={2} fill="#E6E0FB" />
      <Path d="M8 21 A12 10 0 0 1 32 21Z" fill="#FFB4A2" />
      <Circle cx={15} cy={16} r={2} fill="#fff" />
      <Circle cx={24} cy={14} r={1.5} fill="#fff" />
    </>
  ),
  cristal: (
    <>
      <Path d="M10 28 L20 8 L30 28Z" fill="#9FE3F0" />
      <Path d="M20 8 L24 28" stroke="#fff" opacity={0.5} />
    </>
  ),
  farolillo: (
    <>
      <Circle cx={20} cy={20} r={16} fill="#FFC96B" opacity={0.25} />
      <Circle cx={20} cy={20} r={10} fill="#FFE3A3" />
    </>
  ),
  musguito: (
    <>
      <Ellipse cx={20} cy={24} rx={12} ry={10} fill="#8FD1A6" />
      <Circle cx={16} cy={22} r={1.8} fill="#1B1840" />
      <Circle cx={24} cy={22} r={1.8} fill="#1B1840" />
      <Path d="M14 14 L12 8 M26 14 L28 8" stroke="#8FD1A6" strokeWidth={2.5} strokeLinecap="round" />
    </>
  ),
  hollin: (
    <>
      <Circle cx={20} cy={22} r={11} fill="#1B1840" stroke="#8C7BD8" />
      <Circle cx={16} cy={21} r={2.5} fill="#fff" />
      <Circle cx={24} cy={21} r={2.5} fill="#fff" />
    </>
  ),
  nubecilla: (
    <>
      <Path d="M8 26 C 8 14, 32 14, 32 26 Z" fill="#E6E0FB" />
      <Circle cx={16} cy={22} r={1.6} fill="#1B1840" />
      <Circle cx={24} cy={22} r={1.6} fill="#1B1840" />
    </>
  ),
  // Siluetas de lo que falta por descubrir.
  'misterio-arco': <Path d="M8 30 Q20 4 32 30Z" fill={Colors.lavender} />,
  'misterio-caja': <Rect x={10} y={12} width={20} height={18} rx={4} fill={Colors.lavender} />,
  'misterio-bola': <Circle cx={20} cy={20} r={11} fill={Colors.lavender} />,
  'misterio-ovalo': <Ellipse cx={20} cy={22} rx={13} ry={9} fill={Colors.lavender} />,
  'misterio-pico': <Path d="M10 30 Q20 6 30 30Z" fill={Colors.lavender} />,
};

export function CollectionIcon({ name, size = 40, locked = false }: { name: string; size?: number; locked?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" opacity={locked ? 0.25 : 1}>
      {ICONS[name]}
    </Svg>
  );
}
