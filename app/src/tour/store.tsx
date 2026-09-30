import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode, type RefObject } from 'react';
import type { View } from 'react-native';

import { useLumi } from '@/lumi/store';
import { TourContext, useTour, type ActiveTour, type TourApi } from '@/tour/context';
import { TOUR_ROUTE, tourSteps } from '@/tour/definitions';
import { EMPTY_TOUR_STATE, parseSeen, tourReducer, type Rect, type TourId } from '@/tour/engine';
import { TourOverlay } from '@/tour/overlay';

/**
 * Tutoriales guiados: qué tours se han visto (se guarda en el dispositivo), cuál
 * está abierto, y dónde están en pantalla los elementos que señalan (`<TourTarget>`).
 * Las reglas están en `tour/engine.ts` y los textos en `tour/definitions.ts`.
 */
const STORAGE_KEY = 'lumi.tours.v1';
/** Cuánto esperamos, tras abrir una pestaña, para que termine la transición antes de arrancar el tour. */
const AUTO_START_DELAY = 900;
/** Tras tocar el elemento de un paso `tap`, margen para que se vea su efecto antes de pasar al siguiente. */
const TAP_ADVANCE_DELAY = 650;

export function TourProvider({ children }: { children: ReactNode }) {
  const { settings } = useLumi();
  const [state, dispatch] = useReducer(tourReducer, EMPTY_TOUR_STATE);
  const [ready, setReady] = useState(false);
  const targets = useRef(new Map<string, RefObject<View | null>>());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => dispatch({ type: 'load', seen: parseSeen(raw) }))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.seen)).catch(() => {});
  }, [ready, state.seen]);

  const active = useMemo<ActiveTour | null>(() => {
    if (!state.active) return null;
    const steps = tourSteps(state.active.id, settings.lumiName);
    const step = steps[state.active.index];
    return step ? { id: state.active.id, index: state.active.index, steps, step } : null;
  }, [state.active, settings.lumiName]);

  // Los callbacks leen siempre el último estado sin cambiar de identidad.
  const latest = useRef({ ready, active, onboarded: settings.onboarded });
  useEffect(() => {
    latest.current = { ready, active, onboarded: settings.onboarded };
  });
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (tapTimer.current && clearTimeout(tapTimer.current)), []);

  const start = useCallback((id: TourId, auto = false) => {
    if (auto && !(latest.current.ready && latest.current.onboarded)) return;
    dispatch({ type: 'start', id, auto });
  }, []);
  const next = useCallback(() => {
    const count = latest.current.active?.steps.length;
    if (count) dispatch({ type: 'next', count });
  }, []);
  const skip = useCallback(() => dispatch({ type: 'skip' }), []);
  const pause = useCallback((id: TourId) => dispatch({ type: 'pause', id }), []);

  const replay = useCallback((id: TourId) => {
    dispatch({ type: 'pause', id });
    dispatch({ type: 'forget', id });
    router.navigate(TOUR_ROUTE[id]);
    // Si ya estamos en esa pestaña no hay cambio de foco que lo arranque: lo hacemos aquí
    // (si el foco también lo arranca, el segundo intento no hace nada).
    setTimeout(() => dispatch({ type: 'start', id }), AUTO_START_DELAY);
  }, []);

  const register = useCallback((targetId: string, ref: RefObject<View | null>) => {
    targets.current.set(targetId, ref);
    return () => {
      if (targets.current.get(targetId) === ref) targets.current.delete(targetId);
    };
  }, []);

  const measure = useCallback(
    (targetId: string) =>
      new Promise<Rect | null>((resolve) => {
        const node = targets.current.get(targetId)?.current;
        if (!node) return resolve(null);
        node.measureInWindow((x, y, w, h) => resolve(Number.isFinite(x) && Number.isFinite(y) ? { x, y, w, h } : null));
      }),
    [],
  );

  const tapped = useCallback(
    (targetId: string) => {
      const step = latest.current.active?.step;
      if (!step || step.action !== 'tap' || step.target !== targetId || tapTimer.current) return;
      tapTimer.current = setTimeout(() => {
        tapTimer.current = null;
        next();
      }, TAP_ADVANCE_DELAY);
    },
    [next],
  );

  const api = useMemo<TourApi>(
    () => ({ ready, seen: state.seen, active, start, next, skip, pause, replay, register, measure, tapped }),
    [ready, state.seen, active, start, next, skip, pause, replay, register, measure, tapped],
  );

  return (
    <TourContext value={api}>
      {children}
      <TourOverlay />
    </TourContext>
  );
}

/**
 * Lanza el tour de esta pestaña la primera vez que se abre. Si se cambia de pestaña
 * a medias, se pausa (sin darlo por visto) y vuelve a salir al regresar.
 */
export function useTourOnFocus(id: TourId) {
  const { ready, start, pause } = useTour();
  useFocusEffect(
    useCallback(() => {
      if (!ready) return;
      const timer = setTimeout(() => start(id, true), AUTO_START_DELAY);
      return () => {
        clearTimeout(timer);
        pause(id);
      };
    }, [id, ready, start, pause]),
  );
}
