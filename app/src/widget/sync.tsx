import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useEffect } from 'react';

import { useGame } from '@/game/store';
import { useLumi } from '@/lumi/store';

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
  const status = game.pendingReturn
    ? 'Ha vuelto con una postal'
    : exploring
      ? `De expedición, vuelve a las ${game.returnsAt}`
      : state.key === 'apagadita'
        ? 'Se ha echado la siesta'
        : 'Descansa en la madriguera';

  useEffect(() => {
    if (!enabled || !ready || !settings.onboarded) return;
    const props: LumiWidgetProps = {
      lumiName: settings.lumiName,
      label: state.label,
      stateKey: state.key,
      lit: state.lit,
      status,
    };
    try {
      widgetModule().lumiWidget.updateSnapshot(props);
    } catch {
      // Un widget que no se actualiza no debe romper la app.
    }
  }, [ready, settings.onboarded, settings.lumiName, state.key, state.label, state.lit, status]);

  return null;
}
