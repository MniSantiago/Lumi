import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LumiAvatar } from '@/components/lumi-avatar';
import { Label, List, Row } from '@/components/onboarding/controls';
import { NIGHT_BONUS } from '@/game/engine';
import { Sheet } from '@/components/sheet';
import { SparkGlyph } from '@/components/spark-glyph';
import { Colors, Fonts } from '@/constants/theme';
import { useGame } from '@/game/store';
import { LUMI_STATES } from '@/lumi/states';
import { nightlyCopy } from '@/nightly/copy';
import { useLumi } from '@/lumi/store';
import { tr } from '@/i18n';

/**
 * Qué son las chispas y cómo se consiguen (se abre al tocar la chispa en el Hogar).
 * Las cifras son las de `game/rewards.ts`.
 */
export default function SparksSheet() {
  const { settings } = useLumi();
  const { balance: sparks } = useGame();
  const name = settings.lumiName;

  return (
    <Sheet
      title={
        sparks === 1
          ? tr({ es: '1 chispa', en: '1 spark', zh: '1 个火花', hi: '1 चिंगारी', fr: '1 étincelle' })
          : `${sparks} ${nightlyCopy.sparksUnit}`
      }
      subtitle={tr({
        es: `Las trae ${name} de sus expediciones, junto con la postal.`,
        en: `${name} brings them back from her expeditions, along with the postcard.`,
        zh: `${name}探险回来时，会和明信片一起带回来。`,
        hi: `${name} इन्हें अपने सफ़र से पोस्टकार्ड के साथ लाती है।`,
        fr: `${name} les rapporte de ses expéditions, avec la carte.`,
      })}>
      <View style={styles.hero}>
        <LumiAvatar state={LUMI_STATES.radiante} size={110} />
      </View>

      <View style={{ gap: 10 }}>
        <Text style={styles.label}>
          {tr({
            es: 'Cuántas trae',
            en: 'How many she brings',
            zh: '她带回多少',
            hi: 'वो कितनी लाती है',
            fr: 'Combien elle en rapporte',
          })}
        </Text>
        <List>
          <Row>
            <Label
              title={tr({
                es: 'Radiante todo el día',
                en: 'Radiant all day',
                zh: '一整天都闪闪发光',
                hi: 'पूरे दिन जगमग',
                fr: 'Radieuse toute la journée',
              })}
              sub={tr({
                es: 'Menos del 25 % de tu límite',
                en: 'Under 25% of your limit',
                zh: '不到上限的 25%',
                hi: 'तुम्हारी सीमा के 25% से कम',
                fr: 'Moins de 25 % de ta limite',
              })}
            />
            <Amount>16–24</Amount>
          </Row>
          <Row>
            <Label
              title={tr({
                es: 'Contenta',
                en: 'Happy',
                zh: '开心',
                hi: 'ख़ुश',
                fr: 'Contente',
              })}
              sub={tr({
                es: 'Entre el 25 y el 50 %',
                en: 'Between 25 and 50%',
                zh: '25% 到 50% 之间',
                hi: '25 और 50% के बीच',
                fr: 'Entre 25 et 50 %',
              })}
            />
            <Amount>10–17</Amount>
          </Row>
          <Row last>
            <Label
              title={tr({
                es: 'Cansada o dormida',
                en: 'Tired or asleep',
                zh: '累了或睡着了',
                hi: 'थकी हुई या सोई हुई',
                fr: 'Fatiguée ou endormie',
              })}
              sub={tr({
                es: 'Se queda en casa, sin expedición',
                en: 'Stays home, no expedition',
                zh: '待在家，不去探险',
                hi: 'घर पर रहती है, कोई सफ़र नहीं',
                fr: 'Reste à la maison, pas d’expédition',
              })}
            />
            <Amount muted>0</Amount>
          </Row>
        </List>
        <List>
          <Row last>
            <Label
              title={tr({
                es: 'Noche tranquila',
                en: 'A calm night',
                zh: '安稳的一夜',
                hi: 'शांत रात',
                fr: 'Une nuit tranquille',
              })}
              sub={tr({
                es: 'Sin «5 min más» en el horario de noche: su próxima expedición trae más',
                en: 'No “5 more min” during the night: her next expedition brings extra',
                zh: '夜间没有点“再 5 分钟”：下一次探险会多带一些',
                hi: 'रात में "5 मिनट और" नहीं: अगले सफ़र में ज़्यादा लाती है',
                fr: 'Pas de « 5 min de plus » la nuit : sa prochaine expédition en rapporte plus',
              })}
            />
            <Amount>+{NIGHT_BONUS}</Amount>
          </Row>
        </List>
      </View>

      <Text style={styles.note}>
        {tr({
          es: 'No caducan ni se compran con dinero: son la luz que ha ido juntando contigo. Solo se gastan si tú quieres, en el Armario.',
          en: 'They never expire and can’t be bought with money: they’re the light she’s gathered with you. They’re only spent if you want, in the Wardrobe.',
          zh: '火花不会过期，也不能用钱买：这是她和你一起攒下的光。只有你愿意时，才会在衣橱里花掉。',
          hi: 'ये कभी ख़त्म नहीं होतीं और पैसों से नहीं ख़रीदी जातीं: ये वो रोशनी है जो उसने तुम्हारे साथ जुटाई है। तुम चाहो तभी अलमारी में खर्च होती हैं।',
          fr: 'Elles n’expirent jamais et ne s’achètent pas avec de l’argent : c’est la lumière qu’elle a réunie avec toi. Elles ne se dépensent que si tu le veux, dans la garde-robe.',
        })}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/armario')}
        style={({ pressed }) => [styles.wardrobeLink, pressed && { opacity: 0.75 }]}>
        <Text style={styles.wardrobeLinkText}>
          {tr({
            es: 'Abrir el Armario',
            en: 'Open the Wardrobe',
            zh: '打开衣橱',
            hi: 'अलमारी खोलो',
            fr: 'Ouvrir la garde-robe',
          })}
        </Text>
      </Pressable>
    </Sheet>
  );
}

/** Cantidad de chispas con la chispa vectorial detrás (no un carácter de fuente). */
function Amount({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return (
    <View style={styles.amountRow}>
      <Text style={[styles.amount, muted && styles.muted]}>{children}</Text>
      <SparkGlyph size={13} color={muted ? Colors.textTertiary : Colors.amberPale} />
    </View>
  );
}

const styles = StyleSheet.create({
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hero: { alignItems: 'center' },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  amount: { fontFamily: Fonts.bodySemiBold, fontSize: 15, color: Colors.amberPale, fontVariant: ['tabular-nums'] },
  muted: { color: Colors.textTertiary },
  wardrobeLink: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(201, 191, 242, 0.14)',
  },
  wardrobeLinkText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.lavenderPale },
  note: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20, color: Colors.textSecondary, paddingHorizontal: 6 },
});
