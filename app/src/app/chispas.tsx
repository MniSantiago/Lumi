import { StyleSheet, Text, View } from 'react-native';

import { LumiAvatar } from '@/components/lumi-avatar';
import { Label, List, Row } from '@/components/onboarding/controls';
import { Sheet } from '@/components/sheet';
import { Colors, Fonts } from '@/constants/theme';
import { useGame } from '@/game/store';
import { LUMI_STATES } from '@/lumi/states';
import { nightlyCopy } from '@/nightly/copy';
import { useLumi } from '@/lumi/store';
import { tr } from '@/i18n';

/**
 * Qué son las chispas y cómo se consiguen (se abre al tocar ✦ en el Hogar).
 * Las cifras son las de `game/rewards.ts`.
 */
export default function SparksSheet() {
  const { settings } = useLumi();
  const { sparks } = useGame();
  const name = settings.lumiName;

  return (
    <Sheet
      title={
        sparks === 1
          ? tr({ es: '✦ 1 chispa', en: '✦ 1 spark', zh: '✦ 1 个火花', hi: '✦ 1 चिंगारी', fr: '✦ 1 étincelle' })
          : `✦ ${sparks} ${nightlyCopy.sparksUnit}`
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
            <Text style={styles.amount}>16–24 ✦</Text>
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
            <Text style={styles.amount}>10–17 ✦</Text>
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
            <Text style={[styles.amount, styles.muted]}>0 ✦</Text>
          </Row>
        </List>
      </View>

      <Text style={styles.note}>
        {tr({
          es: 'Nunca pierde las que tiene, ni se compran con dinero. Pronto servirán para decorar su madriguera.',
          en: 'She never loses the ones she has, and they can’t be bought. Soon they’ll be used to decorate her burrow.',
          zh: '她不会失去已有的火花，也不能用钱买。很快就能用来装饰她的小窝。',
          hi: 'जो उसके पास हैं वो कभी नहीं खोतीं, और पैसों से नहीं ख़रीदी जातीं। जल्द ही इनसे उसका घर सजेगा।',
          fr: 'Elle ne perd jamais celles qu’elle a, et elles ne s’achètent pas. Bientôt, elles serviront à décorer son terrier.',
        })}
      </Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
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
  note: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 20, color: Colors.textSecondary, paddingHorizontal: 6 },
});
