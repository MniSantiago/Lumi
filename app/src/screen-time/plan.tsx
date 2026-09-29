import { useEffect } from 'react';

import { useLumi } from '@/lumi/store';
import { realScreenTime } from '@/screen-time';
import { applyScreenTimePlan } from '@/screen-time/native';

/**
 * Con Screen Time de verdad, vuelve a programar el día, la noche y el escudo
 * cuando cambian el límite, el horario o el nombre de Lumi (sale en el escudo).
 * Las apps elegidas lo reprograman desde el selector.
 */
export function ScreenTimePlan() {
  const { ready, settings } = useLumi();
  const { onboarded, limitMinutes, nightStart, nightEnd, lumiName } = settings;

  useEffect(() => {
    if (!realScreenTime || !ready || !onboarded) return;
    applyScreenTimePlan({ limitMinutes, nightStart, nightEnd, lumiName }).catch(() => {});
  }, [ready, onboarded, limitMinutes, nightStart, nightEnd, lumiName]);

  return null;
}
