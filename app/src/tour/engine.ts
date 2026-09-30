/**
 * Reglas de los tutoriales guiados, sin UI: qué tours hay, cuáles se han visto y
 * en qué paso va el que está abierto. El estado vive en `tour/store.tsx`; los
 * textos de cada paso, en `tour/definitions.ts`.
 */

export const TOUR_IDS = ['home', 'expediciones', 'coleccion', 'progreso', 'ajustes'] as const;
export type TourId = (typeof TOUR_IDS)[number];

export type TourState = {
  /** Tours ya terminados o saltados: no vuelven a salir solos. */
  seen: Partial<Record<TourId, true>>;
  /** El tour que se está enseñando ahora (solo uno a la vez) y su paso. */
  active: { id: TourId; index: number } | null;
};

export const EMPTY_TOUR_STATE: TourState = { seen: {}, active: null };

export type TourAction =
  /** `auto`: lo lanza la pantalla al abrirse; no arranca si ya se vio o hay otro abierto. */
  | { type: 'start'; id: TourId; auto?: boolean }
  /** Siguiente paso; en el último, el tour termina y se marca como visto. */
  | { type: 'next'; count: number }
  /** «Saltar»: se cierra y se marca como visto. */
  | { type: 'skip' }
  /** Se cierra sin marcarlo como visto (por ejemplo, al cambiar de pestaña a medias). */
  | { type: 'pause'; id: TourId }
  /** Olvida que se vio, para repetirlo. Sin `id`, todos. */
  | { type: 'forget'; id?: TourId }
  | { type: 'load'; seen: TourState['seen'] };

export function tourReducer(state: TourState, action: TourAction): TourState {
  switch (action.type) {
    case 'load':
      // Lo leído del disco no pisa lo que ya se haya visto mientras tanto.
      return { ...state, seen: { ...action.seen, ...state.seen } };
    case 'start':
      if (state.active) return state;
      if (action.auto && state.seen[action.id]) return state;
      return { ...state, active: { id: action.id, index: 0 } };
    case 'next': {
      if (!state.active) return state;
      const index = state.active.index + 1;
      if (index < action.count) return { ...state, active: { ...state.active, index } };
      return { seen: { ...state.seen, [state.active.id]: true }, active: null };
    }
    case 'skip':
      if (!state.active) return state;
      return { seen: { ...state.seen, [state.active.id]: true }, active: null };
    case 'pause':
      return state.active?.id === action.id ? { ...state, active: null } : state;
    case 'forget': {
      if (!action.id) return { ...state, seen: {} };
      const { [action.id]: _removed, ...seen } = state.seen;
      return { ...state, seen };
    }
  }
}

/** Solo se guardan ids conocidos: un valor raro en disco no rompe nada. */
export function parseSeen(raw: string | null): TourState['seen'] {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const seen: TourState['seen'] = {};
    for (const id of TOUR_IDS) if ((parsed as Record<string, unknown>)[id] === true) seen[id] = true;
    return seen;
  } catch {
    return {};
  }
}

export type Rect = { x: number; y: number; w: number; h: number };

/** El elemento está midiendo algo y se ve (al menos en parte) dentro de la ventana. */
export function isVisible(rect: Rect | null, win: { width: number; height: number }): rect is Rect {
  if (!rect || rect.w < 1 || rect.h < 1) return false;
  return rect.x < win.width && rect.x + rect.w > 0 && rect.y < win.height && rect.y + rect.h > 0;
}

/** Recorta el foco a la ventana, con un margen, para que un elemento muy alto no se salga. */
export function clampToWindow(rect: Rect, win: { width: number; height: number }, inset: { top: number; bottom: number }): Rect {
  const top = Math.max(rect.y, inset.top);
  const bottom = Math.min(rect.y + rect.h, win.height - inset.bottom);
  const left = Math.max(rect.x, 0);
  const right = Math.min(rect.x + rect.w, win.width);
  return { x: left, y: top, w: Math.max(right - left, 1), h: Math.max(bottom - top, 1) };
}

export const sameRect = (a: Rect | null, b: Rect | null) =>
  a === b || (!!a && !!b && Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1 && Math.abs(a.w - b.w) < 1 && Math.abs(a.h - b.h) < 1);
