import type { EventName } from '@/analytics/events';

/** Lo poco que el cliente necesita de AsyncStorage (así los tests no lo mockean). */
export type AnalyticsStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

export type AnalyticsClient = {
  track(event: EventName, props?: Record<string, unknown>): void;
  /** Manda ya lo que haya en la cola. Se espera solo en los tests y al irse la app al fondo. */
  flush(): Promise<void>;
  /** `false` cuando no hay clave: todo es no-op. */
  readonly enabled: boolean;
  /** Para los tests. */
  readonly pending: number;
};

/**
 * El `distinct_id` no va aquí: se pone al mandar. Así `track` puede encolar de
 * forma sincrónica y el orden del lote es el orden en que pasaron las cosas,
 * sin depender de lo que tarde el almacenamiento en contestar.
 */
type QueuedEvent = {
  event: string;
  properties: Record<string, unknown>;
  timestamp: string;
};

export const STORAGE_KEY_ID = 'lampi.analytics.id';
export const STORAGE_KEY_QUEUE = 'lampi.analytics.cola';

/** Más allá de esto se tiran los eventos viejos: una cola sin tope es una fuga de memoria. */
const MAX_QUEUE = 200;
/** Cuántos eventos van en cada petición. */
const MAX_BATCH = 20;
/** Se espera un poco para que varios eventos seguidos vayan en una sola petición. */
const FLUSH_DELAY_MS = 3_000;
/** Una petición de analítica nunca debe colgarse: si tarda, se abandona y se reintenta. */
const TIMEOUT_MS = 10_000;

export type CreateAnalyticsOptions = {
  /** Clave de proyecto de PostHog. Vacía = desactivado. */
  key: string;
  /** `https://eu.i.posthog.com` en producción. */
  host: string;
  storage: AnalyticsStorage;
  fetchImpl: typeof globalThis.fetch;
  /** Propiedades que van en todos los eventos (versión, plataforma, idioma). */
  baseProps?: Record<string, unknown>;
  now?: () => Date;
  /** Solo para ver qué pasa en desarrollo; en producción se calla. */
  debug?: (event: string, props: Record<string, unknown>) => void;
};

/**
 * Cliente mínimo de PostHog sobre `fetch`.
 *
 * Por qué no el SDK oficial: `posthog-react-native` trae módulos nativos
 * (rebuild y riesgo de build con Xcode 26.3) y viene con autocaptura y
 * grabación de sesión **activadas de serie**. Grabar la pantalla de una app de
 * tiempo de pantalla significa grabar las apps del usuario a la vista: es justo
 * lo que la Fase 1 prohíbe. Para nueve eventos no compensa.
 *
 * Reglas que cumple:
 * - **Sin clave no hace nada.** Se puede mergear y publicar antes de que exista
 *   la cuenta de PostHog; el día que la clave entre en EAS, empieza a medir sin
 *   tocar código.
 * - **Nunca lanza.** Un fallo de red o de JSON no puede romper la app.
 * - **Nunca bloquea.** `track` es sincrónico y no se espera.
 * - La cola sobrevive a un cierre en seco, así que no se pierde el embudo de
 *   quien instala sin cobertura.
 */
export function createAnalytics(options: CreateAnalyticsOptions): AnalyticsClient {
  const { key, host, storage, fetchImpl, baseProps = {}, now = () => new Date(), debug } = options;
  const enabled = key.length > 0;

  let queue: QueuedEvent[] = [];
  let distinctId: string | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let sending: Promise<void> | null = null;

  /** El id es un número aleatorio por instalación: ni IDFV, ni correo, ni nada del iPhone. */
  const ensureDistinctId = async (): Promise<string> => {
    if (distinctId) return distinctId;
    try {
      const saved = await storage.getItem(STORAGE_KEY_ID);
      if (saved) {
        distinctId = saved;
        return saved;
      }
    } catch {
      // Sin almacenamiento se usa uno de memoria: se pierde al cerrar, pero mide.
    }
    const fresh = `anon_${randomId()}`;
    distinctId = fresh;
    void storage.setItem(STORAGE_KEY_ID, fresh).catch(() => {});
    return fresh;
  };

  /**
   * Recupera lo que quedó sin mandar de la sesión anterior. Arranca al crear el
   * cliente y va delante de lo de esta sesión: los eventos viejos son los primeros.
   */
  const restoring: Promise<void> = (async () => {
    if (!enabled) return;
    try {
      const raw = await storage.getItem(STORAGE_KEY_QUEUE);
      if (!raw) return;
      const saved: unknown = JSON.parse(raw);
      if (Array.isArray(saved)) queue = [...(saved as QueuedEvent[]), ...queue].slice(-MAX_QUEUE);
    } catch {
      // Si estaba corrupto, se empieza de cero: no vale la pena arrastrarlo.
    }
  })();

  /**
   * Nunca se escribe en disco antes de haber leído lo que había: si no, el primer
   * evento de un arranque borraría la cola que dejó el arranque anterior.
   */
  const persist = () => {
    void restoring.then(() => storage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(queue))).catch(() => {});
  };

  const scheduleFlush = () => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      void flush();
    }, FLUSH_DELAY_MS);
  };

  const send = async (batch: QueuedEvent[], distinct_id: string) => {
    const controller = new AbortController();
    const abort = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetchImpl(`${host}/batch/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: key,
          batch: batch.map((e) => ({ ...e, properties: { ...e.properties, distinct_id } })),
        }),
        signal: controller.signal,
      });
      // 2xx se da por bueno. Un 4xx no se reintenta: reintentarlo es un bucle.
      if (!res.ok && res.status >= 500) throw new Error(`PostHog ${res.status}`);
    } finally {
      clearTimeout(abort);
    }
  };

  const flush = async (): Promise<void> => {
    if (!enabled) return;
    // Si había un envío programado, este lo reemplaza: así no queda un timer
    // suelto manteniendo vivo el proceso.
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (sending) return sending;

    sending = (async () => {
      await restoring;
      const id = await ensureDistinctId();
      while (queue.length) {
        const batch = queue.slice(0, MAX_BATCH);
        queue = queue.slice(batch.length);
        try {
          await send(batch, id);
          persist();
        } catch {
          // Vuelven al principio de la cola y se reintentan en el próximo flush.
          queue = [...batch, ...queue].slice(-MAX_QUEUE);
          persist();
          break;
        }
      }
    })().finally(() => {
      sending = null;
    });

    return sending;
  };

  const track: AnalyticsClient['track'] = (event, props = {}) => {
    debug?.(event, props);
    if (!enabled) return;

    try {
      // Encolar es sincrónico: el orden del lote es el orden real de los hechos.
      queue.push({ event, properties: { ...baseProps, ...props }, timestamp: now().toISOString() });
      if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
      persist();
      if (queue.length >= MAX_BATCH) void flush();
      else scheduleFlush();
    } catch {
      // La analítica nunca puede tumbar la app.
    }
  };

  return {
    track,
    flush,
    get enabled() {
      return enabled;
    },
    get pending() {
      return queue.length;
    },
  };
}

/** 24 caracteres hex. No necesita ser criptográfico: solo único por instalación. */
function randomId() {
  let out = '';
  while (out.length < 24) out += Math.random().toString(16).slice(2);
  return out.slice(0, 24);
}
