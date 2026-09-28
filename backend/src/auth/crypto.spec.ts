import {
  hashPassword,
  normalizeEmail,
  randomCode,
  verifyPassword,
} from './crypto.js';

describe('crypto', () => {
  it('verifica la contraseña buena y rechaza la mala', async () => {
    const hash = await hashPassword('contraseña-larga');
    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('contraseña-larga', hash)).toBe(true);
    expect(await verifyPassword('contraseña-largA', hash)).toBe(false);
  });

  it('no acepta hashes con otro formato', async () => {
    expect(await verifyPassword('x', 'bcrypt$2b$10$algo')).toBe(false);
    expect(await verifyPassword('x', '')).toBe(false);
  });

  it('genera códigos de 6 cifras', () => {
    for (let i = 0; i < 200; i++) expect(randomCode()).toMatch(/^\d{6}$/);
  });

  it('normaliza correos', () => {
    expect(normalizeEmail('  Tu@Correo.COM ')).toBe('tu@correo.com');
  });
});
