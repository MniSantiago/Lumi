import { describe, expect, it } from '@jest/globals';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(__dirname, '..', '..');

/**
 * La línea roja de la Fase 1: los datos de Tiempo de Uso no salen del iPhone.
 *
 * Apple es estricta con Family Controls y, antes que eso, es el argumento de venta
 * de Lampi. Este test vigila que nadie meta por descuido el uso real del móvil en
 * un evento de analítica: ni qué apps, ni cuántos minutos, ni el umbral.
 *
 * Si este test falla, la respuesta correcta casi nunca es cambiarlo.
 */
const PROHIBIDO = [
  'limitMinutes',
  'thiefApps',
  'threshold',
  'selectionSummary',
  'userName',
  'lumiName',
  'minutos',
  'email',
];

function archivosTs(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === 'node_modules' ? [] : archivosTs(full);
    return /\.tsx?$/.test(name) ? [full] : [];
  });
}

/** Cada `analytics.track(...)`, con sus paréntesis equilibrados. */
function llamadasTrack(code: string): string[] {
  const out: string[] = [];
  const marca = 'analytics.track(';
  let i = code.indexOf(marca);
  while (i !== -1) {
    let depth = 0;
    let j = i + marca.length - 1;
    for (; j < code.length; j++) {
      if (code[j] === '(') depth++;
      else if (code[j] === ')') {
        depth--;
        if (depth === 0) break;
      }
    }
    out.push(code.slice(i, j + 1));
    i = code.indexOf(marca, j);
  }
  return out;
}

describe('línea roja: el uso del móvil no sale del iPhone', () => {
  const llamadas = archivosTs(SRC).flatMap((file) =>
    llamadasTrack(readFileSync(file, 'utf8')).map((call) => ({ file, call })),
  );

  it('hay llamadas que vigilar (si no, el test se ha quedado ciego)', () => {
    expect(llamadas.length).toBeGreaterThan(5);
  });

  it.each(PROHIBIDO)('ningún evento manda «%s»', (prohibido) => {
    const culpables = llamadas.filter(({ call }) => call.includes(prohibido));
    expect(culpables.map(({ file, call }) => `${file}: ${call}`)).toEqual([]);
  });
});
