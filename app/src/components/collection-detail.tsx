import { SymbolView } from 'expo-symbols';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, ReduceMotion, ZoomIn } from 'react-native-reanimated';

import { CollectionIcon } from '@/components/collection-icon';
import { Colors, Fonts } from '@/constants/theme';
import type { CatalogEntry } from '@/game/types';
import { tr } from '@/i18n';

export type CollectionDetailData = {
  entry: CatalogEntry;
  kind: 'item' | 'friend';
  /** Texto de dónde y cuándo llegó (null si no consta en el historial). */
  origin: string | null;
  /** Veces que ha vuelto con él (0 si no consta). */
  times: number;
  /** Posición en el álbum (1..total). */
  number: number;
  total: number;
};

const copy = {
  close: tr({ es: 'Cerrar', en: 'Close', zh: '关闭', hi: 'बंद करें', fr: 'Fermer' }),
  friend: tr({ es: 'Criatura amiga', en: 'Creature friend', zh: '小伙伴', hi: 'जीव दोस्त', fr: 'Créature amie' }),
  item: tr({ es: 'Objeto', en: 'Keepsake', zh: '物品', hi: 'चीज़', fr: 'Objet' }),
  number: (n: number, total: number) =>
    tr({
      es: `N.º ${n} de ${total}`,
      en: `No. ${n} of ${total}`,
      zh: `第 ${n} 个，共 ${total} 个`,
      hi: `${total} में से ${n}वाँ`,
      fr: `N° ${n} sur ${total}`,
    }),
  times: (n: number) =>
    tr({
      es: n === 1 ? 'Ha venido 1 vez' : `Ha venido ${n} veces`,
      en: n === 1 ? 'Brought back once' : `Brought back ${n} times`,
      zh: `带回过 ${n} 次`,
      hi: `${n} बार साथ आया`,
      fr: n === 1 ? 'Rapporté 1 fois' : `Rapporté ${n} fois`,
    }),
};

/** Vista ampliada de un amigo u objeto de la Colección: arte grande, nombre y datos. */
export function CollectionDetail({ data, onClose }: { data: CollectionDetailData | null; onClose: () => void }) {
  return (
    <Modal visible={data !== null} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {data ? <Body data={data} onClose={onClose} /> : null}
    </Modal>
  );
}

function Body({ data, onClose }: { data: CollectionDetailData; onClose: () => void }) {
  const { entry, kind, origin, times, number, total } = data;
  const kindLabel = kind === 'friend' ? copy.friend : copy.item;
  return (
    <View style={styles.root} accessibilityViewIsModal>
      <Animated.View
        entering={FadeIn.duration(220).reduceMotion(ReduceMotion.System)}
        exiting={FadeOut.duration(160).reduceMotion(ReduceMotion.System)}
        style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel={copy.close}
          onPress={onClose}
        />
      </Animated.View>
      <Animated.View
        entering={ZoomIn.duration(340).easing(Easing.out(Easing.cubic)).reduceMotion(ReduceMotion.System)}
        style={styles.card}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.close}
          hitSlop={10}
          onPress={onClose}
          style={({ pressed }) => [styles.close, pressed && { opacity: 0.7 }]}>
          <SymbolView name="xmark" size={13} weight="bold" tintColor={Colors.lavenderPale} />
        </Pressable>
        <View style={styles.stage} accessible accessibilityRole="image" accessibilityLabel={entry.name}>
          <Animated.View entering={FadeIn.delay(120).duration(420).reduceMotion(ReduceMotion.System)}>
            <CollectionIcon name={entry.icon} size={200} />
          </Animated.View>
        </View>
        <Text style={styles.kind}>{kindLabel}</Text>
        <Text style={styles.name} accessibilityRole="header">
          {entry.name}
        </Text>
        <View style={styles.facts}>
          <Text style={styles.fact}>{copy.number(number, total)}</Text>
          {times > 0 ? <Text style={styles.fact}>{copy.times(times)}</Text> : null}
        </View>
        {origin ? <Text style={styles.origin}>{origin}</Text> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  backdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(10, 8, 30, 0.82)' },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    borderCurve: 'continuous',
    backgroundColor: Colors.cardSolid,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 26,
    alignItems: 'center',
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 191, 242, 0.14)',
  },
  stage: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 191, 242, 0.08)',
    marginTop: 8,
  },
  kind: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.amber,
    marginTop: 18,
  },
  name: {
    fontFamily: Fonts.displayBold,
    fontSize: 28,
    lineHeight: 33,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 4,
  },
  facts: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
  fact: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.textSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(201, 191, 242, 0.1)',
  },
  origin: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 14,
  },
});
