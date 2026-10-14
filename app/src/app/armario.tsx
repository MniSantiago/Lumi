import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CollectionIcon } from '@/components/collection-icon';
import { LumiAvatar } from '@/components/lumi-avatar';
import { SegmentTabs } from '@/components/segment-tabs';
import { Sheet } from '@/components/sheet';
import { SparkGlyph } from '@/components/spark-glyph';
import { SparksPill } from '@/components/sparks-pill';
import { Colors, Fonts } from '@/constants/theme';
import { FRIEND_CATALOG, ITEM_CATALOG } from '@/game/catalog';
import { useGame } from '@/game/store';
import type { Slot } from '@/game/types';
import { ITEM_SLOTS, missingSparks, previewOutfit, specialById, SPECIAL_ACCESSORIES } from '@/game/wardrobe';
import { haptic } from '@/haptics';
import { tr } from '@/i18n';
import { LUMI_STATES } from '@/lumi/states';
import { useLumi } from '@/lumi/store';
import { nightlyCopy } from '@/nightly/copy';

type Tab = Slot | 'amigo';
const TABS: { key: Tab; label: string }[] = [
  { key: 'cabeza', label: tr({ es: 'Cabeza', en: 'Head', zh: '头部', hi: 'सिर', fr: 'Tête' }) },
  { key: 'cuello', label: tr({ es: 'Cuello', en: 'Neck', zh: '颈部', hi: 'गला', fr: 'Cou' }) },
  { key: 'mano', label: tr({ es: 'Mano', en: 'Hand', zh: '手', hi: 'हाथ', fr: 'Main' }) },
  { key: 'amigo', label: tr({ es: 'Amigo', en: 'Friend', zh: '朋友', hi: 'दोस्त', fr: 'Ami' }) },
];

const copy = {
  empty: tr({
    es: 'Aún no tienes nada para este sitio.',
    en: 'Nothing for this spot yet.',
    zh: '这里还没有东西。',
    hi: 'इस जगह के लिए अभी कुछ नहीं है।',
    fr: 'Rien pour cet endroit pour l’instant.',
  }),
  emptyHow: (name: string) =>
    tr({
      es: `Las expediciones traen objetos para este hueco: cuando ${name} vuelva con uno, aparecerá aquí.`,
      en: `Expeditions bring back things for this spot: when ${name} returns with one, it’ll show up here.`,
      zh: `探险会带回适合这里的东西：${name}带回来后就会出现在这里。`,
      hi: `सफ़र इस जगह के लिए चीज़ें लाते हैं: जब ${name} कोई लेकर लौटेगी, वो यहाँ दिखेगी।`,
      fr: `Les expéditions rapportent des objets pour cet endroit : quand ${name} en ramènera un, il apparaîtra ici.`,
    }),
  emptyFriends: tr({
    es: 'Aún no tienes amigos.',
    en: 'No friends yet.',
    zh: '还没有朋友。',
    hi: 'अभी कोई दोस्त नहीं है।',
    fr: 'Pas encore d’amis.',
  }),
  emptyFriendsHow: (name: string) =>
    tr({
      es: `En sus expediciones ${name} a veces hace un amigo: cuando pase, podrá acompañarla.`,
      en: `Sometimes ${name} makes a friend on her expeditions: when that happens, they can tag along.`,
      zh: `${name}在探险中有时会交到朋友：到时候，朋友就能陪着她。`,
      hi: `कभी-कभी सफ़र में ${name} का कोई दोस्त बन जाता है: तब वो उसके साथ चल सकेगा।`,
      fr: `Parfois, ${name} se fait un ami pendant ses expéditions : il pourra alors l’accompagner.`,
    }),
  remove: tr({ es: 'Quitar', en: 'Remove', zh: '取下', hi: 'हटाओ', fr: 'Retirer' }),
  get: tr({ es: 'Conseguir', en: 'Get', zh: '获得', hi: 'पाओ', fr: 'Obtenir' }),
  missing: (n: number) =>
    tr({
      es: n === 1 ? 'Te falta 1 chispa' : `Te faltan ${n} chispas`,
      en: n === 1 ? '1 more spark needed' : `${n} more sparks needed`,
      zh: `还差 ${n} 个火花`,
      hi: `${n} चिंगारियाँ और चाहिए`,
      fr: n === 1 ? 'Il te manque 1 étincelle' : `Il te manque ${n} étincelles`,
    }),
  shop: tr({ es: 'Con chispas', en: 'With sparks', zh: '用火花换', hi: 'चिंगारियों से', fr: 'Avec des étincelles' }),
  shopHint: (name: string) =>
    tr({
      es: `Toca uno para que ${name} se lo pruebe.`,
      en: `Tap one and ${name} will try it on.`,
      zh: `点一下，${name}就会试戴。`,
      hi: `किसी पर टैप करो, ${name} उसे पहनकर देखेगी।`,
      fr: `Touche-en un pour que ${name} l’essaie.`,
    }),
  worn: tr({ es: 'puesto', en: 'wearing', zh: '已穿戴', hi: 'पहना हुआ', fr: 'porté' }),
  /** Lo que trae puesto la suscripción: no se compra con chispas. */
  plusBadge: 'Plus',
  plusIncluded: tr({
    es: 'Viene con Lampi Plus',
    en: 'Comes with Lampi Plus',
    zh: 'Lampi Plus 自带',
    hi: 'Lampi Plus के साथ आता है',
    fr: 'Inclus avec Lampi Plus',
  }),
  plusSee: tr({ es: 'Ver Plus', en: 'See Plus', zh: '看看 Plus', hi: 'Plus देखो', fr: 'Voir Plus' }),
};

