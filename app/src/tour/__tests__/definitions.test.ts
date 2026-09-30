import { describe, expect, it } from '@jest/globals';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { TOUR_ROUTE, tourSteps, tourTitle } from '@/tour/definitions';
import { TOUR_IDS } from '@/tour/engine';

const SRC = join(__dirname, '..', '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path);
    return /\.tsx$/.test(name) ? [path] : [];
  });
}

/** Ids de todos los `<TourTarget id="…">` que hay en las pantallas. */
const declared = new Set(
  sourceFiles(SRC).flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/<TourTarget id="([^"]+)"/g)].map((m) => m[1]!)),
);

describe('definiciones de los tours', () => {
  it.each(TOUR_IDS)('%s: tiene pasos, título y ruta', (id) => {
    expect(tourSteps(id, 'Lumi').length).toBeGreaterThan(1);
    expect(tourTitle(id)).toBeTruthy();
    expect(TOUR_ROUTE[id]).toMatch(/^\//);
  });

  it.each(TOUR_IDS)('%s: cada paso con foco apunta a un <TourTarget> que existe', (id) => {
    for (const step of tourSteps(id, 'Lumi')) {
      if (step.target) expect(declared).toContain(step.target);
    }
  });

  it.each(TOUR_IDS)('%s: termina en un paso sin foco y todo paso tiene texto', (id) => {
    const steps = tourSteps(id, 'Lumi');
    expect(steps[steps.length - 1]!.target).toBeNull();
    for (const step of steps) {
      expect(step.title.trim()).not.toBe('');
      expect(step.body.trim()).not.toBe('');
    }
  });

  it('un paso `tap` siempre señala algo', () => {
    for (const id of TOUR_IDS) {
      for (const step of tourSteps(id, 'Lumi')) {
        if (step.action === 'tap') expect(step.target).not.toBeNull();
      }
    }
  });

  it('usa el nombre de la lucecita en la presentación', () => {
    expect(tourSteps('home', 'Nube')[0]!.title).toContain('Nube');
  });
});
