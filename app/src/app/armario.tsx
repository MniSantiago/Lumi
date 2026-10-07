import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CollectionIcon } from '@/components/collection-icon';
import { LumiAvatar } from '@/components/lumi-avatar';
import { Sheet } from '@/components/sheet';
import { SparkGlyph } from '@/components/spark-glyph';
import { Colors, Fonts } from '@/constants/theme';
import { FRIEND_CATALOG, ITEM_CATALOG } from '@/game/catalog';
import { useGame } from '@/game/store';
import type { Slot } from '@/game/types';
import { ITEM_SLOTS, missingSparks, specialById, SPECIAL_ACCESSORIES } from '@/game/wardrobe';
import { haptic } from '@/haptics';
import { tr } from '@/i18n';
import { LUMI_STATES } from '@/lumi/states';
import { useLumi } from '@/lumi/store';
import { nightlyCopy } from '@/nightly/copy';
import { sfx } from '@/sound';

type Tab = Slot | 'amigo';
const TABS: { key: Tab; label: string }[] = [
  { key: 'cabeza', label: tr({ es: 'Cabeza', en: 'Head', zh: '头部', hi: 'सिर', fr: 'Tête' }) },
  { key: 'cuello', label: tr({ es: 'Cuello', en: 'Neck', zh: '颈部', hi: 'गला', fr: 'Cou' }) },
  { key: 'mano', label: tr({ es: 'Mano', en: 'Hand', zh: '手', hi: 'हाथ', fr: 'Main' }) },
  { key: 'amigo', label: tr({ es: 'Amigo', en: 'Friend', zh: '朋友', hi: 'दोस्त', fr: 'Ami' }) },
];

const copy = {
  empty: tr({
    es: 'Aún no tienes nada para este sitio. Lo que traiga de sus viajes aparecerá aquí.',
    en: 'Nothing for this spot yet. Whatever she brings back from her trips will show up here.',
    zh: '这里还没有东西。她旅行带回来的东西会出现在这里。',
    hi: 'इस जगह के लिए अभी कुछ नहीं है। सफ़र से जो वो लाएगी, यहाँ दिखेगा।',
    fr: 'Rien pour cet endroit pour l’instant. Ce qu’elle rapportera de ses voyages apparaîtra ici.',
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
};

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
  const shop = tab === 'amigo' ? [] : SPECIAL_ACCESSORIES.filter((a) => a.slot === tab && !game.unlocked.includes(a.id));
  const current = tab === 'amigo' ? game.outfit.companion : game.outfit[tab];

  const pick = (id: string) => {
    if (tab === 'amigo') game.setCompanion(id);
    else game.equip(id);
    haptic.selection();
    sfx.select();
  };
  const remove = () => {
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
      })}>
      <View style={styles.hero}>
        <LumiAvatar state={LUMI_STATES.contenta} size={170} outfit={game.outfit} alive={false} />
        <View style={styles.balance} accessible accessibilityLabel={`${game.balance}`}>
          <SparkGlyph size={14} color={Colors.amberPale} />
          <Text style={styles.balanceText}>{game.balance}</Text>
        </View>
      </View>

      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t.key }}
            onPress={() => {
              setTab(t.key);
              setChoice(null);
              haptic.selection();
            }}
            style={[styles.tab, tab === t.key && styles.tabOn]}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextOn]} numberOfLines={1}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {owned.length === 0 && shop.length === 0 ? <Text style={styles.empty}>{copy.empty}</Text> : null}
      <View style={styles.grid}>
        {current ? (
          <Pressable accessibilityRole="button" onPress={remove} style={styles.cell}>
            <Text style={styles.removeText} numberOfLines={2}>
              {copy.remove}
            </Text>
          </Pressable>
        ) : null}
        {owned.map((e) => (
          <Pressable
            key={e.id}
            accessibilityRole="button"
            accessibilityLabel={e.name}
            accessibilityState={{ selected: current === e.id }}
            onPress={() => pick(e.id)}
            style={[styles.cell, current === e.id && styles.cellOn]}>
            <CollectionIcon name={e.icon} size={52} />
            <Text style={styles.cellName} numberOfLines={2}>
              {e.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {shop.length > 0 ? (
        <View style={{ gap: 10, marginTop: 18 }}>
          <Text style={styles.label}>{copy.shop}</Text>
          <View style={styles.grid}>
            {shop.map((a) => {
              const can = game.balance >= a.price;
              return (
                <Pressable
                  key={a.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${a.name}, ${a.price} ${nightlyCopy.sparksUnit}`}
                  accessibilityState={{ selected: choice === a.id }}
                  onPress={() => {
                    setChoice(a.id);
                    haptic.selection();
                  }}
                  style={[styles.cell, choice === a.id && styles.cellOn, !can && choice !== a.id && { opacity: 0.55 }]}>
                  <CollectionIcon name={a.icon} size={52} />
                  <Text style={styles.cellName} numberOfLines={2}>
                    {a.name}
                  </Text>
                  <View style={styles.price}>
                    <SparkGlyph size={11} color={Colors.amberPale} />
                    <Text style={styles.priceText}>{a.price}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          {choice && specialById(choice) && shop.some((a) => a.id === choice) ? (
            <View style={styles.confirm}>
              <Text style={styles.confirmName} numberOfLines={2}>
                {specialById(choice)!.name}
              </Text>
              {missingSparks(game.snapshot, choice) > 0 ? (
                <Text style={styles.confirmMissing}>{copy.missing(missingSparks(game.snapshot, choice))}</Text>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    if (game.buy(choice)) {
                      game.equip(choice);
                      setChoice(null);
                      haptic.success();
                      sfx.reward();
                    }
                  }}
                  style={({ pressed }) => [styles.confirmButton, pressed && { opacity: 0.8 }]}>
                  <Text style={styles.confirmButtonText}>{copy.get}</Text>
                  <SparkGlyph size={12} color={Colors.night} />
                  <Text style={styles.confirmButtonText}>{specialById(choice)!.price}</Text>
                </Pressable>
              )}
            </View>
          ) : null}
        </View>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: 14 },
  balance: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  balanceText: { fontFamily: Fonts.bodyBold, color: Colors.amberPale, fontSize: 15, fontVariant: ['tabular-nums'] },
  tabs: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 191, 242, 0.08)',
  },
  tabOn: { backgroundColor: 'rgba(201, 191, 242, 0.22)' },
  tabText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textSecondary },
  tabTextOn: { color: Colors.lavenderPale },
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
  removeText: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
  cellName: { fontFamily: Fonts.body, fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  confirm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(201, 191, 242, 0.12)',
  },
  confirmName: { flex: 1, fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.lavenderPale },
  confirmMissing: { flexShrink: 1, fontFamily: Fonts.body, fontSize: 13, color: Colors.textSecondary, textAlign: 'right' },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: Colors.amberPale,
  },
  confirmButtonText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.night, fontVariant: ['tabular-nums'] },
  price: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  priceText: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.amberPale, fontVariant: ['tabular-nums'] },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: Colors.textTertiary,
  },
  empty: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginBottom: 14 },
});
