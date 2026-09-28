/* Lumi, landing con lista de espera. Sin dependencias ni build. */

/**
 * Dónde se envían los registros. POST con JSON.
 * - Formspree: 'https://formspree.io/f/XXXXXXX'
 * - Tally / Supabase / Worker propio: cualquier URL que acepte POST application/json.
 * Si se deja vacío, el formulario no finge: avisa de que la lista aún no está abierta.
 */
const WAITLIST_ENDPOINT = '';

/** Cabeceras extra (p. ej. Supabase: { apikey: '…', Authorization: 'Bearer …', Prefer: 'return=minimal' }). */
const WAITLIST_HEADERS = {};

/**
 * Analítica. De momento no hace nada (solo registra en consola en local).
 * Para medir registros por visita, conecta aquí Plausible o PostHog:
 *   window.plausible?.(event, { props });
 *   window.posthog?.capture(event, props);
 */
function track(event, props = {}) {
  const payload = { ...props, ...source };
  if (location.protocol === 'file:' || location.hostname === 'localhost') {
    console.debug('[track]', event, payload);
  }
}

/* ───────── Origen de la visita (UTM y ref) ───────── */
const SOURCE_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'ref'];
const source = (() => {
  const params = new URLSearchParams(location.search);
  let stored = {};
  try { stored = JSON.parse(sessionStorage.getItem('lumi-source') || '{}'); } catch { /* sin almacenamiento */ }
  const fromUrl = {};
  for (const key of SOURCE_KEYS) {
    const value = params.get(key);
    if (value) fromUrl[key] = value.slice(0, 120);
  }
  const merged = Object.keys(fromUrl).length ? fromUrl : stored;
  try { sessionStorage.setItem('lumi-source', JSON.stringify(merged)); } catch { /* sin almacenamiento */ }
  return merged;
})();

track('page_view', { path: location.pathname, referrer: document.referrer || null });

/* ───────── Lista de espera ───────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setMessage(form, text, kind = 'error') {
  const msg = form.querySelector('.form-msg');
  msg.textContent = text;
  msg.classList.toggle('info', kind === 'info');
}

function showSuccess(form) {
  const tpl = document.getElementById('success-tpl');
  const node = tpl.content.firstElementChild.cloneNode(true);
  form.replaceWith(node);
  node.focus({ preventScroll: true });
  node.querySelector('[data-share]').addEventListener('click', () => share(node));
}

async function share(container) {
  const url = new URL(location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('ref', 'invitacion');
  const data = {
    title: 'Lumi',
    text: 'He encontrado una mascota que brilla cuando sueltas el móvil. Creo que tú también necesitas un Lumi.',
    url: url.toString(),
  };
  const msg = container.querySelector('.share-msg');
  track('share_click', { method: navigator.share ? 'native' : 'clipboard' });
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      await navigator.clipboard.writeText(`${data.text} ${data.url}`);
      msg.textContent = 'Enlace copiado. Pégaselo a quien quieras.';
    }
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    msg.textContent = `Copia este enlace: ${data.url}`;
  }
}

async function onSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const emailInput = form.elements.email;
  const email = emailInput.value.trim();
  const button = form.querySelector('button[type="submit"]');

  if (form.elements.website && form.elements.website.value) return; // bot

  if (!EMAIL_RE.test(email)) {
    emailInput.setAttribute('aria-invalid', 'true');
    setMessage(form, 'Ese correo no parece completo. Revisa que tenga @ y dominio, por ejemplo tu@correo.com.');
    emailInput.focus();
    return;
  }
  emailInput.removeAttribute('aria-invalid');

  track('waitlist_submit', { form: form.dataset.form });

  if (!WAITLIST_ENDPOINT) {
    console.warn('[Lumi] WAITLIST_ENDPOINT está vacío en main.js: el correo no se ha guardado.');
    setMessage(form, 'La lista de espera abre muy pronto y todavía no guarda correos. Vuelve en unos días y Lumi te apunta.', 'info');
    return;
  }

  const payload = {
    email,
    app: form.elements.app ? form.elements.app.value || null : null,
    form: form.dataset.form,
    ...source,
    referrer: document.referrer || null,
    landing: location.pathname,
    lang: navigator.language,
    created_at: new Date().toISOString(),
  };

  button.disabled = true;
  const label = button.textContent;
  button.textContent = 'Apuntando…';
  setMessage(form, '');

  try {
    const res = await fetch(WAITLIST_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...WAITLIST_HEADERS },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    track('waitlist_success', { form: form.dataset.form, app: payload.app });
    showSuccess(form);
  } catch (err) {
    console.error('[Lumi] Error al enviar a la lista de espera', err);
    track('waitlist_error', { form: form.dataset.form });
    button.disabled = false;
    button.textContent = label;
    setMessage(form, 'No se ha podido guardar tu correo. Comprueba la conexión y vuelve a intentarlo.');
  }
}

document.querySelectorAll('form.waitlist').forEach((form) => {
  form.addEventListener('submit', onSubmit);
  form.elements.email.addEventListener('input', () => {
    form.elements.email.removeAttribute('aria-invalid');
    setMessage(form, '');
  });
  // Primer contacto con el formulario: cuenta como clic en la llamada a la acción
  form.addEventListener('focusin', () => track('cta_click', { form: form.dataset.form }), { once: true });
});

/* ───────── Los 4 estados de Lumi ───────── */
const STATES = {
  radiante: { lit: 4, meter: 'Brilla a tope', bubble: '¡Hoy me voy al Bosque de Musgo! Te traigo algo.', caption: '<b>Radiante.</b> Brilla a tope y sale de expedición.', alt: 'Lumi radiante, brillando a tope' },
  contenta: { lit: 3, meter: 'Brilla bien', bubble: 'Sigo de aventura. Voy tarareando.', caption: '<b>Contenta.</b> Sigue explorando, tan a gusto.', alt: 'Lumi contenta, sonriendo' },
  cansada: { lit: 2, meter: 'Se está apagando', bubble: 'Uaaah… Hoy mejor me quedo en casa.', caption: '<b>Cansada.</b> Bosteza y se queda en casa esperándote.', alt: 'Lumi cansada, bostezando' },
  apagadita: { lit: 1, meter: 'Luz mínima', bubble: 'Zzz… Mañana, luz nueva.', caption: '<b>Apagadita.</b> Se echa la siesta hecha una bolita. Mañana se despierta con toda su luz.', alt: 'Lumi apagadita, dormida hecha una bolita' },
};
const phone = document.querySelector('.phone[data-lit]');
const radios = [...document.querySelectorAll('.states [role="radio"]')];

