import { AppState } from 'react-native';

import { LampiScreenTime } from '../../modules/lampi-screen-time';
import type { ScreenTimeSource } from '@/screen-time/types';
import type { Threshold } from '@/lumi/states';

const THRESHOLDS: readonly number[] = [0, 25, 50, 75, 100];

function asThreshold(n: number): Threshold {
  return (THRESHOLDS.includes(n) ? n : 0) as Threshold;
}

/**
 * Fuente real: la extensión `DeviceActivityMonitor` escribe el último umbral en el
 * App Group y avisa con una notificación Darwin si la app está abierta. Además
 * releemos al volver a primer plano y cada minuto, por si cambió el día.
 */
export function createNativeScreenTime(): ScreenTimeSource | null {
  const native = LampiScreenTime;
  if (!native) return null;

  const listeners = new Set<(t: Threshold) => void>();
  let last = asThreshold(native.getThreshold());
  const publish = (n: number) => {
    const next = asThreshold(n);
    if (next === last) return;
    last = next;
    listeners.forEach((l) => l(next));
  };

  let stop: (() => void) | null = null;
  const start = () => {
    const sub = native.addListener('onThreshold', ({ threshold }) => publish(threshold));
    const app = AppState.addEventListener('change', (s) => s === 'active' && publish(native.getThreshold()));
    const timer = setInterval(() => publish(native.getThreshold()), 60_000);
    stop = () => {
      sub.remove();
      app.remove();
      clearInterval(timer);
    };
  };

  return {
    getThreshold: async () => asThreshold(native.getThreshold()),
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) start();
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          stop?.();
          stop = null;
        }
      };
    },
  };
}
