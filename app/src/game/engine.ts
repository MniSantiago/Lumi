/**
 * Motor del ciclo diario (BRIEF.md §4): funciones puras sobre el estado del
 * juego. El proveedor (`game/store.tsx`) las llama con la fecha del reloj.
 *
 * Reglas sin culpa:
 * - Lumi sale de expedición si el umbral máximo del día queda por debajo del 50 %.
 * - El día se cierra a las 21:00 (o al abrir la app otro día): si salió, vuelve
 *   con postal, objetos y chispas. Nunca se pierde nada.
 * - Noche tranquila: si la noche anterior no se usó «5 min más» en el escudo de
 *   noche, la expedición trae `NIGHT_BONUS` chispas de más.
 * - Rachas con perdón: un día sin expedición (se quedó en casa o no se abrió la
 *   app) se cuenta como descanso si los días de descanso están activados y
 *   quedan en la semana (máximo 2, de lunes a domingo).
 */
import { addDays, atTime, dateKey, daysBetween, mondayOf } from '@/game/clock';
import { destinationById } from '@/game/destinations';
import { pickDestination, rollExpedition, seedFromDate } from '@/game/rewards';
import type { AlbumEntry, DateKey, DayRecord, ExpeditionResult } from '@/game/types';
import type { Threshold } from '@/lumi/states';
import { toMinutes } from '@/lumi/time';

export const RETURNS_AT = '21:00';
export const MAX_REST_DAYS_PER_WEEK = 2;
/** Chispas extra por dormir bien (sin «5 min más» en el horario de noche). */
export const NIGHT_BONUS = 5;
/** Días brillantes por etapa de evolución. */
export const BRIGHT_DAYS_PER_STAGE = 7;
export const EVOLUTION_STAGES = 4;
/** Hasta cuántos días atrás se rellenan los días sin abrir la app. */
const MAX_BACKFILL_DAYS = 14;

export type StoredDay = DayRecord & {
  /** Destino elegido para ese día (null en días sin abrir la app). */
  destinationId: string | null;
  /** No se abrió la app ese día. */
  missed: boolean;
};

export type StoredPending = {
  date: DateKey;
  destinationId: string;
  result: ExpeditionResult;
  /** Objetos que aún no tenía (el resto son repetidos). */
  newItemIds: string[];
  newFriend: boolean;
};

export type GameState = {
  version: 1;
  days: Record<DateKey, StoredDay>;
  album: AlbumEntry[];
  items: string[];
  friends: string[];
  sparks: number;
  pending: StoredPending | null;
  /** Mañanas (fecha del día que empieza) tras una noche en la que se pidió «5 min más». */
  restlessNights: DateKey[];
};

export type EngineContext = { isPlus: boolean; restDays: boolean };

export const EMPTY_STATE: GameState = {
  version: 1,
  days: {},
  album: [],
  items: [],
  friends: [],
  sparks: 0,
  pending: null,
  restlessNights: [],
};

const uniq = (list: string[]) => [...new Set(list)];

export function emptyDay(date: DateKey): StoredDay {
  return { date, maxThreshold: 0, restDay: false, expedition: null, closed: false, destinationId: null, missed: false };
}

/** Destinos ya visitados: con postal en el álbum, vuelta pendiente o expedición registrada. */
export function visitedIds(state: GameState): string[] {
  return uniq([
    ...state.album.map((a) => a.destinationId),
    ...Object.values(state.days).flatMap((d) => (d.expedition ? [d.expedition.destinationId] : [])),
    ...(state.pending ? [state.pending.destinationId] : []),
  ]);
}

/** Días brillantes acumulados = días con expedición. */
export function brightDays(state: GameState): number {
  return Object.values(state.days).filter((d) => d.expedition).length;
}

export function restDaysInWeek(state: GameState, date: DateKey): DateKey[] {
  const monday = mondayOf(date);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i)).filter((d) => state.days[d]?.restDay);
}

