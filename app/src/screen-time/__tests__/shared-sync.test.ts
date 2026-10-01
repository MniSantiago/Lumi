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

/**
 * Regresión: Lampi no reflejaba el uso real. La app reprograma el monitor en cada arranque
 * y `intervalDidStart` saltaba también entonces: ponía el umbral a 0 (Lampi radiante y barra
 * vacía) y reiniciar el monitor ponía a cero los contadores de iOS. Estos tests vigilan las
 * dos defensas (no hay Swift ejecutable en CI).
 */
describe('monitor de uso (regresión: el estado no seguía el uso real)', () => {
  const shared = readFileSync(SHARED, 'utf8');
  const monitor = readFileSync(join(APP, 'targets', 'lampi-monitor', 'DeviceActivityMonitorExtension.swift'), 'utf8');

  it('intervalDidStart del día solo resetea si es un día nuevo', () => {
    const daily = monitor.slice(
      monitor.indexOf('case LampiShared.dailyActivity'),
      monitor.indexOf('case LampiShared.nightActivity'),
    );
    expect(daily).toContain('startNewDayIfNeeded()');
    expect(daily).not.toContain('setThreshold(0)');
    expect(shared).toMatch(/startNewDayIfNeeded\(\)[\s\S]*?guard defaults\.string\(forKey: Key\.thresholdDay\) != dayKey\(\)/);
  });

  it('scheduleMonitoring no reinicia el monitor si nada ha cambiado', () => {
    expect(shared).toContain('scheduleSignature');
    expect(shared).toContain('center.activities.contains(dailyActivity)');
    expect(shared).toContain('selectionRevision');
  });
});
