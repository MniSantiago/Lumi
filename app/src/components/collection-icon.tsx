import { Image, type ImageSource } from 'expo-image';
import type { ReactNode } from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { Colors } from '@/constants/theme';

/**
 * Ilustraciones de objetos y criaturas amigas (`assets/collection`), generadas con
 * APIMart y recortadas con `tools/slice_sheets.py`. La clave es el `icon` del catálogo.
 */
const ARTWORK: Record<string, ImageSource> = {
  // Objetos
  piedra: require('../../assets/collection/piedra.webp'),
  semilla: require('../../assets/collection/semilla.webp'),
  trebol: require('../../assets/collection/trebol.webp'),
  seta: require('../../assets/collection/seta.webp'),
  cristal: require('../../assets/collection/cristal.webp'),
  farolillo: require('../../assets/collection/farolillo.webp'),
  bellota: require('../../assets/collection/bellota.webp'),
  pluma: require('../../assets/collection/pluma.webp'),
  hoja: require('../../assets/collection/hoja.webp'),
  concha: require('../../assets/collection/concha.webp'),
  gota: require('../../assets/collection/gota.webp'),
  llave: require('../../assets/collection/llave.webp'),
  boton: require('../../assets/collection/boton.webp'),
  galleta: require('../../assets/collection/galleta.webp'),
  taza: require('../../assets/collection/taza.webp'),
  barquito: require('../../assets/collection/barquito.webp'),
  canica: require('../../assets/collection/canica.webp'),
  campanilla: require('../../assets/collection/campanilla.webp'),
  'flor-luna': require('../../assets/collection/flor-luna.webp'),
  fresa: require('../../assets/collection/fresa.webp'),
  ovillo: require('../../assets/collection/ovillo.webp'),
  mapa: require('../../assets/collection/mapa.webp'),
  carta: require('../../assets/collection/carta.webp'),
  reloj: require('../../assets/collection/reloj.webp'),
  engranaje: require('../../assets/collection/engranaje.webp'),
  vela: require('../../assets/collection/vela.webp'),
  catalejo: require('../../assets/collection/catalejo.webp'),
  'polvo-estrella': require('../../assets/collection/polvo-estrella.webp'),
  'trocito-luna': require('../../assets/collection/trocito-luna.webp'),
  pina: require('../../assets/collection/pina.webp'),
  geoda: require('../../assets/collection/geoda.webp'),
  nenufar: require('../../assets/collection/nenufar.webp'),
  bufanda: require('../../assets/collection/bufanda.webp'),
  moneda: require('../../assets/collection/moneda.webp'),
  calcetin: require('../../assets/collection/calcetin.webp'),
  burbuja: require('../../assets/collection/burbuja.webp'),
  // Criaturas amigas
  musguito: require('../../assets/collection/musguito.webp'),
  hollin: require('../../assets/collection/hollin.webp'),
  nubecilla: require('../../assets/collection/nubecilla.webp'),
  chispin: require('../../assets/collection/chispin.webp'),
  topito: require('../../assets/collection/topito.webp'),
  pinchito: require('../../assets/collection/pinchito.webp'),
  ranita: require('../../assets/collection/ranita.webp'),
  caracolina: require('../../assets/collection/caracolina.webp'),
  burbujo: require('../../assets/collection/burbujo.webp'),
  pinzas: require('../../assets/collection/pinzas.webp'),
  mochuelito: require('../../assets/collection/mochuelito.webp'),
  estrellita: require('../../assets/collection/estrellita.webp'),
};

/** Siluetas (SVG 40×40) de lo que falta por descubrir. */
const MYSTERY: Record<string, ReactNode> = {
  'misterio-arco': <Path d="M8 30 Q20 4 32 30Z" fill={Colors.lavender} />,
  'misterio-caja': <Rect x={10} y={12} width={20} height={18} rx={4} fill={Colors.lavender} />,
  'misterio-bola': <Circle cx={20} cy={20} r={11} fill={Colors.lavender} />,
  'misterio-ovalo': <Ellipse cx={20} cy={22} rx={13} ry={9} fill={Colors.lavender} />,
  'misterio-pico': <Path d="M10 30 Q20 6 30 30Z" fill={Colors.lavender} />,
};

export function CollectionIcon({ name, size = 40, locked = false }: { name: string; size?: number; locked?: boolean }) {
  const art = ARTWORK[name];
  if (art) {
    return (
      <Image
        source={art}
        style={{ width: size, height: size, opacity: locked ? 0.25 : 1 }}
        contentFit="contain"
        accessibilityIgnoresInvertColors
      />
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" opacity={locked ? 0.25 : 1}>
      {MYSTERY[name]}
    </Svg>
  );
}
