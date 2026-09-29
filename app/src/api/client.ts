/**
 * Fetch que usan todas las funciones generadas por Orval (`generated.ts`).
 *
 * - Pone la URL base (`EXPO_PUBLIC_API_URL`) y el token de acceso.
 * - Si el token ha caducado (401), refresca una sola vez y repite la petición.
 * - Convierte los errores del backend en `ApiError` con un mensaje ya listo para enseñar.
 */

import { lang, tr } from '@/i18n';

const CONFIGURED_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_URL = (CONFIGURED_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/**
 * Hay servidor al que hablar. En una build de producción sin EXPO_PUBLIC_API_URL,
 * no: la cuenta se oculta y la app funciona sin ella (mejor que un error delante
 * del revisor de Apple). En desarrollo se usa localhost.
 */
export const apiAvailable = Boolean(CONFIGURED_URL) || __DEV__;

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
    // El backend responde (errores y correos) en el idioma de la app.
    headers.set('Accept-Language', lang);
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
    throw new ApiError(
      0,
      tr({
        es: 'No hay conexión. Revisa internet y vuelve a intentarlo.',
        en: 'No connection. Check your internet and try again.',
        zh: '没有网络连接。请检查网络后重试。',
        hi: 'इंटरनेट नहीं है। कनेक्शन देखकर फिर कोशिश करो।',
        fr: 'Pas de connexion. Vérifie internet et réessaie.',
      }),
    );
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
  if (status === 429)
    return tr({
      es: 'Demasiados intentos. Espera un minuto y vuelve a probar.',
      en: 'Too many attempts. Wait a minute and try again.',
      zh: '尝试次数太多。请等一分钟再试。',
      hi: 'बहुत ज़्यादा कोशिशें। एक मिनट रुककर फिर कोशिश करो।',
      fr: 'Trop de tentatives. Attends une minute et réessaie.',
    });
  return tr({
    es: 'Algo ha fallado. Vuelve a intentarlo en un momento.',
    en: 'Something went wrong. Try again in a moment.',
    zh: '出了点问题。请稍后再试。',
    hi: 'कुछ गड़बड़ हो गई। थोड़ी देर में फिर कोशिश करो।',
    fr: 'Un problème est survenu. Réessaie dans un instant.',
  });
}
