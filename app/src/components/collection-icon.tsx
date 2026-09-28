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
  bellota: (
    <>
      <Ellipse cx={20} cy={25} rx={8} ry={9} fill="#FFC96B" />
      <Path d="M10 20 A10 7 0 0 1 30 20Z" fill="#6B4A3E" />
      <Path d="M20 13 V8" stroke="#6B4A3E" strokeWidth={2.5} strokeLinecap="round" />
      <Circle cx={17} cy={25} r={1.8} fill="#fff" opacity={0.5} />
    </>
  ),
  pluma: (
    <>
      <Path d="M29 6 C 15 10, 10 24, 12 34 C 22 28, 31 18, 29 6Z" fill="#C9BFF2" />
      <Path d="M12 34 L26 11" stroke="#fff" strokeWidth={1.5} opacity={0.6} />
    </>
  ),
  hoja: (
    <>
      <Path d="M8 31 C 8 15, 20 8, 32 8 C 32 22, 24 32, 8 31Z" fill="#FFC96B" />
      <Path d="M10 30 L28 12" stroke="#FFE3A3" strokeWidth={1.5} />
    </>
  ),
  concha: (
    <>
      <Path d="M7 25 A13 13 0 0 1 33 25 L20 33Z" fill="#FFB4A2" />
      <Path d="M20 33 L13 15 M20 33 L20 12 M20 33 L27 15" stroke="#fff" strokeWidth={1.5} opacity={0.5} />
    </>
  ),
  gota: (
    <>
      <Path d="M20 6 C 25 14, 30 19, 30 25 A10 10 0 0 1 10 25 C 10 19, 15 14, 20 6Z" fill="#9FE3F0" />
      <Circle cx={16} cy={25} r={2.5} fill="#fff" opacity={0.6} />
    </>
  ),
  llave: (
    <>
      <Circle cx={12} cy={20} r={5.5} stroke="#FFC96B" strokeWidth={3} fill="none" />
      <Path d="M18 20 H33 M29 20 V25 M25 20 V24" stroke="#FFC96B" strokeWidth={3} strokeLinecap="round" />
    </>
  ),
  boton: (
    <>
      <Circle cx={20} cy={20} r={11} fill="#8C7BD8" />
      <G fill="#1B1840">
        <Circle cx={17} cy={17} r={1.6} />
        <Circle cx={23} cy={17} r={1.6} />
        <Circle cx={17} cy={23} r={1.6} />
        <Circle cx={23} cy={23} r={1.6} />
      </G>
    </>
  ),
  galleta: (
    <>
      <Circle cx={20} cy={21} r={12} fill="#FFC96B" />
      <G fill="#6B4A3E">
        <Circle cx={15} cy={17} r={1.8} />
        <Circle cx={24} cy={19} r={1.8} />
        <Circle cx={18} cy={26} r={1.8} />
        <Circle cx={26} cy={26} r={1.4} />
      </G>
    </>
  ),
  taza: (
    <>
      <Rect x={11} y={17} width={18} height={15} rx={4} fill="#E6E0FB" />
      <Rect x={11} y={20} width={18} height={3} fill="#FFB4A2" />
      <Path
        d="M17 13 C 15 10, 19 9, 17 5 M23 13 C 21 10, 25 9, 23 5"
        stroke="#C9BFF2"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
  barquito: (
    <>
      <Path d="M5 25 L35 25 L29 32 L11 32Z" fill="#E6E0FB" />
      <Path d="M20 9 L29 25 L11 25Z" fill="#C9BFF2" />
    </>
  ),
  canica: (
    <>
      <Circle cx={20} cy={21} r={11} fill="#9FE3F0" />
      <Path d="M13 23 C 17 14, 23 28, 28 18" stroke="#8C7BD8" strokeWidth={2} fill="none" />
      <Circle cx={16} cy={16} r={2.2} fill="#fff" opacity={0.7} />
    </>
  ),
  campanilla: (
    <>
      <Path d="M20 17 C 20 11, 25 8, 29 6" stroke="#8FD1A6" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M13 27 C 13 14, 27 14, 27 27 L30 31 L10 31Z" fill="#C9BFF2" />
      <Circle cx={20} cy={32} r={2} fill="#FFE3A3" />
    </>
  ),
  'flor-luna': (
    <>
      <G fill="#E6E0FB">
        <Circle cx={20} cy={12} r={6} />
        <Circle cx={28} cy={18} r={6} />
        <Circle cx={25} cy={28} r={6} />
        <Circle cx={15} cy={28} r={6} />
        <Circle cx={12} cy={18} r={6} />
      </G>
      <Circle cx={20} cy={21} r={4.5} fill="#FFE3A3" />
    </>
  ),
  fresa: (
    <>
      <Path d="M20 34 C 9 26, 9 16, 20 16 C 31 16, 31 26, 20 34Z" fill="#FFB4A2" />
      <Path d="M13 17 L17 11 L20 15 L23 11 L27 17Z" fill="#8FD1A6" />
      <G fill="#FFE3A3">
        <Circle cx={16} cy={22} r={1.2} />
        <Circle cx={23} cy={21} r={1.2} />
        <Circle cx={20} cy={27} r={1.2} />
      </G>
    </>
  ),
  ovillo: (
    <>
      <Path d="M27 29 C 31 33, 33 30, 36 35" stroke="#FFB4A2" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Circle cx={19} cy={20} r={11} fill="#FFB4A2" />
      <Path
        d="M11 14 C 18 18, 23 24, 25 30 M9 21 C 16 22, 21 26, 22 31 M15 10 C 21 13, 27 18, 30 21"
        stroke="#fff"
        strokeWidth={1.2}
        opacity={0.5}
        fill="none"
      />
    </>
  ),
  mapa: (
    <>
      <Path d="M6 12 L15 9 L25 12 L34 9 V29 L25 32 L15 29 L6 32Z" fill="#FFE3A3" />
      <Path d="M10 27 C 15 19, 21 25, 26 16" stroke="#FFB4A2" strokeWidth={1.5} strokeDasharray="2 2" fill="none" />
      <Path d="M26 12 L30 16 M30 12 L26 16" stroke="#8C7BD8" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  carta: (
    <>
      <Rect x={7} y={11} width={26} height={19} rx={2.5} fill="#E6E0FB" />
      <Path d="M7 12 L20 22 L33 12" stroke="#8C7BD8" strokeWidth={1.5} fill="none" />
      <Circle cx={20} cy={22} r={3} fill="#FFB4A2" />
    </>
  ),
  reloj: (
    <>
      <Rect x={18} y={6} width={4} height={5} rx={1.5} fill="#FFC96B" />
      <Circle cx={20} cy={22} r={11} fill="#FFE3A3" stroke="#FFC96B" strokeWidth={2} />
      <Path d="M20 22 V15 M20 22 L25 24" stroke="#2A2560" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  engranaje: (
    <>
      <G fill="#C9BFF2">
        <Rect x={17.5} y={6} width={5} height={28} rx={1.5} />
        <Rect x={17.5} y={6} width={5} height={28} rx={1.5} rotation={45} origin={[20, 20]} />
        <Rect x={17.5} y={6} width={5} height={28} rx={1.5} rotation={90} origin={[20, 20]} />
        <Rect x={17.5} y={6} width={5} height={28} rx={1.5} rotation={135} origin={[20, 20]} />
        <Circle cx={20} cy={20} r={10} />
      </G>
      <Circle cx={20} cy={20} r={3.5} fill="#1B1840" />
    </>
  ),
  vela: (
    <>
      <Circle cx={20} cy={12} r={7} fill="#FFC96B" opacity={0.25} />
      <Rect x={15} y={18} width={10} height={16} rx={2} fill="#E6E0FB" />
      <Path d="M20 6 C 24 11, 23 15, 20 16 C 17 15, 16 11, 20 6Z" fill="#FFC96B" />
    </>
  ),
  catalejo: (
    <>
      <Path d="M7 28 L24 13 L29 18 L12 33Z" fill="#8C7BD8" />
      <Path d="M24 11 L28 7 L34 13 L30 17Z" fill="#FFC96B" />
      <Circle cx={10} cy={31} r={2} fill="#C9BFF2" />
    </>
  ),
  'polvo-estrella': (
    <>
      <Rect x={14} y={8} width={12} height={5} rx={2} fill="#8C7BD8" />
      <Rect x={11} y={13} width={18} height={21} rx={6} fill="#C9BFF2" opacity={0.45} />
      <G fill="#FFE3A3">
        <Circle cx={17} cy={21} r={1.8} />
        <Circle cx={23} cy={25} r={2.2} />
        <Circle cx={18} cy={29} r={1.4} />
      </G>
    </>
  ),
  'trocito-luna': <Path d="M25 7 A14 14 0 1 0 32 29 A11 11 0 1 1 25 7Z" fill="#FFE3A3" />,
  pina: (
    <>
      <Ellipse cx={20} cy={22} rx={9} ry={12} fill="#6B4A3E" />
      <Path
        d="M12 17 Q20 21 28 17 M11 23 Q20 27 29 23 M13 29 Q20 32 27 29"
        stroke="#FFC96B"
        strokeWidth={1.5}
        opacity={0.6}
        fill="none"
      />
    </>
  ),
  geoda: (
    <>
      <Circle cx={20} cy={21} r={12} fill="#8C7BD8" />
      <Path d="M20 12 L27 17 L26 26 L20 30 L14 26 L13 17Z" fill="#9FE3F0" />
      <Path d="M20 12 V30" stroke="#fff" strokeWidth={1.2} opacity={0.5} />
    </>
  ),
  nenufar: (
    <>
      <Ellipse cx={20} cy={27} rx={15} ry={7} fill="#8FD1A6" />
      <Path d="M20 27 L33 23 L34 28Z" fill="#3E6A6A" />
      <Path d="M13 24 L16 14 L20 20 L24 14 L27 24Z" fill="#FFB4A2" />
    </>
  ),
  bufanda: (
    <>
      <Path d="M7 13 C 15 18, 25 18, 33 13 L33 20 C 25 24, 15 24, 7 20Z" fill="#FFB4A2" />
      <Rect x={22} y={19} width={7} height={15} rx={2} fill="#FFB4A2" />
      <Path d="M22 26 H29 M22 30 H29" stroke="#fff" strokeWidth={1.5} opacity={0.6} />
    </>
  ),
  moneda: (
    <>
      <Circle cx={20} cy={20} r={11} fill="#FFC96B" />
      <Circle cx={20} cy={20} r={8} stroke="#FFE3A3" strokeWidth={1.5} fill="none" />
      <Path
        d="M20 15 L21.3 18.2 L24.8 18.5 L22.1 20.7 L22.9 24 L20 22.2 L17.1 24 L17.9 20.7 L15.2 18.5 L18.7 18.2Z"
        fill="#FFE3A3"
      />
    </>
  ),
  calcetin: (
    <>
      <Path
        d="M14 6 H25 V22 C 25 25, 28 26, 31 28 C 34 31, 31 36, 26 34 L17 30 C 14 29, 14 26, 14 24Z"
        fill="#8FD1A6"
      />
      <Rect x={14} y={6} width={11} height={5} rx={1.5} fill="#E6E0FB" />
      <Path d="M14 17 H25" stroke="#fff" strokeWidth={1.5} opacity={0.5} />
    </>
  ),
  burbuja: (
    <>
      <Circle cx={20} cy={20} r={12} fill="#9FE3F0" fillOpacity={0.25} stroke="#9FE3F0" strokeWidth={1.5} />
      <Path d="M13 17 A8 8 0 0 1 19 11" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" />
      <Circle cx={26} cy={26} r={1.5} fill="#fff" opacity={0.7} />
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
  chispin: (
    <>
      <Circle cx={20} cy={22} r={15} fill="#FFC96B" opacity={0.2} />
      <Ellipse cx={12} cy={14} rx={5} ry={3.5} fill="#E6E0FB" opacity={0.8} />
      <Ellipse cx={28} cy={14} rx={5} ry={3.5} fill="#E6E0FB" opacity={0.8} />
      <Ellipse cx={20} cy={22} rx={8} ry={9} fill="#FFE3A3" />
      <Circle cx={17} cy={21} r={1.6} fill="#1B1840" />
      <Circle cx={23} cy={21} r={1.6} fill="#1B1840" />
    </>
  ),
  topito: (
    <>
      <Ellipse cx={20} cy={25} rx={13} ry={10} fill="#8C7BD8" />
      <Circle cx={16} cy={22} r={3.5} stroke="#FFE3A3" strokeWidth={1.2} fill="none" />
      <Circle cx={24} cy={22} r={3.5} stroke="#FFE3A3" strokeWidth={1.2} fill="none" />
      <Circle cx={16} cy={22} r={1.3} fill="#1B1840" />
      <Circle cx={24} cy={22} r={1.3} fill="#1B1840" />
      <Circle cx={20} cy={28} r={2.5} fill="#FFB4A2" />
    </>
  ),
  pinchito: (
    <>
      <Path d="M6 29 L9 18 L13 22 L15 11 L19 18 L22 9 L25 18 L29 12 L30 21 L34 19 L34 30Z" fill="#8C7BD8" />
      <Ellipse cx={20} cy={28} rx={10} ry={7} fill="#FFE3A3" />
      <Circle cx={17} cy={27} r={1.6} fill="#1B1840" />
      <Circle cx={23} cy={27} r={1.6} fill="#1B1840" />
      <Circle cx={20} cy={30} r={1.2} fill="#FFB4A2" />
    </>
  ),
  ranita: (
    <>
      <Circle cx={14} cy={18} r={4.5} fill="#8FD1A6" />
      <Circle cx={26} cy={18} r={4.5} fill="#8FD1A6" />
      <Ellipse cx={20} cy={26} rx={13} ry={9} fill="#8FD1A6" />
      <Circle cx={14} cy={18} r={2} fill="#1B1840" />
      <Circle cx={26} cy={18} r={2} fill="#1B1840" />
      <Path d="M16 27 Q20 30 24 27" stroke="#1B1840" strokeWidth={1.5} strokeLinecap="round" fill="none" />
    </>
  ),
  caracolina: (
    <>
      <Path d="M5 32 C 5 26, 9 24, 13 26 L35 30 C 35 32, 31 33, 27 33Z" fill="#C9BFF2" />
      <Path d="M8 26 L6 19 M11 26 L12 19" stroke="#C9BFF2" strokeWidth={2} strokeLinecap="round" />
      <Circle cx={23} cy={21} r={9} fill="#FFB4A2" />
      <Circle cx={23} cy={21} r={4} stroke="#fff" strokeWidth={1.5} opacity={0.6} fill="none" />
      <Circle cx={6} cy={18} r={1.6} fill="#1B1840" />
      <Circle cx={12} cy={18} r={1.6} fill="#1B1840" />
    </>
  ),
  burbujo: (
    <>
      <Path d="M27 20 L36 13 L36 27Z" fill="#9FE3F0" />
      <Ellipse cx={18} cy={20} rx={11} ry={8} fill="#9FE3F0" />
      <Circle cx={14} cy={19} r={1.6} fill="#1B1840" />
      <Circle cx={20} cy={19} r={1.6} fill="#1B1840" />
      <Circle cx={6} cy={10} r={2} stroke="#fff" strokeWidth={1} opacity={0.7} fill="none" />
    </>
  ),
  pinzas: (
    <>
      <Path d="M11 23 L8 19 M29 23 L32 19 M17 20 V14 M23 20 V14" stroke="#FFB4A2" strokeWidth={2} strokeLinecap="round" />
      <Circle cx={7} cy={16} r={4} fill="#FFB4A2" />
      <Circle cx={33} cy={16} r={4} fill="#FFB4A2" />
      <Ellipse cx={20} cy={26} rx={11} ry={7} fill="#FFB4A2" />
      <Circle cx={17} cy={13} r={2} fill="#1B1840" />
      <Circle cx={23} cy={13} r={2} fill="#1B1840" />
    </>
  ),
  mochuelito: (
    <>
      <Path d="M9 15 L11 6 L17 11Z M31 15 L29 6 L23 11Z" fill="#C9BFF2" />
      <Ellipse cx={20} cy={23} rx={12} ry={13} fill="#C9BFF2" />
      <Circle cx={15} cy={20} r={4.5} fill="#fff" />
      <Circle cx={25} cy={20} r={4.5} fill="#fff" />
      <Circle cx={15} cy={20} r={2} fill="#1B1840" />
      <Circle cx={25} cy={20} r={2} fill="#1B1840" />
      <Path d="M18.5 24 L21.5 24 L20 27Z" fill="#FFC96B" />
    </>
  ),
  estrellita: (
    <>
      <Circle cx={20} cy={21} r={16} fill="#FFC96B" opacity={0.2} />
      <Path
        d="M20 5 L23.8 15.5 L34.9 16.2 L26.2 23.3 L29 34.1 L20 28 L11 34.1 L13.8 23.3 L5.1 16.2 L16.2 15.5Z"
        fill="#FFE3A3"
        stroke="#FFE3A3"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Circle cx={17} cy={21} r={1.6} fill="#1B1840" />
      <Circle cx={23} cy={21} r={1.6} fill="#1B1840" />
      <Circle cx={15} cy={25} r={1.4} fill="#FFB4A2" />
      <Circle cx={25} cy={25} r={1.4} fill="#FFB4A2" />
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
