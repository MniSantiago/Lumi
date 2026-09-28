import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { PillButton, SectionTitle, Screen, TextLink } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { plusFeatures } from '@/components/paywall/copy';
import { useGame } from '@/game/store';
import { thiefAppById, type ThiefApp } from '@/lumi/data';
import { formatLimit, LIMIT_OPTIONS, useLumi } from '@/lumi/store';
import { cancelNightlyReturn, ensureNotificationPermission, permissionDeniedCopy } from '@/notifications';

export default function SettingsScreen() {
  const { settings, updateSettings } = useLumi();
  const game = useGame();
  const apps = settings.thiefApps.map(thiefAppById).filter((a): a is ThiefApp => !!a);
  const limitIndex = Math.max(0, LIMIT_OPTIONS.indexOf(settings.limitMinutes as (typeof LIMIT_OPTIONS)[number]));
  const stepLimit = (dir: -1 | 1) => {
    const next = Math.min(LIMIT_OPTIONS.length - 1, Math.max(0, limitIndex + dir));
    updateSettings({ limitMinutes: LIMIT_OPTIONS[next] });
  };
  const setNightlyPostcard = async (on: boolean) => {
    if (!on) {
      updateSettings({ nightlyPostcard: false });
      void cancelNightlyReturn();
      return;
    }
    if (await ensureNotificationPermission()) {
      updateSettings({ nightlyPostcard: true });
      return;
    }
    // Sin permiso el ajuste sigue apagado; explicamos cómo activarlo, sin insistir.
    Alert.alert(permissionDeniedCopy.title, permissionDeniedCopy.body(settings.lumiName), [
      { text: permissionDeniedCopy.notNow, style: 'cancel' },
      { text: permissionDeniedCopy.openSettings, onPress: () => void Linking.openSettings() },
    ]);
  };

  return (
    <Screen title="Ajustes" subtitle="Lo que apaga la luz de Lumi y cuándo se va a dormir.">
      <View style={{ gap: 10 }}>
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
        <List>
          {apps.length === 0 ? (
            <Row last>
              <Label title="Ninguna todavía" sub="Elige las apps que más te roban la atención" />
            </Row>
          ) : null}
          {apps.map((app, i) => (
            <Row key={app.id} last={i === apps.length - 1}>
              <View style={[styles.ic, { experimental_backgroundImage: app.icon }]}>
                <Text style={[styles.icLetter, app.ink ? { color: app.ink } : null]}>{app.letter}</Text>
              </View>
              <Label title={app.name} sub={app.note} />
            </Row>
          ))}
        </List>
      </View>

      <View style={{ gap: 10 }}>
        <SectionTitle>Límite y noche</SectionTitle>
        <List>
          <Row>
            <Label title="Límite diario suave" sub="Lumi se cansa al acercarte" />
            <View style={styles.stepper}>
              <StepButton label="−" a11y="Reducir límite" disabled={limitIndex === 0} onPress={() => stepLimit(-1)} />
              <Text style={styles.stepValue} accessibilityLiveRegion="polite">
                {formatLimit(settings.limitMinutes)}
              </Text>
              <StepButton
                label="+"
                a11y="Aumentar límite"
                disabled={limitIndex === LIMIT_OPTIONS.length - 1}
                onPress={() => stepLimit(1)}
              />
            </View>
          </Row>
          <Row>
            <Label title="Horario de noche" sub="Lumi duerme y las apps ladronas se tapan" />
            <Text style={styles.val}>
              {settings.nightStart} a {settings.nightEnd}
            </Text>
          </Row>
          <Row>
            <Label title="Postal nocturna" sub="Aviso cuando Lumi vuelve" />
            <Toggle
              label="Postal nocturna"
              value={settings.nightlyPostcard}
              onChange={(v) => void setNightlyPostcard(v)}
            />
          </Row>
          <Row last>
            <Label title="Días de descanso" sub="2 por semana, la racha no se rompe" />
            <Toggle label="Días de descanso" value={settings.restDays} onChange={(v) => updateSettings({ restDays: v })} />
          </Row>
        </List>
      </View>

      {__DEV__ ? (
        <View style={{ gap: 10 }}>
          <SectionTitle>Desarrollo</SectionTitle>
          <List>
            <Row>
              <Label title="Cerrar el día" sub="Como si fuera de noche: Lumi vuelve de su expedición" />
              <TextLink label="Cerrar" onPress={game.dev.closeDay} />
            </Row>
            <Row>
              <Label title="Pasar al día siguiente" sub="Adelanta el reloj un día" />
              <TextLink label="Mañana" onPress={game.dev.nextDay} />
            </Row>
            <Row>
              <Label title="Borrar el progreso" sub="Días, álbum, objetos y chispas" />
              <TextLink label="Borrar" onPress={game.dev.reset} />
            </Row>
            <Row>
              <Label title="Ver el escudo" sub="Lo que sale al abrir una app ladrona pasado el límite" />
              <TextLink label="Abrir" onPress={() => router.push('/escudo')} />
            </Row>
            <Row>
              <Label title="Ver la postal nocturna" sub="Lo que trae Lumi al volver de su expedición" />
              <TextLink label="Abrir" onPress={() => router.push('/postal')} />
            </Row>
            <Row>
              <Label title="Ver Lumi Plus" sub="El paywall con la prueba gratis" />
              <TextLink label="Abrir" onPress={() => router.push('/plus')} />
            </Row>
            <Row last>
              <Label title="Repetir el onboarding" sub="Vuelve a la primera pantalla" />
              <TextLink label="Repetir" onPress={() => updateSettings({ onboarded: false })} />
            </Row>
          </List>
        </View>
      ) : null}

      <View style={styles.plus}>
        <Text style={styles.plusTitle}>Lumi Plus</Text>
        <View style={{ gap: 3 }}>
          {plusFeatures.map((f) => (
            <View key={f.key} style={styles.bullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{f.title}</Text>
            </View>
          ))}
        </View>
        {settings.isPlus ? (
          <>
            <Text style={styles.plusSmall}>Ya tienes Lumi Plus. Gracias por acompañarla un poco más lejos ✨</Text>
            <TextLink label="Ver mi suscripción" onPress={() => router.push('/plus')} />
          </>
        ) : (
          <>
            <PillButton label="Probar 7 días gratis" onPress={() => router.push('/plus')} />
            <Text style={styles.plusSmall}>Luego 49,99 $ al año. Lumi no se pone triste si no lo pruebas.</Text>
          </>
        )}
      </View>
    </Screen>
  );
}

function List({ children }: { children: ReactNode }) {
  return <View style={styles.list}>{children}</View>;
}

function Row({ children, last }: { children: ReactNode; last?: boolean }) {
  return <View style={[styles.row, !last && styles.rowDivider]}>{children}</View>;
}

function Label({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={styles.lbl}>
      <Text style={styles.lblTitle}>{title}</Text>
      {sub ? <Text style={styles.lblSub}>{sub}</Text> : null}
    </View>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Switch
      accessibilityLabel={label}
      value={value}
      onValueChange={onChange}
      trackColor={{ true: Colors.violet, false: 'rgba(201, 191, 242, 0.25)' }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="rgba(201, 191, 242, 0.25)"
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
  list: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    borderRadius: 20,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 14, minHeight: 52 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.hairline },
  ic: { width: 32, height: 32, borderRadius: 9, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  icLetter: { fontFamily: Fonts.bodyBold, fontSize: 13, color: '#FFFFFF' },
  lbl: { flex: 1, minWidth: 0 },
  lblTitle: { fontFamily: Fonts.body, fontSize: 15, lineHeight: 20, color: Colors.text },
  lblSub: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 16, color: Colors.textTertiary },
  val: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textSecondary, fontVariant: ['tabular-nums'] },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.hairline,
    backgroundColor: 'rgba(201, 191, 242, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontFamily: Fonts.body, fontSize: 17, lineHeight: 20, color: Colors.text },
  stepValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.text,
    minWidth: 50,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  plus: {
    gap: 10,
    padding: 18,
    borderRadius: 24,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255, 201, 107, 0.3)',
    experimental_backgroundImage: `radial-gradient(ellipse 260px 160px at 90% 0%, rgba(255, 201, 107, 0.35) 0%, transparent 70%), linear-gradient(${Colors.indigo}, ${Colors.indigo})`,
  },
  plusTitle: { fontFamily: Fonts.displayBold, fontSize: 22, lineHeight: 28, color: Colors.amberPale },
  bullet: { flexDirection: 'row', gap: 8, paddingLeft: 4 },
  bulletDot: { fontSize: 13.5, lineHeight: 19, color: Colors.textSecondary },
  bulletText: { flex: 1, fontFamily: Fonts.body, fontSize: 13.5, lineHeight: 19, color: Colors.textSecondary },
  plusSmall: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 17, color: Colors.textTertiary },
});
