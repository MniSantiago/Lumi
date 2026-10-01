import { useSyncExternalStore } from 'react';

/**
 * Qué le falta a la app para poder enseñarse (fuentes y ajustes guardados leídos).
 * La splash animada espera a esto para despedirse: no retrasa nada, solo no se
 * quita antes de tiempo. Es un módulo, no un contexto, porque la splash vive
 * por encima de todos los providers.
 */
type Part = 'fonts' | 'store';

const ready: Record<Part, boolean> = { fonts: false, store: false };
const listeners = new Set<() => void>();
let snapshot = false;

export function markReady(part: Part) {
  if (ready[part]) return;
  ready[part] = true;
  snapshot = ready.fonts && ready.store;
  listeners.forEach((l) => l());
}

export function useAppReady(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => void listeners.delete(l);
    },
    () => snapshot,
    () => snapshot,
  );
}

/** Solo para los tests. */
export function resetReady() {
  ready.fonts = false;
  ready.store = false;
  snapshot = false;
  listeners.forEach((l) => l());
}
