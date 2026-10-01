import { afterEach, describe, expect, it } from '@jest/globals';

import { markReady, resetReady } from '@/splash/state';
import { SPLASH, shouldExit } from '@/splash/timing';

afterEach(resetReady);

describe('shouldExit', () => {
  it('espera a que la app esté lista y a que pase el mínimo', () => {
    expect(shouldExit({ appReady: false, minElapsed: false })).toBe(false);
    expect(shouldExit({ appReady: true, minElapsed: false })).toBe(false);
    expect(shouldExit({ appReady: false, minElapsed: true })).toBe(false);
    expect(shouldExit({ appReady: true, minElapsed: true })).toBe(true);
  });

  it('la animación completa dura poco: mínimo + fundido por debajo de 2,5 s', () => {
    expect(SPLASH.minShow + SPLASH.fadeOut).toBeLessThanOrEqual(2500);
  });
});

describe('markReady', () => {
  it('es idempotente y no falla sin oyentes', () => {
    markReady('fonts');
    markReady('fonts');
    markReady('store');
    expect(() => resetReady()).not.toThrow();
  });
});
