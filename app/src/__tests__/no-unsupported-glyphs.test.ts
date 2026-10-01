/**
 * Guardia contra el "tofu": un recuadro con "?" donde debería haber un emoji o
 * un símbolo. Las fuentes de la app (Figtree, Fraunces) no traen emoji ni
 * dingbats (U+2600-27BF), y al fijar `fontFamily` el sistema no siempre cae
 * a una fuente que los tenga. En el texto de la interfaz van iconos
 * vectoriales (p. ej. `SparkGlyph`), nunca caracteres de ese tipo.
 *
 * Excepciones: los avisos locales (`notifications/copy.ts`) los pinta el
 * sistema, no nuestra fuente; y el código generado.
 */
import { describe, expect, it } from '@jest/globals';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const SRC = join(__dirname, '..');
const ALLOWED = new Set(['notifications/copy.ts', 'api/generated.ts']);
// Emoji (SMP), símbolos varios y dingbats, selectores de variación y flechas.
const PROBLEMATIC = /[\u{1F000}-\u{1FFFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/u;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return name === '__tests__' ? [] : files(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

describe('texto de la interfaz', () => {
  it('no contiene emoji ni símbolos que las fuentes de la app no pintan', () => {
    const offenders: string[] = [];
    for (const file of files(SRC)) {
      const rel = relative(SRC, file);
      if (ALLOWED.has(rel)) continue;
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (/^\s*(\/\/|\/\*|\*)/.test(line)) return; // comentarios
          if (PROBLEMATIC.test(line)) offenders.push(`${rel}:${i + 1}: ${line.trim().slice(0, 90)}`);
        });
    }
    expect(offenders).toEqual([]);
  });
});
