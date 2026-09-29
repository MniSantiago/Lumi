import { StyleSheet, Text, View } from 'react-native';

import { LumiAvatar } from '@/components/lumi-avatar';
import { Label, List, Row } from '@/components/onboarding/controls';
import { Sheet } from '@/components/sheet';
import { Colors, Fonts } from '@/constants/theme';
import { useGame } from '@/game/store';
import { LUMI_STATES } from '@/lumi/states';
import { useLumi } from '@/lumi/store';

/**
 * Qué son las chispas y cómo se consiguen (se abre al tocar ✦ en el Hogar).
 * Las cifras son las de `game/rewards.ts`.
 */
export default function SparksSheet() {
  const { settings } = useLumi();
  const { sparks } = useGame();
  const name = settings.lumiName;

  return (
    <Sheet title={`✦ ${sparks} ${sparks === 1 ? 'chispa' : 'chispas'}`} subtitle={`Las trae ${name} de sus expediciones, junto con la postal.`}>
      <View style={styles.hero}>
        <LumiAvatar state={LUMI_STATES.radiante} size={110} />
      </View>

      <View style={{ gap: 10 }}>
        <Text style={styles.label}>Cuántas trae</Text>
        <List>
          <Row>
            <Label title="Radiante todo el día" sub="Menos del 25 % de tu límite" />
            <Text style={styles.amount}>16–24 ✦</Text>
          </Row>
          <Row>
            <Label title="Contenta" sub="Entre el 25 y el 50 %" />
            <Text style={styles.amount}>10–17 ✦</Text>
          </Row>
          <Row last>
            <Label title="Cansada o dormida" sub="Se queda en casa, sin expedición" />
            <Text style={[styles.amount, styles.muted]}>0 ✦</Text>
          </Row>
        </List>
      </View>

      <Text style={styles.note}>
        Nunca pierde las que tiene, ni se compran con dinero. Pronto servirán para decorar su madriguera.
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
