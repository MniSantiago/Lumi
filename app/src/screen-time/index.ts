import type { Threshold } from '@/lumi/states';
import { createNativeScreenTime } from '@/screen-time/native';
import type { ScreenTimeSource } from '@/screen-time/types';

export type { ScreenTimeSource } from '@/screen-time/types';

function createMockScreenTime(initial: Threshold): ScreenTimeSource {
  let current = initial;
  const listeners = new Set<(t: Threshold) => void>();
  return {
    getThreshold: async () => current,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    simulate(t) {
      current = t;
      listeners.forEach((l) => l(t));
    },
  };
}

/** La fuente real en un iPhone con el módulo nativo; el mock en Expo Go y en web. */
export const screenTime: ScreenTimeSource = createNativeScreenTime() ?? createMockScreenTime(25);
