import { describe, expect, it } from '@jest/globals';

import en from '@/game/content/en';
import es from '@/game/content/es';
import fr from '@/game/content/fr';
import hi from '@/game/content/hi';
import zh from '@/game/content/zh';
import { DESTINATIONS } from '@/game/destinations';
import { FRIEND_CATALOG, ITEM_CATALOG } from '@/game/catalog';
import { detectLang, lang } from '@/i18n';
import { LEGAL_TEXTS } from '@/legal/content';

describe('detectLang', () => {
  it('usa el primer idioma del iPhone que Lumi habla', () => {
    expect(detectLang(['fr'])).toBe('fr');
    expect(detectLang(['de', 'es'])).toBe('es');
    expect(detectLang(['zh-Hans'])).toBe('zh');
    expect(detectLang(['HI_IN'])).toBe('hi');
  });

  it('cae en inglés si no habla ninguno', () => {
    expect(detectLang(['de', 'ja'])).toBe('en');
    expect(detectLang([null, undefined])).toBe('en');
    expect(detectLang([])).toBe('en');
  });

  it('los tests corren en español', () => {
    expect(lang).toBe('es');
  });
});

describe('contenido del juego', () => {
  const all = { en, fr, hi, zh };

  it.each(Object.entries(all))('%s tiene los mismos lugares, objetos y amigos que el español', (_, c) => {
    expect(Object.keys(c.places).sort()).toEqual(Object.keys(es.places).sort());
    expect(Object.keys(c.items).sort()).toEqual(Object.keys(es.items).sort());
    expect(Object.keys(c.friends).sort()).toEqual(Object.keys(es.friends).sort());
    for (const place of Object.values(c.places)) {
      expect(place.stories).toHaveLength(3);
      for (const text of [place.name, place.the, place.from, place.caption, place.quote, ...place.stories]) {
        expect(text.trim()).not.toBe('');
      }
    }
  });

  it('cada destino y cada entrada del catálogo tiene su texto', () => {
    expect(Object.keys(es.places).sort()).toEqual(DESTINATIONS.map((d) => d.id).sort());
    for (const d of DESTINATIONS) {
      expect(d.name).toBeTruthy();
      expect(d.chapterTitle).toBeTruthy();
    }
    for (const e of [...ITEM_CATALOG, ...FRIEND_CATALOG]) expect(e.a).toBeTruthy();
    expect(DESTINATIONS[0].from).toBe('del Bosque de Musgo');
  });
});

describe('textos legales', () => {
  it('cada idioma tiene los mismos documentos y el mismo número de secciones y párrafos', () => {
    const shape = (docs: (typeof LEGAL_TEXTS)['es']) =>
      Object.fromEntries(Object.entries(docs).map(([k, d]) => [k, d.sections.map((s) => s.body.length)]));
    for (const docs of Object.values(LEGAL_TEXTS)) expect(shape(docs)).toEqual(shape(LEGAL_TEXTS.es));
  });
});
