import { router } from 'expo-router';
import { Alert, Linking, StyleSheet, Switch, Text, View } from 'react-native';

import { exportMyData } from '@/account/export';
import { useSession } from '@/account/session';
import { AppIcon, Label, List, Row, Stepper } from '@/components/onboarding/controls';
import { PillButton, SectionTitle, Screen, TextLink } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { plusFeatures } from '@/components/paywall/copy';
import { useGame } from '@/game/store';
import { thiefAppById, type ThiefApp } from '@/lumi/data';
import { formatLimit, LIMIT_OPTIONS, useLumi } from '@/lumi/store';
import { stepTime } from '@/lumi/time';
import { realScreenTime } from '@/screen-time';
import { thiefAppsCount } from '@/screen-time/native';
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
        <SectionTitle action={<TextLink label="Editar" onPress={() => router.push('/nombres')} />}>Nombres</SectionTitle>
        <List>
          <Row>
            <Label title="Tú" />
            <Text style={styles.val} numberOfLines={1}>
              {settings.userName || 'Sin nombre'}
            </Text>
          </Row>
          <Row last>
            <Label title="Tu lucecita" />
            <Text style={styles.val} numberOfLines={1}>
              {settings.lumiName}
            </Text>
          </Row>
        </List>
      </View>

      <View style={{ gap: 10 }}>
        <SectionTitle action={<TextLink label="Editar" onPress={() => router.push('/apps')} />}>
          Apps ladronas
        </SectionTitle>
        {realScreenTime ? (
          <List>
            <Row last>
              <Label title={`${thiefAppsCount()} apps y categorías`} sub="Elegidas con el selector de Apple" />
            </Row>
          </List>
        ) : (
          <List>
            {apps.length === 0 ? (
              <Row last>
                <Label title="Ninguna todavía" sub="Elige las apps que más te roban la atención" />
              </Row>
            ) : null}
            {apps.map((app, i) => (
              <Row key={app.id} last={i === apps.length - 1}>
                <AppIcon app={app} />
                <Label title={app.name} sub={app.note} />
              </Row>
            ))}
          </List>
        )}
      </View>

      <View style={{ gap: 10 }}>
        <SectionTitle>Límite y noche</SectionTitle>
        <List>
          <Row>
            <Label title="Límite diario suave" sub="Lumi se cansa al acercarte" />
            <Stepper
              value={formatLimit(settings.limitMinutes)}
              onDecrease={() => stepLimit(-1)}
              onIncrease={() => stepLimit(1)}
              canDecrease={limitIndex > 0}
              canIncrease={limitIndex < LIMIT_OPTIONS.length - 1}
              decreaseLabel="Reducir límite"
              increaseLabel="Aumentar límite"
            />
          </Row>
          <Row>
            <Label title="Se va a dormir" sub={`${settings.lumiName} duerme y las apps ladronas se tapan`} />
            <Stepper
              value={settings.nightStart}
              onDecrease={() => updateSettings({ nightStart: stepTime(settings.nightStart, -1) })}
              onIncrease={() => updateSettings({ nightStart: stepTime(settings.nightStart, 1) })}
              decreaseLabel="Acostarse media hora antes"
              increaseLabel="Acostarse media hora después"
            />
          </Row>
          <Row>
            <Label title="Se despierta" sub="Y vuelve de su expedición" />
            <Stepper
              value={settings.nightEnd}
              onDecrease={() => updateSettings({ nightEnd: stepTime(settings.nightEnd, -1) })}
              onIncrease={() => updateSettings({ nightEnd: stepTime(settings.nightEnd, 1) })}
              decreaseLabel="Despertarse media hora antes"
              increaseLabel="Despertarse media hora después"
            />
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

      <View style={{ gap: 10 }}>
        <SectionTitle>Cuenta</SectionTitle>
        <AccountSection />
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

      <View style={styles.legal}>
        <TextLink label="Ayuda" onPress={() => router.push('/legal/ayuda')} />
        <Text style={styles.legalSep}>·</Text>
        <TextLink label="Privacidad" onPress={() => router.push('/legal/privacidad')} />
        <Text style={styles.legalSep}>·</Text>
        <TextLink label="Términos" onPress={() => router.push('/legal/terminos')} />
      </View>
    </Screen>
  );
}

/** Cuenta opcional: guardar el progreso, verificar el correo, contraseña, cerrar sesión y eliminarla. */
function AccountSection() {
  const { loading, user, signOut } = useSession();
  const { settings } = useLumi();
  const game = useGame();
  if (loading) return null;
  const downloadRow = (
    <Row>
      <Label title="Tus datos" sub="Todo lo que Lumi guarda de ti, en un archivo" />
      <TextLink
        label="Descargar"
        onPress={() =>
          void exportMyData({ settings, game: game.snapshot, user }).catch(() =>
            Alert.alert('No se ha podido exportar', 'Vuelve a intentarlo en un momento.'),
          )
        }
      />
    </Row>
  );
  if (!user) {
    return (
      <List>
        {downloadRow}
        <Row last>
          <Label title="Guarda tu progreso" sub="Opcional. Para no perder a Lumi si cambias de iPhone" />
          <TextLink label="Empezar" onPress={() => router.push('/cuenta')} />
        </Row>
      </List>
    );
  }
  const askSignOut = () =>
    Alert.alert('¿Cerrar sesión?', 'Lumi y su progreso se quedan en este iPhone.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', onPress: () => void signOut() },
    ]);
  return (
    <List>
      <Row>
        <Label title={user.email} sub={user.emailVerified ? 'Correo confirmado' : 'Falta confirmar el correo'} />
        {user.emailVerified ? null : <TextLink label="Confirmar" onPress={() => router.push('/cuenta/verificar')} />}
      </Row>
      {downloadRow}
      <Row>
        <Label title="Contraseña" />
        <TextLink label="Cambiar" onPress={() => router.push('/cuenta/contrasena')} />
      </Row>
      <Row>
        <Label title="Cerrar sesión" />
        <TextLink label="Salir" onPress={askSignOut} />
      </Row>
      <Row last>
        <Label title="Eliminar la cuenta" sub="Borra tus datos de nuestro servidor" />
        <TextLink label="Eliminar" onPress={() => router.push('/cuenta/eliminar')} />
      </Row>
    </List>
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

const styles = StyleSheet.create({
  val: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textSecondary, fontVariant: ['tabular-nums'], maxWidth: '55%' },
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
  legal: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  legalSep: { fontSize: 13, color: Colors.textTertiary },
  plusSmall: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 17, color: Colors.textTertiary },
});
