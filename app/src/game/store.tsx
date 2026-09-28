import { createContext, use, type ReactNode } from 'react';

import { DESTINATIONS } from '@/game/destinations';
import type { AlbumEntry, DateKey, DayRecord, Destination, ExpeditionResult } from '@/game/types';

/**
 * Estado del ciclo diario: días, expediciones, álbum, inventario y chispas.
 * PROVISIONAL: lo implementa el agente del motor. Mantén los miembros de
 * `GameApi` (puedes añadir más): las pantallas y Ajustes los usan.
 */
export type WeekDay = {
  date: DateKey;
  /** 'L', 'M', 'X', 'J', 'V', 'S', 'D'. */
  label: string;
  /** Luz que le quedó al final del día, 0-4 tramos (0 = descanso o sin datos). */
  lit: 0 | 1 | 2 | 3 | 4;
  restDay: boolean;
  isToday: boolean;
};

export type PendingReturn = {
  date: DateKey;
  destination: Destination;
  result: ExpeditionResult;
};

export type GameApi = {
  ready: boolean;
  today: DateKey;
  todayRecord: DayRecord;
  /** Adónde ha ido Lumi hoy (null si se queda en casa porque ya no le queda luz). */
  currentDestination: Destination | null;
  /** Hora de vuelta de la expedición, 'HH:MM'. */
  returnsAt: string;
  /** Vuelta por ver: la postal nocturna que aún no se ha abierto. */
  pendingReturn: PendingReturn | null;
  album: AlbumEntry[];
  items: string[];
  friends: string[];
  sparks: number;
  streak: number;
  week: WeekDay[];
  /** Guarda la vuelta pendiente en el álbum (y la marca como vista). */
  saveReturnToAlbum: () => void;
  dev: {
    /** Cierra el día ahora como si fuera la noche (genera la vuelta). */
    closeDay: () => void;
    /** Avanza el reloj al día siguiente. */
    nextDay: () => void;
    /** Borra todo el progreso. */
    reset: () => void;
  };
};

const noop = () => {};
const PLACEHOLDER: GameApi = {
  ready: true,
  today: '2026-09-28',
  todayRecord: { date: '2026-09-28', maxThreshold: 0, restDay: false, expedition: null, closed: false },
  currentDestination: DESTINATIONS[0],
  returnsAt: '21:00',
  pendingReturn: null,
  album: [],
  items: [],
  friends: [],
  sparks: 0,
  streak: 0,
  week: [],
  saveReturnToAlbum: noop,
  dev: { closeDay: noop, nextDay: noop, reset: noop },
};

const GameContext = createContext<GameApi>(PLACEHOLDER);

export function GameProvider({ children }: { children: ReactNode }) {
  return <GameContext value={PLACEHOLDER}>{children}</GameContext>;
}

export function useGame(): GameApi {
  return use(GameContext);
}
