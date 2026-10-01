/** Tiempos de la splash animada (ms). Es un saludo, no una espera: no aguarda a que acabe el vídeo. */
export const SPLASH = {
  /** Duración del vídeo (`assets/video/splash.mp4`). */
  videoMs: 4967,
  /** Lo mínimo que se ve aunque la app ya esté lista: llega hasta el salto contento de Lampi (~2,5 s del vídeo). */
  minShow: 2600,
  /** Fundido de salida. */
  fadeOut: 400,
  /** Con movimiento reducido: sin vídeo, solo un fundido corto en cuanto la app está lista. */
  fadeOutReduced: 200,
  /** Si la imagen no llega a cargar, la splash nativa se quita igualmente pasado este tiempo. */
  nativeHideFallback: 1500,
  /** Fondo del vídeo (azul noche del primer fotograma). Debe coincidir con `backgroundColor` del plugin expo-splash-screen en app.json. */
  background: '#030124',
} as const;

/** Cuándo se despide la splash: cuando ya pasó el mínimo y la app está lista. */
export function shouldExit(opts: { appReady: boolean; minElapsed: boolean }): boolean {
  return opts.appReady && opts.minElapsed;
}

/**
 * Lado (pt) con el que se pinta el recorte cuadrado del primer fotograma para que
 * coincida con el vídeo a pantalla completa (`cover`, 1080x1920). `app.json` fija
 * `imageWidth` para la nativa con la misma cuenta en un iPhone de 393x852.
 */
export function splashPosterSize(width: number, height: number): number {
  return 1080 * Math.max(width / 1080, height / 1920);
}