function setState(name, focus = false) {
  const s = STATES[name];
  phone.dataset.lit = name;
  const img = phone.querySelector('[data-home-lumi]');
  img.src = `img/lumi-${name}.webp`;
  img.alt = s.alt;
  phone.querySelector('[data-meter-label]').textContent = s.meter;
  phone.querySelector('[data-bubble]').textContent = s.bubble;
  phone.querySelector('[data-caption]').innerHTML = s.caption;
  phone.querySelectorAll('.meter i').forEach((bar, i) => bar.classList.toggle('lit', i < s.lit));
  radios.forEach((r) => {
    const on = r.dataset.state === name;
    r.setAttribute('aria-checked', String(on));
    r.tabIndex = on ? 0 : -1;
    if (on && focus) r.focus();
  });
}

radios.forEach((radio, i) => {
  radio.addEventListener('click', () => { setState(radio.dataset.state); track('state_demo', { state: radio.dataset.state }); });
  radio.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = radios[(i + step + radios.length) % radios.length];
    setState(next.dataset.state, true);
  });
});
setState('radiante');

/* ───────── El escudo (demo con los textos reales de la app) ───────── */
const shield = document.querySelector('[data-shield]');
let snoozes = 0;
shield.querySelectorAll('[data-shield-choice]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const reply = shield.querySelector('[data-shield-reply]');
    const choice = btn.dataset.shieldChoice;
    if (choice === 'leave') {
      reply.textContent = 'Gracias. Me quedo soñando contigo 💤';
      shield.classList.add('chose-leave');
    } else {
      snoozes += 1;
      reply.textContent = snoozes === 1 ? 'Vale, 5 minutitos. Aquí te espero 🌙' : 'Otros 5, vale. Te espero despierta 🌙';
      btn.textContent = 'Vale… 5 min, pero te espero despierta';
      shield.classList.remove('chose-leave');
    }
    track('shield_demo', { choice, snoozes });
  });
});

/* ───────── Huecos para capturas reales del simulador ─────────
   Si existe el PNG indicado en data-slot, sustituye al mockup en HTML. */
document.querySelectorAll('.phone[data-slot]').forEach((el) => {
  const img = new Image();
  img.className = 'shot';
  img.alt = el.dataset.slotAlt || '';
  img.decoding = 'async';
  img.onload = () => { el.querySelector('.screen').appendChild(img); el.classList.add('has-shot'); };
  img.src = el.dataset.slot;
});

/* ───────── Luciérnagas ───────── */
(() => {
  const canvas = document.querySelector('.fireflies');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let w = 0, h = 0, dpr = 1, flies = [], raf = 0, visible = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(34, Math.max(14, (w * h) / 26000)));
    flies = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: h * (0.25 + Math.random() * 0.75),
      r: 1.2 + Math.random() * 2, vx: (Math.random() - 0.5) * 0.25, vy: -0.05 - Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2, speed: 0.01 + Math.random() * 0.02,
    }));
  }

  function draw(still) {
    ctx.clearRect(0, 0, w, h);
    for (const f of flies) {
      if (!still) {
        f.phase += f.speed;
        f.x += f.vx + Math.sin(f.phase * 0.7) * 0.2;
        f.y += f.vy;
        if (f.y < h * 0.12) { f.y = h + 10; f.x = Math.random() * w; }
        if (f.x < -10) f.x = w + 10; else if (f.x > w + 10) f.x = -10;
      }
      const a = still ? 0.7 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f.phase * 2));
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6);
      g.addColorStop(0, `rgba(255, 227, 163, ${a})`);
      g.addColorStop(0.3, `rgba(255, 201, 107, ${a * 0.5})`);
      g.addColorStop(1, 'rgba(255, 201, 107, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 6, 0, Math.PI * 2); ctx.fill();
    }
  }

  function loop() { draw(false); raf = requestAnimationFrame(loop); }
  function start() {
    cancelAnimationFrame(raf);
    if (reduce.matches || !visible) { draw(true); return; }
    loop();
  }

  resize(); start();
  window.addEventListener('resize', () => { resize(); start(); });
  reduce.addEventListener?.('change', start);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start(); }).observe(canvas);
})();
