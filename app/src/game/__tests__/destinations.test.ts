import { describe, expect, it } from '@jest/globals';

import { chapterDestinations, closesChapter, DESTINATIONS, destinationById } from '@/game/destinations';

const CHAPTERS = [1, 2, 3, 4];
const ids = (list: { id: string }[]) => list.map((d) => d.id);

describe('capítulos', () => {
  it('cada capítulo tiene una zona Plus y cuatro gratuitas', () => {
    for (const chapter of CHAPTERS.slice(1)) {
      const all = chapterDestinations(chapter, true);
      expect(all).toHaveLength(5);
      expect(all.filter((d) => d.plus)).toHaveLength(1);
    }
    // El capítulo 1 es entero gratuito: es por donde se empieza.
    expect(chapterDestinations(1, true).filter((d) => d.plus)).toHaveLength(0);
  });

  it('sin Plus, las zonas Plus no se cuentan', () => {
    expect(chapterDestinations(2, false).every((d) => !d.plus)).toBe(true);
    expect(chapterDestinations(2, false)).toHaveLength(4);
  });

  it('los 20 lugares están repartidos en los cuatro capítulos', () => {
    expect(DESTINATIONS).toHaveLength(20);
    expect(CHAPTERS.flatMap((c) => chapterDestinations(c, true))).toHaveLength(20);
  });
});

describe('closesChapter', () => {
  const chapterOne = ids(chapterDestinations(1, false));
  const last = destinationById(chapterOne[chapterOne.length - 1])!;

  it('cierra cuando era el último que quedaba por conocer', () => {
    expect(closesChapter(last, chapterOne.slice(0, -1), false)).toBe(true);
  });

  it('no cierra si aún falta alguno', () => {
    expect(closesChapter(last, chapterOne.slice(0, -2), false)).toBe(false);
  });

  it('no vuelve a celebrarse en una revisita', () => {
    expect(closesChapter(last, chapterOne, false)).toBe(false);
  });

  it('sin Plus se cierra sin la zona Plus; con Plus hace falta visitarla', () => {
    const free = chapterDestinations(2, false);
    const visitedBefore = ids(free.slice(0, -1));
    const lastFree = free[free.length - 1];
    expect(closesChapter(lastFree, visitedBefore, false)).toBe(true);
    expect(closesChapter(lastFree, visitedBefore, true)).toBe(false);
  });

  it('lo visitado de otros capítulos no cierra este', () => {
    expect(closesChapter(last, ids(chapterDestinations(2, true)), false)).toBe(false);
  });
});
