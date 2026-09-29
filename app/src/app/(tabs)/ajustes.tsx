import { router } from 'expo-router';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { exportMyData } from '@/account/export';
import { useSession } from '@/account/session';
import { AppIcon, Label, List, Row, Stepper, Toggle } from '@/components/onboarding/controls';
import { PillButton, SectionTitle, Screen, TextLink } from '@/components/ui';
import { Colors, Fonts } from '@/constants/theme';
import { paywallCopy, plusFeatures } from '@/components/paywall/copy';
import { useGame } from '@/game/store';
import { thiefAppById, type ThiefApp } from '@/lumi/data';
import { formatLimit, LIMIT_OPTIONS, useLumi } from '@/lumi/store';
import { stepTime } from '@/lumi/time';
import { realScreenTime } from '@/screen-time';
import { thiefAppsCount } from '@/screen-time/native';
import { cancelNightlyReturn, ensureNotificationPermission, permissionDeniedCopy } from '@/notifications';
import { tr } from '@/i18n';

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
    <Screen
      title={tr({ es: 'Ajustes', en: 'Settings', zh: '设置', hi: 'सेटिंग्स', fr: 'Réglages' })}
      subtitle={tr({
        es: 'Lo que apaga la luz de Lumi y cuándo se va a dormir.',
        en: 'What dims Lumi’s light and when she goes to sleep.',
        zh: '什么会让 Lumi 的光变暗，以及她什么时候睡觉。',
        hi: 'क्या Lumi की रोशनी कम करता है और वो कब सोने जाती है।',
        fr: 'Ce qui éteint la lumière de Lumi et quand elle va dormir.',
      })}>
      <View style={{ gap: 10 }}>
        <SectionTitle
          action={
            <TextLink
              label={tr({
                es: 'Editar',
                en: 'Edit',
                zh: '编辑',
                hi: 'बदलो',
                fr: 'Modifier',
              })}
              onPress={() => router.push('/nombres')}
            />
          }>
          {tr({ es: 'Nombres', en: 'Names', zh: '名字', hi: 'नाम', fr: 'Prénoms' })}
        </SectionTitle>
        <List>
          <Row>
            <Label
              title={tr({
                es: 'Tú',
                en: 'You',
                zh: '你',
                hi: 'तुम',
                fr: 'Toi',
              })}
            />
            <Text style={styles.val} numberOfLines={1}>
              {settings.userName ||
                tr({ es: 'Sin nombre', en: 'No name', zh: '未命名', hi: 'कोई नाम नहीं', fr: 'Sans prénom' })}
            </Text>
          </Row>
          <Row last>
            <Label
              title={tr({
                es: 'Tu lucecita',
                en: 'Your little light',
                zh: '你的小光',
                hi: 'तुम्हारी नन्ही रोशनी',
                fr: 'Ta petite lumière',
              })}
            />
            <Text style={styles.val} numberOfLines={1}>
              {settings.lumiName}
            </Text>
          </Row>
        </List>
      </View>

      <View style={{ gap: 10 }}>
        <SectionTitle
          action={
            <TextLink
              label={tr({
                es: 'Editar',
                en: 'Edit',
                zh: '编辑',
                hi: 'बदलो',
                fr: 'Modifier',
              })}
              onPress={() => router.push('/apps')}
            />
          }>
          {tr({ es: 'Apps ladronas', en: 'Thief apps', zh: '偷时间的 App', hi: 'चोर ऐप्स', fr: 'Applis voleuses' })}
        </SectionTitle>
        {realScreenTime ? (
          <List>
            <Row last>
              <Label
                title={tr({
                  es: `${thiefAppsCount()} apps y categorías`,
                  en: `${thiefAppsCount()} apps and categories`,
                  zh: `${thiefAppsCount()} 个 App 和类别`,
                  hi: `${thiefAppsCount()} ऐप्स और श्रेणियाँ`,
                  fr: `${thiefAppsCount()} applis et catégories`,
                })}
                sub={tr({
                  es: 'Elegidas con el selector de Apple',
                  en: 'Picked with Apple’s picker',
                  zh: '通过 Apple 的选择器选择',
                  hi: 'Apple के चयनकर्ता से चुनी गईं',
                  fr: 'Choisies avec le sélecteur d’Apple',
                })}
              />
            </Row>
          </List>
        ) : (
          <List>
            {apps.length === 0 ? (
              <Row last>
                <Label
                  title={tr({ es: 'Ninguna todavía', en: 'None yet', zh: '还没有', hi: 'अभी कोई नहीं', fr: 'Aucune pour l’instant' })}
                  sub={tr({
                    es: 'Elige las apps que más te roban la atención',
                    en: 'Pick the apps that steal your attention the most',
                    zh: '选出最偷走你注意力的 App',
                    hi: 'वो ऐप्स चुनो जो सबसे ज़्यादा ध्यान चुराती हैं',
                    fr: 'Choisis les applis qui te volent le plus d’attention',
                  })}
                />
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
        <SectionTitle>
          {tr({
            es: 'Límite y noche',
            en: 'Limit and night',
            zh: '上限和夜晚',
            hi: 'सीमा और रात',
            fr: 'Limite et nuit',
          })}
        </SectionTitle>
        <List>
          <Row>
            <Label
              title={tr({
                es: 'Límite diario suave',
                en: 'Gentle daily limit',
                zh: '温和的每日上限',
                hi: 'रोज़ की नरम सीमा',
                fr: 'Limite quotidienne douce',
              })}
              sub={tr({
                es: 'Lumi se cansa al acercarte',
                en: 'Lumi gets tired as you get close',
                zh: '快到上限时 Lumi 会累',
                hi: 'पास पहुँचने पर Lumi थक जाती है',
                fr: 'Lumi se fatigue quand tu t’en approches',
              })}
            />
            <Stepper
              value={formatLimit(settings.limitMinutes)}
              onDecrease={() => stepLimit(-1)}
              onIncrease={() => stepLimit(1)}
              canDecrease={limitIndex > 0}
              canIncrease={limitIndex < LIMIT_OPTIONS.length - 1}
              decreaseLabel={tr({
                es: 'Reducir límite',
                en: 'Lower limit',
                zh: '减少上限',
                hi: 'सीमा घटाओ',
                fr: 'Réduire la limite',
              })}
              increaseLabel={tr({
                es: 'Aumentar límite',
                en: 'Raise limit',
                zh: '增加上限',
                hi: 'सीमा बढ़ाओ',
                fr: 'Augmenter la limite',
              })}
            />
          </Row>
          <Row>
            <Label
              title={tr({
                es: 'Se va a dormir',
                en: 'Goes to sleep',
                zh: '睡觉时间',
                hi: 'सोने जाती है',
                fr: 'Va dormir',
              })}
              sub={tr({
                es: `${settings.lumiName} duerme y las apps ladronas se tapan`,
                en: `${settings.lumiName} sleeps and the thief apps get covered`,
                zh: `${settings.lumiName}睡觉，偷时间的 App 被盖住`,
                hi: `${settings.lumiName} सोती है और चोर ऐप्स ढक जाती हैं`,
                fr: `${settings.lumiName} dort et les applis voleuses sont couvertes`,
              })}
            />
            <Stepper
              value={settings.nightStart}
              onDecrease={() => updateSettings({ nightStart: stepTime(settings.nightStart, -1) })}
              onIncrease={() => updateSettings({ nightStart: stepTime(settings.nightStart, 1) })}
              decreaseLabel={tr({
                es: 'Acostarse media hora antes',
                en: 'Go to bed half an hour earlier',
                zh: '提前半小时睡觉',
                hi: 'आधा घंटा पहले सोना',
                fr: 'Se coucher une demi-heure plus tôt',
              })}
              increaseLabel={tr({
                es: 'Acostarse media hora después',
                en: 'Go to bed half an hour later',
                zh: '推迟半小时睡觉',
                hi: 'आधा घंटा बाद सोना',
                fr: 'Se coucher une demi-heure plus tard',
              })}
            />
          </Row>
          <Row>
            <Label
              title={tr({
                es: 'Se despierta',
                en: 'Wakes up',
                zh: '起床时间',
                hi: 'जागती है',
                fr: 'Se réveille',
              })}
              sub={tr({
                es: 'Y vuelve de su expedición',
                en: 'And comes back from her expedition',
                zh: '并从探险回来',
                hi: 'और अपने सफ़र से लौटती है',
                fr: 'Et rentre de son expédition',
              })}
            />
            <Stepper
              value={settings.nightEnd}
              onDecrease={() => updateSettings({ nightEnd: stepTime(settings.nightEnd, -1) })}
              onIncrease={() => updateSettings({ nightEnd: stepTime(settings.nightEnd, 1) })}
              decreaseLabel={tr({
                es: 'Despertarse media hora antes',
                en: 'Wake up half an hour earlier',
                zh: '提前半小时起床',
                hi: 'आधा घंटा पहले जागना',
                fr: 'Se réveiller une demi-heure plus tôt',
              })}
              increaseLabel={tr({
                es: 'Despertarse media hora después',
                en: 'Wake up half an hour later',
                zh: '推迟半小时起床',
                hi: 'आधा घंटा बाद जागना',
                fr: 'Se réveiller une demi-heure plus tard',
              })}
            />
          </Row>
          <Row>
            <Label
              title={tr({
                es: 'Postal nocturna',
                en: 'Nightly postcard',
                zh: '夜间明信片',
                hi: 'रात का पोस्टकार्ड',
                fr: 'Carte du soir',
              })}
              sub={tr({
                es: 'Aviso cuando Lumi vuelve',
                en: 'A notification when Lumi is back',
                zh: 'Lumi 回来时通知你',
                hi: 'Lumi के लौटने पर सूचना',
                fr: 'Une notification quand Lumi rentre',
              })}
            />
            <Toggle
              label={tr({
                es: 'Postal nocturna',
                en: 'Nightly postcard',
                zh: '夜间明信片',
                hi: 'रात का पोस्टकार्ड',
                fr: 'Carte du soir',
              })}
              value={settings.nightlyPostcard}
              onChange={(v) => void setNightlyPostcard(v)}
            />
          </Row>
          <Row last>
            <Label
              title={tr({
                es: 'Días de descanso',
                en: 'Rest days',
                zh: '休息日',
                hi: 'आराम के दिन',
                fr: 'Jours de repos',
              })}
              sub={tr({
                es: '2 por semana, la racha no se rompe',
                en: '2 a week, your streak stays',
                zh: '每周 2 天，连续记录不中断',
                hi: 'हफ़्ते में 2, सिलसिला नहीं टूटता',
                fr: '2 par semaine, la série continue',
              })}
            />
            <Toggle
              label={tr({
                es: 'Días de descanso',
                en: 'Rest days',
                zh: '休息日',
                hi: 'आराम के दिन',
                fr: 'Jours de repos',
              })}
              value={settings.restDays}
              onChange={(v) => updateSettings({ restDays: v })}
            />
          </Row>
        </List>
      </View>

      <View style={{ gap: 10 }}>
        <SectionTitle>{tr({ es: 'Cuenta', en: 'Account', zh: '账户', hi: 'खाता', fr: 'Compte' })}</SectionTitle>
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
            <Text style={styles.plusSmall}>{paywallCopy.ownedBody(settings.lumiName)}</Text>
            <TextLink
              label={tr({
                es: 'Ver mi suscripción',
                en: 'See my subscription',
                zh: '查看我的订阅',
                hi: 'मेरी सदस्यता देखो',
                fr: 'Voir mon abonnement',
              })}
              onPress={() => router.push('/plus')}
            />
          </>
        ) : (
          <>
            <PillButton
              label={tr({
                es: 'Probar 7 días gratis',
                en: 'Try 7 days free',
                zh: '免费试用 7 天',
                hi: '7 दिन मुफ़्त आज़माओ',
                fr: 'Essayer 7 jours gratuits',
              })}
              onPress={() => router.push('/plus')}
            />
            <Text style={styles.plusSmall}>
              {tr({
                es: 'Luego 49,99 $ al año.',
                en: 'Then $49.99 a year.',
                zh: '之后每年 $49.99。',
                hi: 'फिर $49.99 सालाना।',
                fr: 'Puis 49,99 $ par an.',
              })}{' '}
              {paywallCopy.noPressure}
            </Text>
          </>
        )}
      </View>

      <View style={styles.legal}>
        <TextLink
          label={tr({
            es: 'Ayuda',
            en: 'Help',
            zh: '帮助',
            hi: 'मदद',
            fr: 'Aide',
          })}
          onPress={() => router.push('/legal/ayuda')}
        />
        <Text style={styles.legalSep}>·</Text>
        <TextLink
          label={tr({
            es: 'Privacidad',
            en: 'Privacy',
            zh: '隐私',
            hi: 'गोपनीयता',
            fr: 'Confidentialité',
          })}
          onPress={() => router.push('/legal/privacidad')}
        />
        <Text style={styles.legalSep}>·</Text>
        <TextLink
          label={tr({
            es: 'Términos',
            en: 'Terms',
            zh: '条款',
            hi: 'शर्तें',
            fr: 'Conditions',
          })}
          onPress={() => router.push('/legal/terminos')}
        />
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
      <Label
        title={tr({
          es: 'Tus datos',
          en: 'Your data',
          zh: '你的数据',
          hi: 'तुम्हारा डेटा',
          fr: 'Tes données',
        })}
        sub={tr({
          es: 'Todo lo que Lumi guarda de ti, en un archivo',
          en: 'Everything Lumi keeps about you, in one file',
          zh: 'Lumi 保存的关于你的一切，一个文件',
          hi: 'Lumi तुम्हारे बारे में जो भी रखती है, एक फ़ाइल में',
          fr: 'Tout ce que Lumi garde sur toi, dans un fichier',
        })}
      />
      <TextLink
        label={tr({
          es: 'Descargar',
          en: 'Download',
          zh: '下载',
          hi: 'डाउनलोड',
          fr: 'Télécharger',
        })}
        onPress={() =>
          void exportMyData({ settings, game: game.snapshot, user }).catch(() =>
            Alert.alert(
              tr({
                es: 'No se ha podido exportar',
                en: 'Couldn’t export',
                zh: '无法导出',
                hi: 'एक्सपोर्ट नहीं हो सका',
                fr: 'Exportation impossible',
              }),
              tr({
                es: 'Vuelve a intentarlo en un momento.',
                en: 'Try again in a moment.',
                zh: '请稍后再试。',
                hi: 'थोड़ी देर में फिर कोशिश करो।',
                fr: 'Réessaie dans un instant.',
              }),
            ),
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
          <Label
            title={tr({
              es: 'Guarda tu progreso',
              en: 'Save your progress',
              zh: '保存你的进度',
              hi: 'अपनी प्रगति सहेजो',
              fr: 'Sauvegarde ta progression',
            })}
            sub={tr({
              es: 'Opcional. Para no perder a Lumi si cambias de iPhone',
              en: 'Optional. So you don’t lose Lumi if you change iPhones',
              zh: '可选。换 iPhone 时不会失去 Lumi',
              hi: 'वैकल्पिक। ताकि iPhone बदलने पर Lumi न खोए',
              fr: 'Facultatif. Pour ne pas perdre Lumi si tu changes d’iPhone',
            })}
          />
          <TextLink
            label={tr({
              es: 'Empezar',
              en: 'Start',
              zh: '开始',
              hi: 'शुरू करो',
              fr: 'Commencer',
            })}
            onPress={() => router.push('/cuenta')}
          />
        </Row>
      </List>
    );
  }
  const askSignOut = () =>
    Alert.alert(
      tr({ es: '¿Cerrar sesión?', en: 'Sign out?', zh: '退出登录？', hi: 'साइन आउट करें?', fr: 'Se déconnecter ?' }),
      tr({
        es: 'Lumi y su progreso se quedan en este iPhone.',
        en: 'Lumi and her progress stay on this iPhone.',
        zh: 'Lumi 和她的进度会留在这台 iPhone 上。',
        hi: 'Lumi और उसकी प्रगति इसी iPhone पर रहेगी।',
        fr: 'Lumi et sa progression restent sur cet iPhone.',
      }),
      [
        { text: tr({ es: 'Cancelar', en: 'Cancel', zh: '取消', hi: 'रद्द करो', fr: 'Annuler' }), style: 'cancel' },
        {
          text: tr({ es: 'Cerrar sesión', en: 'Sign out', zh: '退出登录', hi: 'साइन आउट', fr: 'Se déconnecter' }),
          onPress: () => void signOut(),
        },
      ],
    );
  return (
    <List>
      <Row>
        <Label
          title={user.email}
          sub={
            user.emailVerified
              ? tr({
                  es: 'Correo confirmado',
                  en: 'Email confirmed',
                  zh: '邮箱已确认',
                  hi: 'ईमेल की पुष्टि हो गई',
                  fr: 'E-mail confirmé',
                })
              : tr({
                  es: 'Falta confirmar el correo',
                  en: 'Email not confirmed yet',
                  zh: '邮箱还未确认',
                  hi: 'ईमेल की पुष्टि बाक़ी है',
                  fr: 'E-mail à confirmer',
                })
          }
        />
        {user.emailVerified ? null : (
          <TextLink
            label={tr({
              es: 'Confirmar',
              en: 'Confirm',
              zh: '确认',
              hi: 'पुष्टि करो',
              fr: 'Confirmer',
            })}
            onPress={() => router.push('/cuenta/verificar')}
          />
        )}
      </Row>
      {downloadRow}
      <Row>
        <Label
          title={tr({
            es: 'Contraseña',
            en: 'Password',
            zh: '密码',
            hi: 'पासवर्ड',
            fr: 'Mot de passe',
          })}
        />
        <TextLink
          label={tr({
            es: 'Cambiar',
            en: 'Change',
            zh: '修改',
            hi: 'बदलो',
            fr: 'Modifier',
          })}
          onPress={() => router.push('/cuenta/contrasena')}
        />
      </Row>
      <Row>
        <Label
          title={tr({
            es: 'Cerrar sesión',
            en: 'Sign out',
            zh: '退出登录',
            hi: 'साइन आउट',
            fr: 'Se déconnecter',
          })}
        />
        <TextLink
          label={tr({
            es: 'Salir',
            en: 'Sign out',
            zh: '退出',
            hi: 'बाहर निकलो',
            fr: 'Sortir',
          })}
          onPress={askSignOut}
        />
      </Row>
      <Row last>
        <Label
          title={tr({
            es: 'Eliminar la cuenta',
            en: 'Delete account',
            zh: '删除账户',
            hi: 'खाता हटाओ',
            fr: 'Supprimer le compte',
          })}
          sub={tr({
            es: 'Borra tus datos de nuestro servidor',
            en: 'Erases your data from our server',
            zh: '从我们的服务器删除你的数据',
            hi: 'हमारे सर्वर से तुम्हारा डेटा मिटाता है',
            fr: 'Efface tes données de notre serveur',
          })}
        />
        <TextLink
          label={tr({
            es: 'Eliminar',
            en: 'Delete',
            zh: '删除',
            hi: 'हटाओ',
            fr: 'Supprimer',
          })}
          onPress={() => router.push('/cuenta/eliminar')}
        />
      </Row>
    </List>
  );
}

const styles = StyleSheet.create({
  val: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
    maxWidth: '55%',
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
  legal: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  legalSep: { fontSize: 13, color: Colors.textTertiary },
  plusSmall: { fontFamily: Fonts.body, fontSize: 12, lineHeight: 17, color: Colors.textTertiary },
});
