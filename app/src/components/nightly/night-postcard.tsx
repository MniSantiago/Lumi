import type { ImageSource } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { DestinationArt } from '@/components/destination-art';
import { Colors, Fonts } from '@/constants/theme';

/** Estrellitas fijas sobre la ilustración (en % del ancho/alto). */
const STARS = [
  { x: 12, y: 18, r: 1.6 },
  { x: 27, y: 9, r: 1.1 },
  { x: 44, y: 22, r: 1.4 },
  { x: 63, y: 12, r: 1 },
  { x: 8, y: 44, r: 1 },
  { x: 52, y: 38, r: 0.9 },
];

/**
 * La postal grande de la noche: papel crema, ilustración del lugar con unas
 * estrellas, y un sello con la luna de Lampi. Variante ampliada de `PostcardView`.
 */
export function NightPostcard({
  title,
  caption,
  art,
  image,
  width,
  artHeight,
  stamp,
}: {
  title: string;
  caption: string;
  art: string;
  image?: ImageSource;
  width: number;
  artHeight: number;
  /** Texto pequeño del sello ("Cap. 3"). */
  stamp?: string;
}) {
  return (
    <View style={[styles.card, { width }]}>
      <DestinationArt art={art} image={image} style={[styles.art, { height: artHeight }]}>
        {STARS.map((s, i) => (
          <View
            key={i}
            style={[
              styles.star,
              { left: `${s.x}%`, top: `${s.y}%`, width: s.r * 2, height: s.r * 2, borderRadius: s.r },
            ]}
          />
        ))}
        <View style={styles.stamp}>
          <View style={styles.stampMoon} />
          {stamp ? <Text style={styles.stampText}>{stamp}</Text> : null}
        </View>
      </DestinationArt>
      <View style={styles.footer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderCurve: 'continuous',
    padding: 8,
    paddingBottom: 14,
    backgroundColor: Colors.paper,
    boxShadow: '0 22px 40px -16px rgba(0, 0, 0, 0.7), 0 0 60px -10px rgba(255, 201, 107, 0.25)',
  },
  art: { borderRadius: 12, borderCurve: 'continuous', overflow: 'hidden' },
  star: { position: 'absolute', backgroundColor: '#FFF8E6', opacity: 0.85 },
  stamp: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 46,
    height: 54,
    borderRadius: 4,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(108, 102, 144, 0.55)',
    backgroundColor: Colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    transform: [{ rotate: '6deg' }],
  },
  stampMoon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    experimental_backgroundImage: `radial-gradient(circle at 35% 35%, ${Colors.amberPale}, ${Colors.amber} 70%)`,
  },
  stampText: { fontFamily: Fonts.bodySemiBold, fontSize: 8.5, lineHeight: 10, color: Colors.paperInk },
  footer: { paddingHorizontal: 6, paddingTop: 10, gap: 3 },
  title: { fontFamily: Fonts.displayBold, fontSize: 19, lineHeight: 23, color: Colors.night },
  caption: { fontFamily: Fonts.body, fontSize: 13.5, lineHeight: 18, color: Colors.paperInk },
});
