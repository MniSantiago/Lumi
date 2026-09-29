import type { ConfigContext, ExpoConfig } from 'expo/config';
import { withXcodeProject, type ConfigPlugin } from 'expo/config-plugins';

/**
 * Parte de `app.json`. Con `LUMI_WIDGET=1` añade el widget de Lumi (expo-widgets).
 * Con `LUMI_SCREEN_TIME=1` añade Screen Time de verdad:
 * el plugin de `react-native-device-activity` crea las extensiones
 * (ActivityMonitor, ShieldConfiguration y ShieldAction) con el entitlement de
 * Family Controls y el App Group compartido.
 *
 * Solo cuando Apple haya aprobado Family Controls (Distribution) para el
 * bundle y sus tres extensiones; si no, EAS no puede firmar el build.
 * Ver APP_STORE.md.
 */
export const APP_GROUP = 'group.com.gonzalez.lumi';
const SCREEN_TIME_MIN_IOS = '18.0';

/** Sube el mínimo de iOS de todos los targets del proyecto (expo-build-properties solo cambia el Podfile). */
const withMinimumIOS: ConfigPlugin<string> = (config, version) =>
  withXcodeProject(config, (c) => {
    const configurations = c.modResults.pbxXCBuildConfigurationSection() as Record<
      string,
      { buildSettings?: Record<string, string> }
    >;
    for (const entry of Object.values(configurations)) {
      const settings = entry.buildSettings;
      if (settings?.IPHONEOS_DEPLOYMENT_TARGET && parseFloat(settings.IPHONEOS_DEPLOYMENT_TARGET) < parseFloat(version)) {
        settings.IPHONEOS_DEPLOYMENT_TARGET = version;
      }
    }
    return c;
  });

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = [...(config.plugins ?? [])];

  if (process.env.LUMI_SCREEN_TIME === '1') {
    const appleTeamId = process.env.APPLE_TEAM_ID;
    if (!appleTeamId) throw new Error('LUMI_SCREEN_TIME=1 necesita APPLE_TEAM_ID (el Team ID de Apple Developer)');
    plugins.push(['react-native-device-activity', { appleTeamId, appGroup: APP_GROUP }]);
    // Las extensiones se generan con iOS 18 como mínimo: la app, igual, para que no se instale sin ellas.
    plugins.push(['expo-build-properties', { ios: { deploymentTarget: SCREEN_TIME_MIN_IOS } }]);
  }

  // Widget de Lumi (expo-widgets). Comparte el App Group con la app.
  const widget = process.env.LUMI_WIDGET === '1';
  if (widget) {
    plugins.push([
      'expo-widgets',
      {
        groupIdentifier: APP_GROUP,
        bundleIdentifier: 'com.gonzalez.lumi.widget',
        widgets: [
          {
            name: 'LumiWidget',
            displayName: 'Lumi',
            description: 'Su luz de hoy y qué está haciendo.',
            ios: { supportedFamilies: ['systemSmall', 'systemMedium', 'accessoryCircular'] },
          },
        ],
      },
    ]);
  }

  const result: ExpoConfig = {
    ...config,
    name: config.name ?? 'Lumi',
    slug: config.slug ?? 'lumi',
    plugins,
    extra: { ...config.extra, lumiWidget: widget },
  };
  return process.env.LUMI_SCREEN_TIME === '1' ? withMinimumIOS(result, SCREEN_TIME_MIN_IOS) : result;
};
