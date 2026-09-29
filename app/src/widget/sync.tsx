import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useEffect } from 'react';

import { useGame } from '@/game/store';
import { LUMI_STATES } from '@/lumi/states';
import { useLumi } from '@/lumi/store';
import { isNightTime } from '@/lumi/time';
import { tr } from '@/i18n';
import { clockTime } from '@/i18n/dates';

import type { LumiWidgetProps } from './lumi-widget';

/** El widget existe si el build se hizo con LUMI_WIDGET=1 (ver `app.config.ts`) y no es Expo Go. */
const enabled =
  Constants.expoConfig?.extra?.lumiWidget === true &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

type WidgetModule = typeof import('./lumi-widget');
let loaded: WidgetModule | null = null;
/** Carga perezosa: `expo-widgets` necesita su módulo nativo, que en Expo Go no existe. */
function widgetModule(): WidgetModule {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  loaded ??= require('./lumi-widget') as WidgetModule;
  return loaded;
}

/**
 * Mantiene el widget al día con la luz de Lumi. Se actualiza cuando la app
 * está abierta; con la app cerrada enseña el último estado conocido.
 */
export function WidgetSync() {
  const { ready, state, settings } = useLumi();
  const game = useGame();
  const exploring = !!game.currentDestination && !game.todayRecord.closed;
  // En el horario de noche, dormida (como en el Hogar, #52).
  const night = isNightTime(settings.nightStart, settings.nightEnd);
  const shown = night ? LUMI_STATES.apagadita : state;
  const status = night
    ? tr({
        es: `Durmiendo hasta las ${clockTime(settings.nightEnd)}`,
        en: `Sleeping until ${clockTime(settings.nightEnd)}`,
        zh: `睡到${clockTime(settings.nightEnd)}`,
        hi: `${clockTime(settings.nightEnd)} तक सो रही है`,
        fr: `Dort jusqu’à ${clockTime(settings.nightEnd)}`,
      })
    : game.pendingReturn
    ? tr({
        es: 'Ha vuelto con una postal',
        en: 'Back with a postcard',
        zh: '带着明信片回来了',
        hi: 'पोस्टकार्ड लेकर लौट आई',
        fr: 'Rentrée avec une carte',
      })
    : exploring
      ? tr({
          es: `De expedición, vuelve a las ${game.returnsAt}`,
          en: `Exploring, back at ${game.returnsAt}`,
          zh: `探险中，${game.returnsAt}回来`,
          hi: `सफ़र पर, ${game.returnsAt} को लौटेगी`,
          fr: `En expédition, retour à ${game.returnsAt}`,
        })
      : state.key === 'apagadita'
        ? tr({ es: 'Se ha echado la siesta', en: 'Taking a nap', zh: '在睡午觉', hi: 'झपकी ले रही है', fr: 'Fait la sieste' })
        : tr({
            es: 'Descansa en la madriguera',
            en: 'Resting in her burrow',
            zh: '在小窝里休息',
            hi: 'अपने घर में आराम कर रही है',
            fr: 'Se repose dans son terrier',
          });

  useEffect(() => {
    if (!enabled || !ready || !settings.onboarded) return;
    const props: LumiWidgetProps = {
      lumiName: settings.lumiName,
      label: night ? tr({ es: 'Durmiendo', en: 'Sleeping', zh: '睡觉中', hi: 'सो रही है', fr: 'Endormie' }) : state.label,
      stateKey: shown.key,
      lit: state.lit,
      status,
    };
    try {
      widgetModule().lumiWidget.updateSnapshot(props);
    } catch {
      // Un widget que no se actualiza no debe romper la app.
    }
  }, [ready, settings.onboarded, settings.lumiName, night, shown.key, state.label, state.lit, status]);

  return null;
}
