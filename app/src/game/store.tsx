import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import * as clock from '@/game/clock';
import { destinationById } from '@/game/destinations';
import {
  brightDays as countBrightDays,
  closeDay,
  EMPTY_STATE,
  emptyDay,
  evolutionFor,
  markRestlessNight as markRestless,
  morningAfter,
  expeditionProgress,
  restDaysInWeek,
  RETURNS_AT,
  saveToAlbum,
  streakFor,
  syncToday,
  visitedIds,
  weekFor,
  type GameState,
  type StoredDay,
} from '@/game/engine';
import type { AlbumEntry, DateKey, DayRecord, Destination, ExpeditionResult } from '@/game/types';
import { useLumi } from '@/lumi/store';
import { cancelNightlyReturn, scheduleNightlyReturn } from '@/notifications';
import { screenTime } from '@/screen-time';
import { clockTime } from '@/i18n/dates';

/**
 * Estado del ciclo diario: días, expediciones, álbum, inventario y chispas.
 * Las reglas están en `game/engine.ts`; aquí se guardan, se sincronizan con el
 * reloj (`game/clock.ts`) y el umbral de Screen Time, y se programan los avisos.
 */
export type WeekDay = {
  date: DateKey;
  /** 'L', 'M', 'X', 'J', 'V', 'S', 'D'. */
  label: string;
  /** Luz que le quedó al final del día, 0-4 tramos (0 = descanso o sin datos). */
  lit: 0 | 1 | 2 | 3 | 4;
  restDay: boolean;
  isToday: boolean;
  /** Aún no ha llegado. */
  future: boolean;
};

export type PendingReturn = {
  date: DateKey;
  destination: Destination;
  result: ExpeditionResult;
  /** Objetos que aún no tenía. */
  newItemIds: string[];
  /** El amigo del resultado es nuevo en la colección. */
  newFriend: boolean;
};

export type GameApi = {
  ready: boolean;
  today: DateKey;
  todayRecord: DayRecord;
  /** Destino elegido para hoy, salga o no. */
  todayDestination: Destination | null;
  /** Adónde ha ido Lumi hoy (null si se queda en casa porque ya no le queda luz). */
  currentDestination: Destination | null;
  /** Hora de vuelta de la expedición, para enseñar ('21:00', '9:00 PM'). */
  returnsAt: string;
  /** Vuelta por ver: la postal nocturna que aún no se ha abierto. */
  pendingReturn: PendingReturn | null;
  album: AlbumEntry[];
  items: string[];
  friends: string[];
  sparks: number;
  streak: number;
  week: WeekDay[];
  /** Días con expedición acumulados. */
  brightDays: number;
  /** Ids de destinos ya visitados. */
  visited: string[];
  /** Todos los días registrados, del más antiguo al más reciente. */
  history: DayRecord[];
  /** Días de descanso usados esta semana (lunes a domingo). */
  restDaysThisWeek: DateKey[];
  /** Etapa de evolución (0-3) y días brillantes dentro de ella. */
  evolution: { stage: number; inStage: number; perStage: number; maxed: boolean };
  /** Parte del día recorrida hacia la vuelta (0-1), desde la hora de despertar. */
  expeditionProgress: number;
  /** Guarda la vuelta pendiente en el álbum (y la marca como vista). */
  saveReturnToAlbum: () => void;
  /** Se pidió «5 min más» en el escudo de noche: la mañana siguiente no hay bonus de dormir bien. */
  markRestlessNight: () => void;
  /** Estado guardado tal cual, para la copia de la cuenta (`account/sync.tsx`). */
  snapshot: GameState;
  /** Sustituye el progreso por uno traído de la cuenta. */
  restore: (state: GameState) => void;
  dev: {
    /** Cierra el día ahora como si fuera la noche (genera la vuelta). */
    closeDay: () => void;
    /** Avanza el reloj al día siguiente. */
    nextDay: () => void;
    /** Borra todo el progreso. */
    reset: () => void;
  };
};

const STORAGE_KEY = 'lumi.game.v1';
const TICK_MS = 60_000;

const GameContext = createContext<GameApi | null>(null);

/** Valida un estado guardado (en el dispositivo o en la cuenta); si no es de esta versión, vacío. */
export function toGameState(value: unknown): GameState {
  const parsed = value as Partial<GameState> | null;
  if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) return EMPTY_STATE;
  return { ...EMPTY_STATE, ...parsed } as GameState;
}

function parseState(raw: string | null): GameState {
  if (!raw) return EMPTY_STATE;
  try {
    return toGameState(JSON.parse(raw));
  } catch {
    return EMPTY_STATE;
  }
}

/** Mañana en la que acaba la noche de `at`: antes de la hora de despertar, ese mismo día; si no, el siguiente. */
function morningAfter(at: Date, nightEnd: string): DateKey {
  const key = clock.dateKey(at);
  return at.getHours() * 60 + at.getMinutes() < toMinutes(nightEnd) ? key : clock.addDays(key, 1);
}

