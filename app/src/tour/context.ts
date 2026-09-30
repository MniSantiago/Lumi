import { createContext, use, type RefObject } from 'react';
import type { View } from 'react-native';

import type { TourStep } from '@/tour/definitions';
import type { Rect, TourId, TourState } from '@/tour/engine';

export type ActiveTour = { id: TourId; index: number; steps: TourStep[]; step: TourStep };

export type TourApi = {
  ready: boolean;
  seen: TourState['seen'];
  active: ActiveTour | null;
  /** `auto`: lo lanza una pantalla al abrirse, y solo si aún no se vio. */
  start: (id: TourId, auto?: boolean) => void;
  next: () => void;
  skip: () => void;
  pause: (id: TourId) => void;
  /** Vuelve a enseñar un tour (y lleva a su pestaña). */
  replay: (id: TourId) => void;
  register: (targetId: string, ref: RefObject<View | null>) => () => void;
  measure: (targetId: string) => Promise<Rect | null>;
  /** Un toque dentro del elemento señalado (para los pasos `tap`). */
  tapped: (targetId: string) => void;
};

export const TourContext = createContext<TourApi | null>(null);

export function useTour(): TourApi {
  const ctx = use(TourContext);
  if (!ctx) throw new Error('useTour debe usarse dentro de <TourProvider>');
  return ctx;
}
