import { validateEnv } from './env.js';

const base = { DATABASE_URL: 'postgres://localhost/lumi' };

describe('validateEnv', () => {
  it('en desarrollo rellena lo que falta', () => {
    const env = validateEnv(base);
    expect(env).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      RESEND_API_KEY: '',
      CORS_ORIGINS: ['https://lampi.es', 'https://www.lampi.es'],
    });
  });

  it('en producción exige un JWT_SECRET largo y la clave de Resend', () => {
    expect(() => validateEnv({ ...base, NODE_ENV: 'production' })).toThrow(
      /JWT_SECRET/,
    );
    expect(() =>
      validateEnv({ ...base, NODE_ENV: 'production', JWT_SECRET: 'corto' }),
    ).toThrow(/32/);
    expect(() =>
      validateEnv({
        ...base,
        NODE_ENV: 'production',
        JWT_SECRET: 'x'.repeat(32),
      }),
    ).toThrow(/RESEND_API_KEY/);
  });

  it('separa los orígenes de CORS', () => {
    expect(
      validateEnv({ ...base, CORS_ORIGINS: 'https://a.com, https://b.com' })
        .CORS_ORIGINS,
    ).toEqual([
      'https://lampi.es',
      'https://www.lampi.es',
      'https://a.com',
      'https://b.com',
    ]);
  });

  it('falla sin DATABASE_URL', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });
});
