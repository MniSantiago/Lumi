import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { createAnalytics, STORAGE_KEY_ID, STORAGE_KEY_QUEUE, type AnalyticsStorage } from '@/analytics/client';
import { EVENTS } from '@/analytics/events';

/** AsyncStorage de mentira, en memoria. */
function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: async (k: string) => data.get(k) ?? null,
    setItem: async (k: string, v: string) => void data.set(k, v),
  } satisfies AnalyticsStorage & { data: Map<string, string> };
}

type FetchLike = typeof globalThis.fetch;
type FetchMock = jest.MockedFunction<FetchLike>;

function okFetch(): FetchMock {
  return jest.fn(async () => ({ ok: true, status: 200 }) as Response) as FetchMock;
}

function respuesta(status: number): FetchMock {
  return jest.fn(async () => ({ ok: status < 400, status }) as Response) as FetchMock;
}

/** La URL y el cuerpo ya parseado de la petición `i`. */
function peticion(fetchImpl: FetchMock, i = 0) {
  const call = fetchImpl.mock.calls[i] as unknown as [string, RequestInit];
  return { url: String(call[0]), body: JSON.parse(String(call[1].body)) };
}

/** Deja correr las promesas pendientes del `void (async () => …)` de `track`. */
const settle = () => new Promise<void>((r) => setImmediate(r));

const HOST = 'https://eu.i.posthog.com';
const base = { host: HOST, baseProps: { version_app: '1.0.2' } };

describe('cliente de medición', () => {
  beforeEach(() => {
    jest.useRealTimers();
  });

  it('sin clave no manda nada ni guarda nada', async () => {
    const storage = memoryStorage();
    const fetchImpl = okFetch();
    const a = createAnalytics({ ...base, key: '', storage, fetchImpl });

    expect(a.enabled).toBe(false);
    a.track(EVENTS.appAbierta, { primera_vez: true });
    await a.flush();
    await settle();

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(storage.data.size).toBe(0);
  });

  it('manda el evento al endpoint de lotes con la clave y el id anónimo', async () => {
    const storage = memoryStorage();
    const fetchImpl = okFetch();
    const a = createAnalytics({ ...base, key: 'phc_test', storage, fetchImpl });

    a.track(EVENTS.paywallVisto, { origen: 'postal' });
    await settle();
    await a.flush();

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const { url, body } = peticion(fetchImpl);
    expect(url).toBe(`${HOST}/batch/`);
    expect(fetchImpl.mock.calls[0]?.[1]?.method).toBe('POST');

    expect(body.api_key).toBe('phc_test');
    expect(body.batch).toHaveLength(1);
    expect(body.batch[0].event).toBe('paywall_visto');
    expect(body.batch[0].properties).toMatchObject({ origen: 'postal', version_app: '1.0.2' });
    expect(String(body.batch[0].properties.distinct_id)).toMatch(/^anon_[0-9a-f]{24}$/);
    expect(typeof body.batch[0].timestamp).toBe('string');
  });

  it('el id anónimo se guarda y se reutiliza entre arranques', async () => {
    const storage = memoryStorage();
    const first = createAnalytics({ ...base, key: 'phc_test', storage, fetchImpl: okFetch() });
    first.track(EVENTS.appAbierta);
    await settle();
    await first.flush();

    const saved = storage.data.get(STORAGE_KEY_ID);
    expect(saved).toMatch(/^anon_/);

    const fetchImpl = okFetch();
    const second = createAnalytics({ ...base, key: 'phc_test', storage, fetchImpl });
    second.track(EVENTS.appAbierta);
    await settle();
    await second.flush();

    expect(peticion(fetchImpl).body.batch[0].properties.distinct_id).toBe(saved);
  });

  it('un fallo de red no pierde el evento: se reintenta en el siguiente envío', async () => {
    const storage = memoryStorage();
    const fetchImpl = okFetch();
    fetchImpl.mockRejectedValueOnce(new Error('sin red'));

    const a = createAnalytics({ ...base, key: 'phc_test', storage, fetchImpl });
    a.track(EVENTS.compraIniciada, { plan: 'annual' });
    await settle();

    await a.flush();
    expect(a.pending).toBe(1);

    await a.flush();
    expect(a.pending).toBe(0);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('un 4xx no se reintenta (reintentarlo sería un bucle)', async () => {
    const storage = memoryStorage();
    const fetchImpl = respuesta(401);

    const a = createAnalytics({ ...base, key: 'phc_malo', storage, fetchImpl });
    a.track(EVENTS.appAbierta);
    await settle();
    await a.flush();

    expect(a.pending).toBe(0);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('la cola sobrevive a un cierre en seco', async () => {
    const storage = memoryStorage();
    // Muere sin poder mandar: queda en disco.
    const dying = createAnalytics({
      ...base,
      key: 'phc_test',
      storage,
      fetchImpl: jest.fn(async () => {
        throw new Error('sin red');
      }) as unknown as FetchMock,
    });
    dying.track(EVENTS.onboardingCompletado, { postal_nocturna: true });
    await settle();
    await dying.flush();
    expect(JSON.parse(storage.data.get(STORAGE_KEY_QUEUE) ?? '[]')).toHaveLength(1);

    // Arranque siguiente: lo recupera y lo manda.
    const fetchImpl = okFetch();
    const reborn = createAnalytics({ ...base, key: 'phc_test', storage, fetchImpl });
    await reborn.flush();

    expect(peticion(fetchImpl).body.batch[0].event).toBe('onboarding_completado');
    expect(reborn.pending).toBe(0);
  });

  it('un error al escribir en el almacenamiento no rompe nada', async () => {
    const roto: AnalyticsStorage = {
      getItem: async () => {
        throw new Error('disco roto');
      },
      setItem: async () => {
        throw new Error('disco roto');
      },
    };
    const fetchImpl = okFetch();
    const a = createAnalytics({ ...base, key: 'phc_test', storage: roto, fetchImpl });

    expect(() => a.track(EVENTS.appAbierta)).not.toThrow();
    await settle();
    await expect(a.flush()).resolves.toBeUndefined();
    // Sigue midiendo con un id de memoria.
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('varios eventos seguidos van en una sola petición', async () => {
    const storage = memoryStorage();
    const fetchImpl = okFetch();
    const a = createAnalytics({ ...base, key: 'phc_test', storage, fetchImpl });

    a.track(EVENTS.appAbierta);
    a.track(EVENTS.onboardingIniciado);
    a.track(EVENTS.permisoTiempoUso, { resultado: 'concedido' });
    await settle();
    await a.flush();

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const { body } = peticion(fetchImpl);
    expect(body.batch.map((e: { event: string }) => e.event)).toEqual([
      'app_abierta',
      'onboarding_iniciado',
      'permiso_tiempo_uso',
    ]);
  });
});
