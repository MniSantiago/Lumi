import { describe, expect, it } from '@jest/globals';
import { lstatSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const APP = join(__dirname, '..', '..', '..');
const SHARED = join(APP, 'targets', '_shared', 'LampiShared.swift');
const MODULE_COPY = join(APP, 'modules', 'lampi-screen-time', 'ios', 'LampiShared.swift');

/**
 * `LampiShared.swift` lo compilan las 3 extensiones (desde `targets/_shared`) y el módulo
 * nativo (desde su carpeta `ios`). Antes la copia del módulo era un symlink, pero git con
 * `core.symlinks=false` lo convierte en un archivo de texto con la ruta, y Xcode falla con
 * «cannot find 'LampiShared' in scope». Ahora es una copia real, y este test la vigila.
 */
describe('LampiShared.swift', () => {
  it('la copia del módulo es un archivo real, no un symlink ni una ruta', () => {
    expect(lstatSync(MODULE_COPY).isSymbolicLink()).toBe(false);
    const text = readFileSync(MODULE_COPY, 'utf8');
    expect(text).toContain('enum LampiShared');
    expect(text.startsWith('../')).toBe(false);
  });

  it('las dos copias son idénticas', () => {
    expect(readFileSync(MODULE_COPY, 'utf8')).toBe(readFileSync(SHARED, 'utf8'));
  });
});
