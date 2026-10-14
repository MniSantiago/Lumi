/**
 * El embudo de Lampi, escrito en un solo sitio.
 *
 * Son los nombres que se verán en PostHog, así que se tocan con cuidado:
 * renombrar uno parte los embudos ya construidos. Si hace falta cambiar un
 * nombre, se manda el nuevo *y* el viejo durante una versión.
 *
 * La línea roja de la Fase 1: aquí se mide **la forma del embudo, nunca el
 * contenido**. Qué apps ha elegido, cuántos minutos ha puesto y cuánto usa el
 * móvil no salen del iPhone, ni ahora ni nunca. Lo que sale es «concedió el
 * permiso: sí/no», «eligió 3 apps», «vio el paywall». Con eso se encuentra
 * dónde se cae la gente sin tocar un solo dato sensible.
 */
export const EVENTS = {
  /** Cada arranque. Es el evento con el que se calculan D1, D7 y D30. */
  appAbierta: 'app_abierta',
  /** Primer paso del onboarding a la vista. */
  onboardingIniciado: 'onboarding_iniciado',
  /** La pantalla del sistema de Tiempo de Uso, resuelta. La etapa que más importa. */
  permisoTiempoUso: 'permiso_tiempo_uso',
  /** Cuántas apps ladronas ha elegido. El número, nunca cuáles. */
  appsElegidas: 'apps_elegidas',
  /** Onboarding terminado: ya hay un Lampi vivo. */
  onboardingCompletado: 'onboarding_completado',
  /** El paywall a la vista, de donde venga. */
  paywallVisto: 'paywall_visto',
  /**
   * El paywall se ha enseñado y la tienda no ha devuelto nada que vender.
   * Es el detector de que nadie puede pagar (falta la clave, no hay red, los
   * productos no están aprobados). Sin este evento, en el embudo se ve igual
   * que «lo ha visto y ha dicho no».
   */
  paywallSinOferta: 'paywall_sin_oferta',
  /** Ha tocado comprar. Que acabe bien o mal lo dicen los dos de abajo. */
  compraIniciada: 'compra_iniciada',
  /** Compra terminada. RevenueCat sigue siendo la fuente de verdad del dinero. */
  compraCompletada: 'compra_completada',
  /** Compra cancelada por el usuario o fallida. */
  compraNoCompletada: 'compra_no_completada',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/** De dónde se ha abierto el paywall. Sirve para saber qué entrada vende. */
export type PaywallOrigen =
  | 'postal' // A2: Lampi cuenta que vio algo de lejos
  | 'onboarding' // A3: la prueba al final del onboarding
  | 'expediciones'
  | 'progreso'
  | 'ajustes'
  | 'aviso' // el recordatorio de que la prueba se acaba
  | 'desconocido';
