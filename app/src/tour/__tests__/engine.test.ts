import { describe, expect, it } from '@jest/globals';

import {
  clampToWindow,
  EMPTY_TOUR_STATE,
  isVisible,
  parseSeen,
  sameRect,
  tourReducer,
  type TourState,
} from '@/tour/engine';

const win = { width: 390, height: 844 };
const run = (state: TourState, ...actions: Parameters<typeof tourReducer>[1][]) =>
  actions.reduce(tourReducer, state);

describe('tourReducer', () => {
  it('arranca en el paso 0', () => {
    expect(run(EMPTY_TOUR_STATE, { type: 'start', id: 'home' }).active).toEqual({ id: 'home', index: 0 });
  });

  it('avanza paso a paso y al terminar marca el tour como visto', () => {
    const s = run(EMPTY_TOUR_STATE, { type: 'start', id: 'home' }, { type: 'next', count: 3 }, { type: 'next', count: 3 });
    expect(s.active).toEqual({ id: 'home', index: 2 });
    const done = run(s, { type: 'next', count: 3 });
    expect(done.active).toBeNull();
    expect(done.seen.home).toBe(true);
  });

  it('saltar cierra y marca como visto', () => {
    const s = run(EMPTY_TOUR_STATE, { type: 'start', id: 'progreso' }, { type: 'skip' });
    expect(s).toEqual({ active: null, seen: { progreso: true } });
  });

  it('el arranque automático respeta lo ya visto y no pisa otro tour abierto', () => {
    const seen = run(EMPTY_TOUR_STATE, { type: 'start', id: 'home' }, { type: 'skip' });
    expect(run(seen, { type: 'start', id: 'home', auto: true }).active).toBeNull();
    // A mano (repetir desde Ajustes) sí arranca.
    expect(run(seen, { type: 'start', id: 'home' }).active?.id).toBe('home');
    const open = run(EMPTY_TOUR_STATE, { type: 'start', id: 'home' });
    expect(run(open, { type: 'start', id: 'coleccion', auto: true }).active?.id).toBe('home');
  });

  it('pausar cierra sin marcar como visto, y solo el tour indicado', () => {
    const open = run(EMPTY_TOUR_STATE, { type: 'start', id: 'home' });
    expect(run(open, { type: 'pause', id: 'coleccion' }).active?.id).toBe('home');
    const paused = run(open, { type: 'pause', id: 'home' });
    expect(paused.active).toBeNull();
    expect(paused.seen.home).toBeUndefined();
  });

  it('olvidar uno o todos', () => {
    const s: TourState = { active: null, seen: { home: true, progreso: true } };
    expect(run(s, { type: 'forget', id: 'home' }).seen).toEqual({ progreso: true });
    expect(run(s, { type: 'forget' }).seen).toEqual({});
  });

  it('cargar desde disco no pisa lo visto mientras tanto', () => {
    const s = run(EMPTY_TOUR_STATE, { type: 'start', id: 'home' }, { type: 'skip' });
    expect(run(s, { type: 'load', seen: { coleccion: true } }).seen).toEqual({ home: true, coleccion: true });
  });

  it('ignora next y skip sin tour abierto', () => {
    expect(run(EMPTY_TOUR_STATE, { type: 'next', count: 2 })).toBe(EMPTY_TOUR_STATE);
    expect(run(EMPTY_TOUR_STATE, { type: 'skip' })).toBe(EMPTY_TOUR_STATE);
  });
});

describe('parseSeen', () => {
  it('lee solo ids conocidos con valor true', () => {
    expect(parseSeen('{"home":true,"ajustes":false,"otro":true}')).toEqual({ home: true });
  });
  it('tolera basura', () => {
    expect(parseSeen(null)).toEqual({});
    expect(parseSeen('no json')).toEqual({});
    expect(parseSeen('42')).toEqual({});
  });
});

describe('geometría del foco', () => {
  it('isVisible descarta medidas vacías o fuera de la ventana', () => {
    expect(isVisible(null, win)).toBe(false);
    expect(isVisible({ x: 0, y: 0, w: 0, h: 10 }, win)).toBe(false);
    expect(isVisible({ x: 0, y: 900, w: 100, h: 50 }, win)).toBe(false);
    expect(isVisible({ x: 20, y: 100, w: 100, h: 50 }, win)).toBe(true);
    expect(isVisible({ x: 20, y: 800, w: 100, h: 200 }, win)).toBe(true);
  });

  it('clampToWindow recorta lo que se sale', () => {
    expect(clampToWindow({ x: -10, y: 20, w: 500, h: 2000 }, win, { top: 50, bottom: 100 })).toEqual({
      x: 0,
      y: 50,
      w: 390,
      h: 694,
    });
  });

  it('sameRect tolera diferencias de menos de un píxel', () => {
    expect(sameRect({ x: 1, y: 1, w: 10, h: 10 }, { x: 1.4, y: 1, w: 10, h: 10.2 })).toBe(true);
    expect(sameRect({ x: 1, y: 1, w: 10, h: 10 }, { x: 3, y: 1, w: 10, h: 10 })).toBe(false);
    expect(sameRect(null, null)).toBe(true);
  });
});
