import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';

import { checkPin, newRecord, UNLOCK_MS, unlocksAfterSetPin, type ParentalRecord } from '@/parental/pin';

/**
 * Control parental: un PIN de 4 dígitos que protege los horarios y las apps ladronas.
 *
 * El registro (PIN, fallos, bloqueo, petición de restablecer) va al llavero (SecureStore); en web,
 * que no tiene llavero, a AsyncStorage (solo desarrollo). En iOS el llavero sobrevive a
 * desinstalar la app, así que reinstalar no quita el PIN.
 *
 * Mientras se lee el llavero se trata como bloqueado: nunca se enseña un instante sin protección.
 */

const KEY = 'lumi.parental.v1';

const storage = {
  async get(): Promise<ParentalRecord | null> {
    const raw = Platform.OS === 'web' ? await AsyncStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
    try {
      const parsed = raw ? (JSON.parse(raw) as Partial<ParentalRecord>) : null;
      return parsed && typeof parsed.pin === 'string' ? { ...newRecord(parsed.pin), ...parsed } : null;
    } catch {
      return null;
    }
  },
  async set(record: ParentalRecord | null) {
    if (Platform.OS === 'web') {
      if (record) await AsyncStorage.setItem(KEY, JSON.stringify(record));
      else await AsyncStorage.removeItem(KEY);
      return;
    }
    if (record) await SecureStore.setItemAsync(KEY, JSON.stringify(record));
    else await SecureStore.deleteItemAsync(KEY);
  },
};

type VerifyResult = { ok: true } | { ok: false; waitSeconds: number; attemptsLeft: number };

type ParentalValue = {
  /** Ya se ha leído el llavero. */
  loaded: boolean;
  hasPin: boolean;
  /** Los ajustes protegidos no se pueden cambiar ahora mismo. */
  locked: boolean;
  /** Cuándo se pidió quitar el PIN sin cuenta, o null. */
  resetRequestedAt: number | null;
  /** Hace la acción ya si no está bloqueado; si lo está, pide el PIN y la hace al acertarlo. */
  protect: (action: () => void) => void;
  /** Comprueba un PIN. Si acierta, desbloquea unos minutos. */
  verify: (pin: string) => Promise<VerifyResult>;
  /** Comprueba un PIN sin desbloquear (para cambiarlo o quitarlo). */
  check: (pin: string) => Promise<VerifyResult>;
  setPin: (pin: string) => Promise<void>;
  /** Quita el PIN (tras comprobarlo, la cuenta o la espera: eso lo decide quien llama). */
  removePin: () => Promise<void>;
  requestReset: () => Promise<void>;
  /** Lo ejecuta la pantalla del PIN al acertar: corre la acción que estaba esperando. */
  takePending: () => (() => void) | null;
  relock: () => void;
};

const ParentalContext = createContext<ParentalValue | null>(null);

export function ParentalProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [record, setRecord] = useState<ParentalRecord | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const recordRef = useRef<ParentalRecord | null>(null);
  const pending = useRef<(() => void) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = async (next: ParentalRecord | null) => {
    recordRef.current = next;
    setRecord(next);
    await storage.set(next).catch(() => {});
  };

  useEffect(() => {
    storage
      .get()
      .then((r) => {
        recordRef.current = r;
        setRecord(r);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const relock = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setUnlocked(false);
  };

  const unlock = () => {
    if (timer.current) clearTimeout(timer.current);
    setUnlocked(true);
    timer.current = setTimeout(relock, UNLOCK_MS);
  };

  // Al salir de la app se vuelve a proteger: el desbloqueo es para un momento, no para la sesión.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'background' && relock());
    return () => {
      sub.remove();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const hasPin = record != null;
  const locked = !loaded || (hasPin && !unlocked);

  const attempt = async (pin: string, thenUnlock: boolean): Promise<VerifyResult> => {
    const current = recordRef.current;
    if (!current) return { ok: true };
    const res = checkPin(current, pin, Date.now());
    // Guardar antes de responder: cerrar la app tras un fallo no reinicia el contador.
    if (res.record !== current) await commit(res.record);
    if (res.ok) {
      if (thenUnlock) unlock();
      return { ok: true };
    }
    return { ok: false, waitSeconds: res.waitSeconds, attemptsLeft: res.attemptsLeft };
  };

  const value: ParentalValue = {
    loaded,
    hasPin,
    locked,
    resetRequestedAt: record?.resetRequestedAt ?? null,
    protect: (action) => {
      if (!locked) {
        action();
        return;
      }
      pending.current = action;
      router.push('/pin?modo=verificar');
    },
    verify: (pin) => attempt(pin, true),
    check: (pin) => attempt(pin, false),
    setPin: async (pin) => {
      const hadPin = recordRef.current != null;
      await commit(newRecord(pin));
      // Crear el PIN deja la protección activa al instante (bloqueado); cambiarlo, tras acertar el
      // actual, mantiene el desbloqueo unos minutos. Ver unlocksAfterSetPin.
      if (unlocksAfterSetPin(hadPin)) unlock();
      else relock();
    },
    removePin: async () => {
      pending.current = null;
      relock();
      await commit(null);
    },
    requestReset: async () => {
      const current = recordRef.current;
      if (current && current.resetRequestedAt == null) await commit({ ...current, resetRequestedAt: Date.now() });
    },
    takePending: () => {
      const action = pending.current;
      pending.current = null;
      return action;
    },
    relock,
  };

  return <ParentalContext value={value}>{children}</ParentalContext>;
}

export function useParental() {
  const ctx = use(ParentalContext);
  if (!ctx) throw new Error('useParental debe usarse dentro de <ParentalProvider>');
  return ctx;
}
