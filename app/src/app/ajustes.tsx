import type { ReactNode } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AppText, Button, Card, SectionTitle, Screen, TextLink } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { THIEF_APPS } from '@/lumi/data';
import { formatLimit, LIMIT_OPTIONS, useLumi } from '@/lumi/store';

export default function SettingsScreen() {
  const { settings, updateSettings } = useLumi();
  const limitIndex = Math.max(0, LIMIT_OPTIONS.indexOf(settings.limitMinutes as (typeof LIMIT_OPTIONS)[number]));
  const stepLimit = (dir: -1 | 1) => {
    const next = Math.min(LIMIT_OPTIONS.length - 1, Math.max(0, limitIndex + dir));
    updateSettings({ limitMinutes: LIMIT_OPTIONS[next] });
  };

  return (
    <Screen title="Ajustes" subtitle="Lo que apaga la luz de Lumi y cuándo se va a dormir.">
      <View style={{ gap: Spacing.three }}>
        <SectionTitle
          action={
            <TextLink
              label="Editar"
              onPress={() =>
                Alert.alert('Apps ladronas', 'Aquí se abrirá el selector de apps de Apple (FamilyActivityPicker).')
              }
            />
          }>
          Apps ladronas
        </SectionTitle>
        <Card style={{ paddingVertical: 4 }}>
          {THIEF_APPS.map((app, i) => (
            <Row key={app.id} last={i === THIEF_APPS.length - 1}>
              <View style={[styles.appIcon, { backgroundColor: `${app.color}33` }]}>
                <Text style={[styles.appLetter, { color: app.color }]}>{app.letter}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">{app.name}</AppText>
                {app.note ? <AppText variant="caption">{app.note}</AppText> : null}
              </View>
            </Row>
          ))}
        </Card>
      </View>

      <View style={{ gap: Spacing.three }}>
        <SectionTitle>Límite y noche</SectionTitle>
        <Card style={{ paddingVertical: 4 }}>
          <Row>
            <RowText title="Límite diario suave" sub="Lumi se cansa al acercarte" />
            <View style={styles.stepper}>
              <StepButton label="−" disabled={limitIndex === 0} onPress={() => stepLimit(-1)} a11y="Bajar límite" />
              <Text style={styles.stepValue}>{formatLimit(settings.limitMinutes)}</Text>
              <StepButton
                label="+"
                disabled={limitIndex === LIMIT_OPTIONS.length - 1}
                onPress={() => stepLimit(1)}
                a11y="Subir límite"
              />
            </View>
          </Row>
          <Row>
            <RowText title="Horario de noche" sub="Lumi duerme y las apps ladronas se tapan" />
            <Text style={styles.value}>
              {settings.nightStart} a {settings.nightEnd}
            </Text>
          </Row>
          <Row>
            <RowText title="Postal nocturna" sub="Aviso cuando Lumi vuelve" />
            <Toggle value={settings.nightlyPostcard} onChange={(v) => updateSettings({ nightlyPostcard: v })} />
          </Row>
          <Row last>
            <RowText title="Días de descanso" sub="2 por semana, la racha no se rompe" />
            <Toggle value={settings.restDays} onChange={(v) => updateSettings({ restDays: v })} />
          </Row>
        </Card>
      </View>

      <Card style={styles.plus}>
        <AppText variant="title">Lumi Plus</AppText>
        <View style={{ gap: 6 }}>
          {[
            'Más especies y colores de luz',
            'Zonas exclusivas y capítulos de historia',
            'Varios horarios y bloqueo estricto',
            'Decoración premium para la madriguera',
          ].map((f) => (
            <View key={f} style={{ flexDirection: 'row', gap: 8 }}>
              <Text style={{ color: Colors.amber }}>✦</Text>
              <AppText style={{ flex: 1, color: Colors.text }}>{f}</AppText>
            </View>
          ))}
        </View>
        <Button label="Probar 7 días gratis" onPress={() => Alert.alert('Lumi Plus', 'El paywall llega en el paso 3.')} />
        <AppText variant="caption" style={{ textAlign: 'center' }}>
          Luego 49,99 $ al año. Lumi no se pone triste si no lo pruebas.
        </AppText>
      </Card>
    </Screen>
  );
}

function Row({ children, last }: { children: ReactNode; last?: boolean }) {
  return <View style={[styles.row, !last && styles.rowDivider]}>{children}</View>;
}

function RowText({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <AppText variant="bodyStrong">{title}</AppText>
      <AppText variant="caption">{sub}</AppText>
    </View>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ true: Colors.violet, false: 'rgba(201, 191, 242, 0.2)' }}
      thumbColor={Colors.lavenderPale}
      ios_backgroundColor="rgba(201, 191, 242, 0.2)"
    />
  );
}

function StepButton({
  label,
  onPress,
  disabled,
  a11y,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  a11y: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.stepBtn, disabled && { opacity: 0.35 }, pressed && { opacity: 0.7 }]}>
      <Text style={styles.stepBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, minHeight: 56 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.hairline },
  appIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  appLetter: { fontFamily: Fonts.bodyBold, fontSize: 16 },
  value: { fontFamily: Fonts.bodySemiBold, fontSize: 15, color: Colors.lavender, fontVariant: ['tabular-nums'] },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(201, 191, 242, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontFamily: Fonts.bodySemiBold, fontSize: 18, color: Colors.lavenderPale, marginTop: -1 },
  stepValue: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.text,
    minWidth: 52,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  plus: {
    gap: Spacing.three,
    borderColor: `${Colors.amber}55`,
    experimental_backgroundImage: `linear-gradient(160deg, ${Colors.indigo}, ${Colors.night})`,
    borderRadius: Radius.lg,
  },
});
