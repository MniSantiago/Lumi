/**
 * Variables de entorno, validadas al arrancar. Si falta algo obligatorio, el
 * servidor no arranca y dice qué falta (mejor que fallar en la primera petición).
 */
export type Env = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  /** Firma de los tokens de acceso. En producción, 32 caracteres o más. */
  JWT_SECRET: string;
  /** Vacío en desarrollo: los correos se escriben en el log en vez de enviarse. */
  RESEND_API_KEY: string;
  MAIL_FROM: string;
  /** Orígenes permitidos por CORS (la landing), separados por comas. */
  CORS_ORIGINS: string[];
};

export function validateEnv(raw: Record<string, unknown>): Env {
  const str = (key: string, fallback?: string) => {
    const value = raw[key];
    if (typeof value === 'string' && value.trim() !== '') return value.trim();
    if (fallback !== undefined) return fallback;
    throw new Error(`Falta la variable de entorno ${key}`);
  };

  const nodeEnv = str('NODE_ENV', 'development');
  if (
    nodeEnv !== 'development' &&
    nodeEnv !== 'production' &&
    nodeEnv !== 'test'
  ) {
    throw new Error(`NODE_ENV no válido: ${nodeEnv}`);
  }
  const prod = nodeEnv === 'production';

  const jwtSecret = str(
    'JWT_SECRET',
    prod ? undefined : 'dev-secret-cambialo-en-produccion',
  );
  if (prod && jwtSecret.length < 32)
    throw new Error(
      'JWT_SECRET debe tener al menos 32 caracteres en producción',
    );

  const resendKey = str('RESEND_API_KEY', prod ? undefined : '');

  const port = Number(str('PORT', '3000'));
  if (!Number.isInteger(port) || port <= 0) throw new Error('PORT no válido');

  return {
    NODE_ENV: nodeEnv,
    PORT: port,
    DATABASE_URL: str('DATABASE_URL'),
    JWT_SECRET: jwtSecret,
    RESEND_API_KEY: resendKey,
    MAIL_FROM: str('MAIL_FROM', 'Lumi <hola@lumi.app>'),
    CORS_ORIGINS: str('CORS_ORIGINS', '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  };
}
