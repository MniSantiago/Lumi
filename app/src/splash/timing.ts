/** Tiempos de la splash animada (ms). Cortos a propósito: es un saludo, no una espera. */
export const SPLASH = {
  /** Lo mínimo que se ve la animación aunque la app ya esté lista (el gesto de Lampi termina aquí). */
  minShow: 1150,
  /** Fundido de salida. */
  fadeOut: 320,
  /** Con movimiento reducido: sin gestos, solo un fundido corto en cuanto la app está lista. */
  fadeOutReduced: 200,
  /** Si la imagen no llega a cargar, la splash nativa se quita igualmente pasado este tiempo. */
  nativeHideFallback: 1500,
} as const;

/** Cuándo se despide la splash: cuando ya pasó el mínimo y la app está lista. */
export function shouldExit(opts: { appReady: boolean; minElapsed: boolean }): boolean {
  return opts.appReady && opts.minElapsed;
}
