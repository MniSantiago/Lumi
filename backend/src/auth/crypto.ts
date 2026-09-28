import {
  createHash,
  randomBytes,
  randomInt,
  scrypt,
  timingSafeEqual,
  type ScryptOptions,
} from 'node:crypto';

/** scrypt de Node (sin dependencias nativas). Parámetros de OWASP para scrypt. */
const SCRYPT = { N: 2 ** 17, r: 8, p: 1, keylen: 64 } as const;
const MAXMEM = 256 * 1024 * 1024;

function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, keylen, options, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

/** Devuelve `scrypt$N$r$p$salt$hash` (base64url), para poder subir los parámetros más adelante. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
    maxmem: MAXMEM,
  });
  return [
    'scrypt',
    SCRYPT.N,
    SCRYPT.r,
    SCRYPT.p,
    salt.toString('base64url'),
    key.toString('base64url'),
  ].join('$');
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [algo, n, r, p, saltB64, keyB64] = stored.split('$');
  if (algo !== 'scrypt' || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, 'base64url');
  const key = await scryptAsync(
    password,
    Buffer.from(saltB64, 'base64url'),
    expected.length,
    {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: MAXMEM,
    },
  );
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** Hash rápido para secretos aleatorios de alta entropía (tokens y códigos con límite de intentos). */
export const sha256 = (value: string) =>
  createHash('sha256').update(value).digest('hex');

export const randomToken = () => randomBytes(32).toString('base64url');

/** Código de 6 cifras, con ceros a la izquierda si hace falta. */
export const randomCode = () =>
  String(randomInt(0, 1_000_000)).padStart(6, '0');

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
