import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { ApiError, setAuthHooks } from '@/api/client';
import {
  getMe,
  login,
  logout,
  refresh as refreshSession,
  register,
  type AuthSessionDto,
  type RegisterDto,
  type UserDto,
} from '@/api/generated';

/**
 * Cuenta opcional de Lampi ("guardar tu progreso"). Sin cuenta la app funciona
 * igual; por eso nada de esto bloquea el arranque.
 *
 * Los tokens van al llavero (SecureStore). En web, que no tiene llavero, a
 * AsyncStorage: solo se usa para desarrollo.
 */

const KEY = 'lumi.session.v1';
type Tokens = { accessToken: string; refreshToken: string };

const storage = {
  async get(): Promise<Tokens | null> {
    const raw = Platform.OS === 'web' ? await AsyncStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
    try {
      return raw ? (JSON.parse(raw) as Tokens) : null;
    } catch {
      return null;
    }
  },
  async set(tokens: Tokens | null) {
    if (Platform.OS === 'web') {
      if (tokens) await AsyncStorage.setItem(KEY, JSON.stringify(tokens));
      else await AsyncStorage.removeItem(KEY);
      return;
    }
    if (tokens) await SecureStore.setItemAsync(KEY, JSON.stringify(tokens));
    else await SecureStore.deleteItemAsync(KEY);
  },
};

type SessionValue = {
  /** Aún leyendo el llavero. */
  loading: boolean;
  user: UserDto | null;
  signIn: (email: string, password: string) => Promise<UserDto>;
  signUp: (dto: RegisterDto) => Promise<UserDto>;
  /** Para respuestas que ya traen una sesión nueva (cambiar la contraseña). */
  applySession: (session: AuthSessionDto) => Promise<void>;
  setUser: (user: UserDto) => void;
  signOut: () => Promise<void>;
  /** Tras borrar la cuenta: olvida la sesión sin llamar a logout. */
  forget: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDto | null>(null);
  const tokens = useRef<Tokens | null>(null);
  const refreshing = useRef<Promise<string | null> | null>(null);

  const save = async (next: Tokens | null) => {
    tokens.current = next;
    await storage.set(next).catch(() => {});
  };

  const applySession = async (session: AuthSessionDto) => {
    await save({ accessToken: session.accessToken, refreshToken: session.refreshToken });
    setUser(session.user);
  };

  const forget = async () => {
    await save(null);
    setUser(null);
  };

  useEffect(() => {
    // Varias peticiones con el token caducado a la vez comparten un solo refresco.
    const doRefresh = () => {
      refreshing.current ??= (async () => {
        const current = tokens.current;
        if (!current) return null;
        try {
          const session = await refreshSession({ refreshToken: current.refreshToken });
          await applySession(session);
          return session.accessToken;
        } catch (e) {
          // Sin conexión no cerramos la sesión; si el servidor la rechaza, sí.
          if (e instanceof ApiError && e.status === 401) await forget();
          return null;
        } finally {
          refreshing.current = null;
        }
      })();
      return refreshing.current;
    };
    setAuthHooks({ getAccessToken: () => tokens.current?.accessToken ?? null, refresh: doRefresh });

    let alive = true;
    (async () => {
      const stored = await storage.get().catch(() => null);
      tokens.current = stored;
      if (stored) {
        try {
          const me = await getMe();
          if (alive) setUser(me);
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) await forget();
        }
      }
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- se configura una vez al montar
  }, []);

  const value: SessionValue = {
    loading,
    user,
    signIn: async (email, password) => {
      const session = await login({ email, password });
      await applySession(session);
      return session.user;
    },
    signUp: async (dto) => {
      const session = await register(dto);
      await applySession(session);
      return session.user;
    },
    applySession,
    setUser,
    signOut: async () => {
      const refreshToken = tokens.current?.refreshToken;
      await forget();
      if (refreshToken) await logout({ refreshToken }).catch(() => {});
    },
    forget,
  };

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession() {
  const ctx = use(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de <SessionProvider>');
  return ctx;
}
