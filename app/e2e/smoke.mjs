/**
 * Prueba de humo de la app en la web: recorre todas las pantallas en los 5
 * idiomas y falla si alguna lanza un error al pintarse o si el idioma del
 * navegador no se aplica.
 *
 * Uso (desde app/):
 *   EXPO_PUBLIC_API_URL=http://localhost:9 npx expo export --platform web
 *   npm i --no-save playwright && npx playwright install chromium
 *   node e2e/smoke.mjs            # CHROMIUM_PATH=… para usar otro Chromium
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

import { chromium } from 'playwright';

const DIST = new URL('../dist/', import.meta.url).pathname;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

/** Estático con vuelta a index.html, como un hosting de SPA. */
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidates = [join(DIST, path), join(DIST, `${path}.html`), join(DIST, 'index.html')];
  const file = candidates.find((f) => existsSync(f) && statSync(f).isFile());
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});

const ROUTES = [
  '/',
  '/expediciones',
  '/coleccion',
  '/progreso',
  '/ajustes',
  '/apps',
  '/chispas',
  '/nombres',
  '/plus',
  '/postal',
  '/resumen',
  '/escudo',
  '/escudo?motivo=noche',
  '/cuenta',
  '/cuenta/olvido',
  '/legal/privacidad',
  '/legal/terminos',
  '/legal/ayuda',
  '/onboarding',
  '/onboarding/apps',
  '/onboarding/limite',
];
/** Una palabra que tiene que salir en el Hogar en cada idioma (la pestaña). */
const LOCALES = { 'es-ES': 'Hogar', 'en-US': 'Home', 'zh-CN': '家', 'hi-IN': 'घर', 'fr-FR': 'Maison' };

await new Promise((ok) => server.listen(0, ok));
const base = `http://localhost:${server.address().port}`;
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const failures = [];

for (const [locale, homeWord] of Object.entries(LOCALES)) {
  const page = await (await browser.newContext({ locale, viewport: { width: 390, height: 844 } })).newPage();
  let route = '';
  page.on('pageerror', (e) => failures.push(`${locale} ${route}: ${e.message}`));
  await page.goto(base);
  await page.evaluate(() =>
    localStorage.setItem('lumi.settings.v1', JSON.stringify({ onboarded: true, userName: 'Ana', lumiName: 'Lumi' })),
  );
  for (route of ROUTES) {
    await page.goto(base + route);
    await page.waitForTimeout(700);
    const text = await page.evaluate(() => document.body.innerText);
    if (!text.trim()) failures.push(`${locale} ${route}: pantalla vacía`);
    if (route === '/' && !text.includes(homeWord)) failures.push(`${locale} /: no sale «${homeWord}»`);
  }
  console.log(`✓ ${locale}: ${ROUTES.length} pantallas`);
}

await browser.close();
server.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
