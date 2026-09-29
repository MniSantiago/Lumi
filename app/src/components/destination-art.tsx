import { Image, type ImageSource } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

/**
 * La ilustración de un lugar: su imagen si la tiene y, debajo, el degradado
 * (mientras carga, y como respaldo para los lugares aún sin dibujo).
 */
export function DestinationArt({
  art,
  image,
  style,
  children,
}: {
  art: string;
  image?: ImageSource;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  return (
    <View style={[style, styles.clip, { experimental_backgroundImage: art }]}>
      {image ? <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ clip: { overflow: 'hidden' } });
