import { describe, expect, it } from '@jest/globals';

import {
  checkPin,
  FREE_ATTEMPTS,
  hoursLeft,
  isValidPin,
  isWeakPin,
  lockoutMs,
  newRecord,
  RESET_WAIT_MS,
  resetRemainingMs,
  sanitizePin,
  unlocksAfterSetPin,
} from '../pin';

describe('PIN parental', () => {
  it('valida 4 dígitos exactos y limpia lo que se escribe', () => {
    expect(isValidPin('4829')).toBe(true);
    expect(isValidPin('482')).toBe(false);
    expect(isValidPin('48291')).toBe(false);
    expect(isValidPin('48a9')).toBe(false);
    expect(sanitizePin('4 8-2a9 1')).toBe('4829');
  });

  it('rechaza PIN triviales', () => {
    for (const weak of ['0000', '1111', '1234', '4321', '0123', '9876']) expect(isWeakPin(weak)).toBe(true);
    for (const ok of ['4829', '1357', '2580']) expect(isWeakPin(ok)).toBe(false);
  });

  it('acierta y reinicia el contador de fallos', () => {
    const r = { ...newRecord('4829'), failures: 3 };
    const res = checkPin(r, '4829', 1000);
    expect(res.ok).toBe(true);
    expect(res.record.failures).toBe(0);
  });

  it('cuenta los fallos y avisa de los intentos que quedan', () => {
    let r = newRecord('4829');
    for (let i = 1; i < FREE_ATTEMPTS; i++) {
      const res = checkPin(r, '0000', 1000);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.waitSeconds).toBe(0);
        expect(res.attemptsLeft).toBe(FREE_ATTEMPTS - i);
      }
      r = res.record;
    }
  });

  it('bloquea tras los intentos libres, con espera creciente y tope', () => {
    expect(lockoutMs(FREE_ATTEMPTS - 1)).toBe(0);
    expect(lockoutMs(FREE_ATTEMPTS)).toBe(30_000);
    expect(lockoutMs(FREE_ATTEMPTS + 1)).toBe(60_000);
    expect(lockoutMs(FREE_ATTEMPTS + 30)).toBe(3_600_000);

    let res = checkPin(newRecord('4829'), '0000', 0);
    for (let i = 1; i < FREE_ATTEMPTS; i++) res = checkPin(res.record, '0000', 0);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.waitSeconds).toBe(30);
    const r = res.record;
    // Bloqueado: ni el PIN correcto vale hasta que pase la espera.
    const blocked = checkPin(r, '4829', 10_000);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.waitSeconds).toBe(20);
    expect(checkPin(r, '4829', 30_001).ok).toBe(true);
  });

  it('quitar el PIN sin cuenta exige esperar 24 horas', () => {
    expect(resetRemainingMs(null, 0)).toBeNull();
    expect(resetRemainingMs(1000, 1000)).toBe(RESET_WAIT_MS);
    expect(resetRemainingMs(1000, 1000 + RESET_WAIT_MS)).toBe(0);
    expect(hoursLeft(RESET_WAIT_MS)).toBe(24);
    expect(hoursLeft(1)).toBe(1);
  });

  it('crear el PIN no deja desbloqueado; cambiarlo sí (acaba de acertar el actual)', () => {
    expect(unlocksAfterSetPin(false)).toBe(false);
    expect(unlocksAfterSetPin(true)).toBe(true);
  });
});
