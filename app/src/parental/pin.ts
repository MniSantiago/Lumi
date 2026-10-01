/**
 * Lógica pura del PIN parental (sin almacenamiento ni UI, para poder probarla).
 *
 * El PIN protege los horarios y las apps ladronas de Ajustes para que un menor no los cambie.
 * No es una barrera criptográfica contra alguien con el iPhone desbloqueado y mucho tiempo:
 * es una barrera de «no lo cambies sin que me entere», con bloqueo creciente tras los fallos.
 */

export const PIN_LENGTH = 4;

/** Fallos seguidos antes de bloquear los intentos un rato. */
export const FREE_ATTEMPTS = 5;
const BASE_LOCKOUT_MS = 30_000;
const MAX_LOCKOUT_MS = 60 * 60_000;

/** Cuánto dura el desbloqueo tras acertar el PIN. */
export const UNLOCK_MS = 5 * 60_000;

/** Espera para quitar el PIN cuando no hay cuenta con la que comprobar que eres tú. */
export const RESET_WAIT_MS = 24 * 60 * 60_000;

/**
 * ¿Queda la sesión desbloqueada tras guardar un PIN?
 * - Crearlo (no había PIN): no. Hay que ver la protección activa al momento; si se desbloqueara
 *   5 minutos, los horarios y las apps ladronas seguirían sin pedir PIN y parecería que no
 *   funciona hasta reiniciar la app.
 * - Cambiarlo (ya había PIN): sí, porque acaba de acertar el actual para poder cambiarlo.
 */
export const unlocksAfterSetPin = (hadPin: boolean) => hadPin;

export type ParentalRecord = {
  pin: string;
  /** Fallos seguidos desde el último acierto. */
  failures: number;
  /** Hasta cuándo no se admiten intentos (ms desde epoch). 0 = sin bloqueo. */
  lockedUntil: number;
  /** Cuándo se pidió quitar el PIN sin cuenta (ms desde epoch), o null. */
  resetRequestedAt: number | null;
};

export const isValidPin = (pin: string) => new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);

/** Solo dígitos y como mucho PIN_LENGTH: lo que se admite mientras se escribe. */
export const sanitizePin = (text: string) => text.replace(/\D/g, '').slice(0, PIN_LENGTH);

/** Un PIN demasiado fácil de adivinar (0000, 1234, 4321…). No se admite al crearlo. */
export function isWeakPin(pin: string) {
  if (/^(\d)\1+$/.test(pin)) return true;
  return '0123456789'.includes(pin) || '9876543210'.includes(pin);
}

export function newRecord(pin: string): ParentalRecord {
  return { pin, failures: 0, lockedUntil: 0, resetRequestedAt: null };
}

/** Espera tras `failures` fallos seguidos: 0 hasta FREE_ATTEMPTS, luego 30 s, 1 min, 2 min… hasta 1 h. */
export function lockoutMs(failures: number) {
  if (failures < FREE_ATTEMPTS) return 0;
  return Math.min(MAX_LOCKOUT_MS, BASE_LOCKOUT_MS * 2 ** (failures - FREE_ATTEMPTS));
}

export type CheckResult =
  | { ok: true; record: ParentalRecord }
  | {
      ok: false;
      record: ParentalRecord;
      /** Segundos de espera si ahora está bloqueado, 0 si no. */
      waitSeconds: number;
      attemptsLeft: number;
    };

/** Comprueba un intento y devuelve el registro actualizado (contador de fallos y bloqueo). */
export function checkPin(record: ParentalRecord, attempt: string, now: number): CheckResult {
  if (now < record.lockedUntil) {
    return { ok: false, record, waitSeconds: Math.ceil((record.lockedUntil - now) / 1000), attemptsLeft: 0 };
  }
  if (attempt === record.pin) {
    return { ok: true, record: { ...record, failures: 0, lockedUntil: 0 } };
  }
  const failures = record.failures + 1;
  const wait = lockoutMs(failures);
  const next = { ...record, failures, lockedUntil: wait ? now + wait : 0 };
  return {
    ok: false,
    record: next,
    waitSeconds: Math.ceil(wait / 1000),
    attemptsLeft: Math.max(0, FREE_ATTEMPTS - failures),
  };
}

/** Cuánto falta (ms) para poder quitar el PIN sin cuenta; 0 si ya se puede, null si no se ha pedido. */
export function resetRemainingMs(resetRequestedAt: number | null, now: number) {
  if (resetRequestedAt == null) return null;
  return Math.max(0, resetRequestedAt + RESET_WAIT_MS - now);
}

/** Horas que faltan, redondeadas hacia arriba, para enseñarlas («unas 5 h»). */
export const hoursLeft = (ms: number) => Math.max(1, Math.ceil(ms / 3_600_000));
