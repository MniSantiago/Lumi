/**
 * Fetch que usan todas las funciones generadas por Orval (`generated.ts`).
 *
 * - Pone la URL base (`EXPO_PUBLIC_API_URL`) y el token de acceso.
 * - Si el token ha caducado (401), refresca una sola vez y repite la petición.
 * - Convierte los errores del backend en `ApiError` con un mensaje ya listo para enseñar.
 */

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Lo que conecta el cliente con la sesión (lo registra `SessionProvider`). */
type AuthHooks = {
  getAccessToken: () => string | null;
  /** Refresca la sesión; devuelve el nuevo token de acceso o null si ya no hay sesión. */
  refresh: () => Promise<string | null>;
};

let auth: AuthHooks = { getAccessToken: () => null, refresh: async () => null };
export function setAuthHooks(hooks: AuthHooks) {
  auth = hooks;
}

/** Rutas que no deben intentar refrescar (evita bucles). */
const NO_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

export async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const send = (token: string | null) => {
    const headers = new Headers(options.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${BASE_URL}${url}`, { ...options, headers });
  };

  let res: Response;
  try {
    res = await send(auth.getAccessToken());
    if (res.status === 401 && auth.getAccessToken() && !NO_REFRESH.some((p) => url.startsWith(p))) {
      const token = await auth.refresh();
      if (token) res = await send(token);
    }
  } catch {
    throw new ApiError(0, 'No hay conexión. Revisa internet y vuelve a intentarlo.');
  }

  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, messageFrom(res.status, body));
  return body as T;
}

function messageFrom(status: number, body: unknown): string {
  const message = (body as { message?: unknown } | null)?.message;
  // ValidationPipe devuelve una lista; enseñamos el primer problema.
  if (Array.isArray(message) && typeof message[0] === 'string') return message[0];
  if (typeof message === 'string' && status < 500 && status !== 429) return message;
  if (status === 429) return 'Demasiados intentos. Espera un minuto y vuelve a probar.';
  return 'Algo ha fallado. Vuelve a intentarlo en un momento.';
}
