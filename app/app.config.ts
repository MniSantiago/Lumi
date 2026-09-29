import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Parte de `app.json`. Con `LUMI_SCREEN_TIME=1` añade Screen Time de verdad:
 * el plugin de `react-native-device-activity` crea las extensiones
 * (ActivityMonitor, ShieldConfiguration y ShieldAction) con el entitlement de
 * Family Controls y el App Group compartido.
 *
 * Solo cuando Apple haya aprobado Family Controls (Distribution) para el
 * bundle y sus tres extensiones; si no, EAS no puede firmar el build.
 * Ver APP_STORE.md.
 */
export const APP_GROUP = 'group.com.gonzalez.lumi';

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = [...(config.plugins ?? [])];

  if (process.env.LUMI_SCREEN_TIME === '1') {
    const appleTeamId = process.env.APPLE_TEAM_ID;
    if (!appleTeamId) throw new Error('LUMI_SCREEN_TIME=1 necesita APPLE_TEAM_ID (el Team ID de Apple Developer)');
    plugins.push(['react-native-device-activity', { appleTeamId, appGroup: APP_GROUP }]);
  }

  return { ...config, name: config.name ?? 'Lumi', slug: config.slug ?? 'lumi', plugins };
};