/** Marca ✓ de lo puesto o elegido: el estado no depende solo del color del borde. */
function CheckBadge() {
  return (
    <View
      style={styles.badge}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <SymbolView name="checkmark.circle.fill" size={18} tintColor={Colors.amberPale} />
    </View>
  );
}

type Option = { id: string; name: string; icon: string };

/** Hoja del armario: Lampi en vivo, huecos (cabeza, cuello, mano, amigo) y accesorios que se compran con chispas. */
export default function WardrobeSheet() {
  const { settings } = useLumi();
  const game = useGame();
  const [tab, setTab] = useState<Tab>('cabeza');
  /** Accesorio elegido en la tienda: se compra solo con el botón «Conseguir». */
  const [choice, setChoice] = useState<string | null>(null);
  const name = settings.lumiName;

  const owned: Option[] =
    tab === 'amigo'
      ? FRIEND_CATALOG.filter((f) => game.friends.includes(f.id))
      : [
          ...ITEM_CATALOG.filter((i) => ITEM_SLOTS[i.id] === tab && game.items.includes(i.id)),
          ...SPECIAL_ACCESSORIES.filter((a) => a.slot === tab && game.unlocked.includes(a.id)),
        ];
  const shop =
    tab === 'amigo' ? [] : SPECIAL_ACCESSORIES.filter((a) => a.slot === tab && !game.unlocked.includes(a.id));
  const current = tab === 'amigo' ? game.outfit.companion : game.outfit[tab];
  const currentName = current ? owned.find((e) => e.id === current)?.name : undefined;
  /** Accesorio de la tienda en vista previa (solo si sigue a la venta en esta pestaña). */
  const trying = choice && shop.some((a) => a.id === choice) ? choice : null;
  /** Lampi se lo prueba puesto; solo se queda si se compra. */
  const shown = trying ? previewOutfit(game.outfit, trying) : game.outfit;

  const tryingEntry = trying ? specialById(trying) : undefined;
  const missing = trying ? missingSparks(game.snapshot, trying) : 0;
  const confirmBuy = () => {
    if (!trying) return;
    if (game.buy(trying)) {
      game.equip(trying);
      setChoice(null);
      haptic.success();
    }
  };
  // Barra de confirmación: va en el pie fijo de la hoja para que nunca quede fuera de pantalla.
  const confirmBar = tryingEntry ? (
    <View style={styles.confirm}>
      <Text style={styles.confirmName} numberOfLines={2}>
        {tryingEntry.name}
      </Text>
      {tryingEntry.plus ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${copy.plusIncluded}. ${copy.plusSee}`}
          onPress={() => router.push('/plus')}
          style={({ pressed }) => [styles.confirmButton, pressed && { opacity: 0.8 }]}>
          <Text style={styles.confirmButtonText}>{copy.plusSee}</Text>
        </Pressable>
      ) : missing > 0 ? (
        <Text style={styles.confirmMissing}>{copy.missing(missing)}</Text>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${copy.get}, ${tryingEntry.price} ${nightlyCopy.sparksUnit}`}
          onPress={confirmBuy}
          style={({ pressed }) => [styles.confirmButton, pressed && { opacity: 0.8 }]}>
          <Text style={styles.confirmButtonText}>{copy.get}</Text>
          <SparkGlyph size={12} color={Colors.night} />
          <Text style={styles.confirmButtonText}>{tryingEntry.price}</Text>
        </Pressable>
      )}
    </View>
  ) : null;

  const pick = (id: string) => {
    setChoice(null);
    if (tab === 'amigo') game.setCompanion(id);
    else game.equip(id);
    haptic.selection();
  };
  const remove = () => {
    setChoice(null);
    if (tab === 'amigo') game.setCompanion(null);
    else game.unequip(tab);
    haptic.selection();
  };

  return (
    <Sheet
      title={tr({ es: 'Armario', en: 'Wardrobe', zh: '衣橱', hi: 'अलमारी', fr: 'Garde-robe' })}
      subtitle={tr({
        es: `Lo que ${name} se pone para sus viajes.`,
        en: `What ${name} wears on her trips.`,
        zh: `${name}旅行时穿戴的东西。`,
        hi: `${name} अपने सफ़र पर जो पहनती है।`,
        fr: `Ce que ${name} porte pendant ses voyages.`,
      })}
      footer={confirmBar ?? undefined}>
      <View style={styles.hero}>
        <LumiAvatar state={LUMI_STATES.contenta} size={170} outfit={shown} alive={false} />
        <View style={styles.balance} accessible accessibilityLabel={`${game.balance} ${nightlyCopy.sparksUnit}`}>
          <SparksPill value={game.balance} />
        </View>
      </View>

      <SegmentTabs
        items={TABS}
        value={tab}
        onChange={(key) => {
          setTab(key);
          setChoice(null);
          haptic.selection();
        }}
      />

      {owned.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.empty}>{tab === 'amigo' ? copy.emptyFriends : copy.empty}</Text>
          <Text style={styles.emptyHow}>{tab === 'amigo' ? copy.emptyFriendsHow(name) : copy.emptyHow(name)}</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {owned.map((e) => (
            <Pressable
              key={e.id}
              accessibilityRole="button"
              accessibilityLabel={current === e.id ? `${e.name}, ${copy.worn}` : e.name}
              accessibilityState={{ selected: current === e.id }}
              onPress={() => pick(e.id)}
              style={[styles.cell, current === e.id && styles.cellOn]}>
              {current === e.id ? <CheckBadge /> : null}
              <CollectionIcon name={e.icon} size={52} />
              <Text style={styles.cellName} numberOfLines={2}>
                {e.name}
              </Text>
            </Pressable>
          ))}
          {current ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={currentName ? `${copy.remove}: ${currentName}` : copy.remove}
              onPress={remove}
              style={({ pressed }) => [styles.cell, styles.cellAction, pressed && { opacity: 0.7 }]}>
              <View style={styles.removeIcon}>
                <SymbolView name="xmark" size={14} weight="bold" tintColor={Colors.lavenderPale} />
              </View>
              <Text style={styles.removeText} numberOfLines={2}>
                {copy.remove}
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}

      {shop.length > 0 ? (
        <View style={styles.shop}>
          <View style={styles.shopHeader}>
            <SymbolView name="tag.fill" size={13} tintColor={Colors.amberPale} />
            <Text style={styles.shopTitle} accessibilityRole="header">
              {copy.shop}
            </Text>
          </View>
          <Text style={styles.shopHint}>{copy.shopHint(name)}</Text>
          <View style={styles.grid}>
            {shop.map((a) => {
              const can = game.balance >= a.price;
              const on = trying === a.id;
              return (
                <Pressable
                  key={a.id}
                  accessibilityRole="button"
                  accessibilityLabel={
                    a.plus ? `${a.name}, ${copy.plusIncluded}` : `${a.name}, ${a.price} ${nightlyCopy.sparksUnit}`
                  }
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    // Tocar otra vez el mismo accesorio deshace la prueba.
                    setChoice(on ? null : a.id);
                    haptic.selection();
                  }}
                  style={[styles.cell, styles.cellShop, on && styles.cellOn]}>
                  {on ? <CheckBadge /> : null}
                  <View style={!can && !on ? styles.dim : null}>
                    <CollectionIcon name={a.icon} size={52} />
                  </View>
                  <Text style={styles.cellName} numberOfLines={2}>
                    {a.name}
                  </Text>
                  {a.plus ? (
                    <View style={[styles.price, styles.pricePlus]}>
                      <Text style={styles.pricePlusText}>{copy.plusBadge}</Text>
                    </View>
                  ) : (
                    <View style={[styles.price, !can && styles.priceShort]}>
                      {can ? null : <SymbolView name="lock.fill" size={10} tintColor={Colors.textTertiary} />}
                      <SparkGlyph size={11} color={can ? Colors.amberPale : Colors.textTertiary} />
                      <Text style={[styles.priceText, !can && { color: Colors.textSecondary }]}>{a.price}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: 14 },
  // Saldo arriba a la derecha de Lampi, junto al título: se ve antes de mirar la tienda.
  balance: { position: 'absolute', top: 0, right: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    width: '30.5%',
    minHeight: 104,
    padding: 8,
    borderRadius: 16,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(201, 191, 242, 0.08)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cellOn: { borderColor: Colors.amberPale, backgroundColor: 'rgba(255, 214, 140, 0.12)' },
  // «Quitar» es una acción, no un objeto: sin relleno, borde fino e icono ✕ en círculo.
  cellAction: { backgroundColor: 'transparent', borderColor: Colors.hairline, gap: 8 },
  removeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201, 191, 242, 0.14)',
  },
  removeText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.lavenderPale, textAlign: 'center' },
  cellName: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 15, color: Colors.textSecondary, textAlign: 'center' },
  confirm: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 46 },
  confirmName: { flex: 1, fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.lavenderPale },
  confirmMissing: {
    flexShrink: 1,
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: Colors.amberPale,
  },
  confirmButtonText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.night, fontVariant: ['tabular-nums'] },
  cellShop: {
    backgroundColor: 'rgba(255, 201, 107, 0.05)',
    borderColor: 'rgba(255, 201, 107, 0.18)',
    borderStyle: 'dashed',
  },
  badge: { position: 'absolute', top: 6, right: 6 },
  dim: { opacity: 0.45 },
  price: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 201, 107, 0.16)',
  },
  priceShort: { backgroundColor: 'rgba(201, 191, 242, 0.10)' },
  pricePlus: { backgroundColor: 'rgba(255, 201, 107, 0.18)' },
  pricePlusText: { fontFamily: Fonts.bodyBold, fontSize: 12, letterSpacing: 0.4, color: Colors.amberPale },
  priceText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.amberPale, fontVariant: ['tabular-nums'] },
  shop: { gap: 8, marginTop: 4 },
  shopHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  shopTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.amberPale,
  },
  shopHint: { fontFamily: Fonts.body, fontSize: 13, color: Colors.textTertiary, marginBottom: 4 },
  emptyBox: { gap: 4 },
  empty: { fontFamily: Fonts.bodySemiBold, fontSize: 14, lineHeight: 20, color: Colors.textSecondary },
  emptyHow: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20, color: Colors.textTertiary },
});
