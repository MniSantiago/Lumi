import Svg, { Path } from 'react-native-svg';

/**
 * Chispa de cuatro puntas, dibujada en vectorial. Sustituye al carácter U+2726:
 * las fuentes de la app (Figtree, Fraunces) no lo traen y, según el sistema,
 * se pintaba como un recuadro con una interrogación.
 */
export function SparkGlyph({ size = 14, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      <Path d="M12 0 C13 7.5 16.5 11 24 12 C16.5 13 13 16.5 12 24 C11 16.5 7.5 13 0 12 C7.5 11 11 7.5 12 0 Z" fill={color} />
    </Svg>
  );
}