export function GameProvider({ children }: { children: ReactNode }) {
  const { ready: lumiReady, threshold, settings } = useLumi();
  const [state, setState] = useState<GameState>(EMPTY_STATE);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(() => clock.now());
  const today = clock.dateKey(now);

  const ctx = useMemo(
    () => ({ isPlus: settings.isPlus, restDays: settings.restDays }),
    [settings.isPlus, settings.restDays],
  );
  const ctxRef = useRef(ctx);
  const todayRef = useRef(today);
  useEffect(() => {
    ctxRef.current = ctx;
    todayRef.current = today;
  });

  // Carga: primero el reloj (por el desfase de desarrollo), luego el juego.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await clock.loadClock();
      const raw = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
      if (cancelled) return;
      setState(parseState(raw));
      setNow(clock.now());
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  // El reloj avanza cada minuto y al volver a la app. Al cambiar de día, el
  // umbral del mock vuelve a 0 (cada día empieza de cero).
  const refreshNow = useCallback(() => {
    const n = clock.now();
    if (clock.dateKey(n) !== todayRef.current) screenTime.simulate?.(0);
    setNow(n);
  }, []);
  useEffect(() => {
    const id = setInterval(refreshNow, TICK_MS);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refreshNow());
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [refreshNow]);

  // Poner el día al corriente (cierres, días sin abrir, destino, 21:00) y apuntar el umbral.
  // (Se ajusta durante el render: las funciones son puras y devuelven el mismo objeto si no cambia nada.)
  // El juego empieza al terminar el onboarding.
  const active = loaded && lumiReady && settings.onboarded;
  const synced = active ? syncToday(state, today, ctx, now, threshold) : state;
  if (synced !== state) setState(synced);

  // En iOS, «5 min más» lo gestiona la extensión del escudo: se lee aquí (cada minuto y al volver a la app).
  const nightSnooze = active ? screenTime.lastNightSnooze?.() : null;
  const restless = nightSnooze ? markRestless(synced, morningAfter(nightSnooze, settings.nightEnd)) : synced;
  if (restless !== synced) setState(restless);

  const day: StoredDay = state.days[today] ?? emptyDay(today);
  const ready = active && !!state.days[today];
  const todayDestination = day.destinationId ? (destinationById(day.destinationId) ?? null) : null;
  const currentDestination = todayDestination && day.maxThreshold < 50 ? todayDestination : null;

  // Aviso de la vuelta: solo cuando cambian sus datos, no en cada render.
  const exploringId = currentDestination?.id ?? null;
  const { nightlyPostcard, lumiName } = settings;
  useEffect(() => {
    if (!ready) return;
    const at = clock.atTime(today, RETURNS_AT);
    const beforeReturn = clock.now().getTime() < at.getTime();
    const destination = exploringId ? destinationById(exploringId) : undefined;
    if (!nightlyPostcard || !destination) {
      cancelNightlyReturn().catch(() => {});
    } else if (day.closed) {
      // Cerrado antes de hora (desarrollo): ya ha vuelto, no hace falta avisar.
      if (beforeReturn) cancelNightlyReturn().catch(() => {});
    } else if (beforeReturn) {
      scheduleNightlyReturn({ lumiName, destination, at: clock.toRealDate(at) }).catch(() => {});
    }
  }, [ready, today, exploringId, day.closed, nightlyPostcard, lumiName]);

  const saveReturnToAlbum = useCallback(() => {
    setState((s) =>
      s.pending
        ? { ...s, album: saveToAlbum(s.album, s.pending.destinationId, s.pending.date, Date.now()), pending: null }
        : s,
    );
  }, []);

  const nightEnd = settings.nightEnd;
  const markRestlessNight = useCallback(() => {
    setState((s) => markRestless(s, morningAfter(clock.now(), nightEnd)));
  }, [nightEnd]);


  const restore = useCallback((next: GameState) => setState(toGameState(next)), []);

  const dev = useMemo(
    () => ({
      closeDay: () => setState((s) => closeDay(s, todayRef.current, ctxRef.current, Date.now())),
      nextDay: () => {
        clock.setDayOffset(clock.getDayOffset() + 1);
        screenTime.simulate?.(0);
        setNow(clock.now());
      },
      reset: () => {
        clock.setDayOffset(0);
        screenTime.simulate?.(0);
        setState(EMPTY_STATE);
        setNow(clock.now());
      },
    }),
    [],
  );

  const api = useMemo<GameApi>(() => {
    const pendingDestination = state.pending ? destinationById(state.pending.destinationId) : undefined;
    const bright = countBrightDays(state);
    return {
      ready,
      today,
      todayRecord: day,
      todayDestination,
      currentDestination,
      returnsAt: clockTime(RETURNS_AT),
      pendingReturn:
        state.pending && pendingDestination
          ? {
              date: state.pending.date,
              destination: pendingDestination,
              result: state.pending.result,
              newItemIds: state.pending.newItemIds,
              newFriend: state.pending.newFriend,
            }
          : null,
      album: state.album,
      items: state.items,
      friends: state.friends,
      sparks: state.sparks,
      streak: streakFor(state, today),
      week: weekFor(state, today),
      brightDays: bright,
      visited: visitedIds(state),
      history: Object.keys(state.days)
        .sort()
        .map((k) => state.days[k]),
      restDaysThisWeek: restDaysInWeek(state, today),
      evolution: evolutionFor(bright),
      expeditionProgress: expeditionProgress(today, settings.nightEnd, now),
      saveReturnToAlbum,
      markRestlessNight,
      snapshot: state,
      restore,
      dev,
    };
  }, [state, day, ready, today, todayDestination, currentDestination, now, settings.nightEnd, saveReturnToAlbum, markRestlessNight, restore, dev]);

  return <GameContext value={api}>{children}</GameContext>;
}

export function useGame(): GameApi {
  const ctx = use(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de <GameProvider>');
  return ctx;
}
