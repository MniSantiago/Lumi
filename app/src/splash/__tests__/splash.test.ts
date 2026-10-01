import { afterEach, describe, expect, it } from '@jest/globals';

import { markReady, resetReady } from '@/splash/state';
import { SPLASH, shouldExit, splashPosterSize } from '@/splash/timing';

afterEach(resetReady);

describe('shouldExit', () => {
  it('espera a que la app esté lista y a que pase el mínimo', () => {
    expect(shouldExit({ appReady: false, minElapsed: false })).toBe(false);
    expect(shouldExit({ appReady: true, minElapsed: false })).toBe(false);
    expect(shouldExit({ appReady: false, minElapsed: true })).toBe(false);
    expect(shouldExit({ appReady: true, minElapsed: true })).toBe(true);
  });

  it('es un saludo, no una espera: mínimo + fundido por debajo de 3,2 s y sin esperar al final del vídeo', () => {
    expect(SPLASH.minShow + SPLASH.fadeOut).toBeLessThanOrEqual(3200);
    expect(SPLASH.minShow).toBeLessThan(SPLASH.videoMs);
  });
});

describe('splashPosterSize', () => {
  it('el recorte cuadrado coincide con el vídeo 1080x1920 en cover', () => {
    // iPhone de 393x852: manda la altura (852/1920), el recorte mide ~480 pt, igual que imageWidth de app.json.
    expect(Math.round(splashPosterSize(393, 852))).toBe(479);
    // Pantalla más ancha que el vídeo: manda el ancho.
    expect(splashPosterSize(1080, 1200)).toBe(1080);
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