function canRest(state: GameState, date: DateKey, ctx: EngineContext): boolean {
  return ctx.restDays && restDaysInWeek(state, date).filter((d) => d !== date).length < MAX_REST_DAYS_PER_WEEK;
}

export function saveToAlbum(album: AlbumEntry[], destinationId: string, date: DateKey, savedAt: number): AlbumEntry[] {
  return [...album.filter((a) => a.destinationId !== destinationId), { destinationId, date, savedAt }];
}

/** Cierra un día: si Lumi salió, vuelve con lo que ha encontrado. */
export function closeDay(state: GameState, date: DateKey, ctx: EngineContext, nowMs: number): GameState {
  const day = state.days[date];
  if (!day || day.closed) return state;

  const destination = day.destinationId ? destinationById(day.destinationId) : undefined;
  if (destination && day.maxThreshold < 50) {
    const rolled = rollExpedition(destination, {
      owned: { items: state.items, friends: state.friends },
      threshold: day.maxThreshold,
      seed: seedFromDate(date),
      // La primera visita cuenta la historia que presenta el lugar.
      timesVisited: Object.values(state.days).filter(
        (d) => d.date !== date && d.expedition?.destinationId === destination.id,
      ).length,
    });
    // Solo cuenta si la app ya estaba la noche anterior (el día de antes existe).
    const nightBonus = state.days[addDays(date, -1)] && !state.restlessNights.includes(date) ? NIGHT_BONUS : 0;
    const result: ExpeditionResult = nightBonus ? { ...rolled, sparks: rolled.sparks + nightBonus, nightBonus } : rolled;
    const pending: StoredPending = {
      date,
      destinationId: destination.id,
      result,
      newItemIds: result.itemIds.filter((id) => !state.items.includes(id)),
      newFriend: !!result.friendId && !state.friends.includes(result.friendId),
    };
    // Si había otra vuelta sin ver, se guarda sola en el álbum: nada se pierde.
    const album = state.pending
      ? saveToAlbum(state.album, state.pending.destinationId, state.pending.date, nowMs)
      : state.album;
    return {
      ...state,
      album,
      items: uniq([...state.items, ...result.itemIds]),
      friends: uniq([...state.friends, ...(result.friendId ? [result.friendId] : [])]),
      sparks: state.sparks + result.sparks,
      pending,
      days: { ...state.days, [date]: { ...day, expedition: result, closed: true } },
    };
  }

  return {
    ...state,
    days: { ...state.days, [date]: { ...day, restDay: canRest(state, date, ctx), closed: true } },
  };
}

/**
 * Pone el estado al día: cierra los días pasados sin cerrar, rellena los días
 * en que no se abrió la app, elige el destino de hoy, apunta el umbral y, si
 * ya son las 21:00, cierra hoy. Devuelve el mismo objeto si no cambia nada.
 */
export function syncToday(
  state: GameState,
  today: DateKey,
  ctx: EngineContext,
  now: Date,
  threshold: Threshold,
): GameState {
  let next = state;
  const nowMs = now.getTime();

  const past = Object.keys(next.days)
    .filter((d) => d < today)
    .sort();
  if (past.length) {
    const firstOpen = past.find((d) => !next.days[d].closed);
    const start = firstOpen ?? addDays(past[past.length - 1], 1);
    for (let d = start; d < today; d = addDays(d, 1)) {
      const record = next.days[d];
      if (record) {
        next = closeDay(next, d, ctx, nowMs);
      } else if (daysBetween(d, today) <= MAX_BACKFILL_DAYS) {
        const missed: StoredDay = { ...emptyDay(d), missed: true, closed: true, restDay: canRest(next, d, ctx) };
        next = { ...next, days: { ...next.days, [d]: missed } };
      }
    }
  }

  if (!next.days[today]) {
    const destination = pickDestination({
      visited: visitedIds(next),
      brightDays: brightDays(next),
      isPlus: ctx.isPlus,
      seed: seedFromDate(today),
    });
    next = { ...next, days: { ...next.days, [today]: { ...emptyDay(today), destinationId: destination?.id ?? null } } };
  }

  // El umbral se apunta antes de cerrar, por si la app se abre por primera vez pasadas las 21:00.
  next = recordThreshold(next, today, threshold);
  if (nowMs >= atTime(today, RETURNS_AT).getTime()) next = closeDay(next, today, ctx, nowMs);
  return next;
}

