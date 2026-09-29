/**
 * Idioma de la web: el del navegador si Lumi lo habla (es, en, zh, hi, fr) y, si no, inglés.
 * Se puede forzar con ?lang=xx. Traduce los textos de la página con la tabla de texts.js
 * (clave: el texto en español) y, en las páginas legales, enseña el bloque de ese idioma.
 */
(function () {
  const LANGS = ['es', 'en', 'zh', 'hi', 'fr'];
  const forced = new URLSearchParams(location.search).get('lang');
  const prefs = [forced, ...(navigator.languages || [navigator.language])];
  let lang = 'en';
  for (const code of prefs) {
    const base = String(code || '').toLowerCase().split(/[-_]/)[0];
    if (LANGS.includes(base)) {
      lang = base;
      break;
    }
  }
  window.LUMI_LANG = lang;
  document.documentElement.lang = { es: 'es-ES', en: 'en', zh: 'zh-Hans', hi: 'hi', fr: 'fr' }[lang];

  // Enlaces entre páginas: conservan el idioma elegido a mano.
  if (forced) {
    document.querySelectorAll('a[href$=".html"], a[href="./"]').forEach((a) => {
      const url = new URL(a.getAttribute('href'), location.href);
      url.searchParams.set('lang', lang);
      a.setAttribute('href', (url.pathname.split('/').pop() || './') + url.search + url.hash);
    });
  }

  // Páginas legales: un bloque por idioma.
  const blocks = document.querySelectorAll('[data-lang]');
  blocks.forEach((b) => {
    b.hidden = b.dataset.lang !== lang;
    if (!b.hidden && b.dataset.title) document.title = b.dataset.title;
  });

  const col = LANGS.indexOf(lang);
  const dict = new Map();
  if (col > 0) for (const row of window.LUMI_ROWS || []) dict.set(row[0], row[col]);

  /** Traduce un texto (clave en español); si no está en la tabla, lo deja igual. */
  window.lumiT = (es) => dict.get(es) ?? es;
  if (col <= 0) return;

  const translate = (s) => {
    const key = s.replace(/\s+/g, ' ').trim();
    const hit = dict.get(key);
    return hit === undefined ? s : s.replace(/^(\s*)[\s\S]*?(\s*)$/, (_, a, b) => a + hit + b);
  };

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.parentElement && !n.parentElement.closest('script, style, [data-lang]') && n.nodeValue.trim()
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) n.nodeValue = translate(n.nodeValue);

  for (const attr of ['alt', 'placeholder', 'aria-label', 'data-slot-alt']) {
    document.querySelectorAll(`[${attr}]`).forEach((el) => el.setAttribute(attr, translate(el.getAttribute(attr))));
  }
  document.querySelectorAll('meta[name="description"], meta[property^="og:"]').forEach((m) => {
    if (m.content) m.content = translate(m.content);
  });
  document.title = translate(document.title);
  // Las plantillas (<template>) no están en el DOM principal: se traducen aparte.
  document.querySelectorAll('template').forEach((tpl) => {
    const w = document.createTreeWalker(tpl.content, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) n.nodeValue = translate(n.nodeValue);
  });
})();