/** Sube el umbral máximo de hoy (solo mientras el día sigue abierto). */
export function recordThreshold(state: GameState, today: DateKey, threshold: Threshold): GameState {
  const day = state.days[today];
  if (!day || day.closed || threshold <= day.maxThreshold) return state;
  return { ...state, days: { ...state.days, [today]: { ...day, maxThreshold: threshold } } };
}

/** Días seguidos con expedición; los descansos no la rompen, y hoy no cuenta hasta que se cierra. */
export function streakFor(state: GameState, today: DateKey): number {
  let count = 0;
  let d = today;
  const todayRecord = state.days[today];
  if (!todayRecord?.expedition && !todayRecord?.closed) d = addDays(today, -1);
  for (let i = 0; i < 1000; i++, d = addDays(d, -1)) {
    const r = state.days[d];
    if (!r) break;
    if (r.expedition) count++;
    else if (!r.restDay) break;
  }
  return count;
}

/** Tramos de luz que le quedaron a Lumi (1-4 en un día normal; 0 = descanso o sin datos). */
export function litFor(day: StoredDay | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!day || day.restDay || day.missed) return 0;
  return Math.max(1, Math.min(4, 4 - Math.floor(day.maxThreshold / 25))) as 1 | 2 | 3 | 4;
}

const WEEK_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function weekFor(state: GameState, today: DateKey) {
  const monday = mondayOf(today);
  return WEEK_LABELS.map((label, i) => {
    const date = addDays(monday, i);
    const day = state.days[date];
    const future = date > today;
    return {
      date,
      label,
      lit: future ? 0 : litFor(day),
      restDay: !!day?.restDay,
      isToday: date === today,
      future,
    } as const;
  });
}

/** Evolución: una etapa nueva cada 7 días brillantes (Chispa → Farolito → Estrella → Aurora). */
export function evolutionFor(bright: number) {
  const stage = Math.min(EVOLUTION_STAGES - 1, Math.floor(bright / BRIGHT_DAYS_PER_STAGE));
  const maxed = stage === EVOLUTION_STAGES - 1;
  const inStage = maxed ? BRIGHT_DAYS_PER_STAGE : bright - stage * BRIGHT_DAYS_PER_STAGE;
  return { stage, inStage, perStage: BRIGHT_DAYS_PER_STAGE, maxed };
}

/** Parte del día recorrida desde que Lumi se despierta hasta que vuelve (0-1). */
export function expeditionProgress(today: DateKey, wakeAt: string, now: Date): number {
  const start = atTime(today, wakeAt).getTime();
  const end = atTime(today, RETURNS_AT).getTime();
  if (end <= start) return 0;
  return Math.min(1, Math.max(0, (now.getTime() - start) / (end - start)));
}

/** Apunta que la noche que acaba en `morning` fue movida (se pidió «5 min más»). Guarda las últimas 14. */
export function markRestlessNight(state: GameState, morning: DateKey): GameState {
  if (state.restlessNights.includes(morning)) return state;
  return { ...state, restlessNights: [...state.restlessNights, morning].sort().slice(-14) };
}

/** Mañana en la que acaba la noche de `at`: antes de la hora de despertar, ese mismo día; si no, el siguiente. */
export function morningAfter(at: Date, nightEnd: string): DateKey {
  const key = dateKey(at);
  return at.getHours() * 60 + at.getMinutes() < toMinutes(nightEnd) ? key : addDays(key, 1);
}
