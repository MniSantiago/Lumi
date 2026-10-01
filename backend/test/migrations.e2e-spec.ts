import { randomBytes } from 'node:crypto';

import pg from 'pg';

import { runMigrations } from '../src/db/run-migrations.js';

const adminUrl =
  process.env.DATABASE_URL ?? 'postgres://lumi:lumi@localhost:5432/lumi_test';

/** Misma URL pero apuntando a otra base de datos. */
function urlFor(db: string) {
  const u = new URL(adminUrl);
  u.pathname = `/${db}`;
  return u.toString();
}

describe('Migraciones al arrancar (e2e)', () => {
  const dbName = `lumi_mig_${randomBytes(4).toString('hex')}`;
  const admin = new pg.Pool({ connectionString: adminUrl, max: 1 });

  beforeAll(async () => {
    await admin.query(`CREATE DATABASE ${dbName}`);
  });
  afterAll(async () => {
    await admin.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);
    await admin.end();
  });

  async function tables() {
    const pool = new pg.Pool({ connectionString: urlFor(dbName), max: 1 });
    try {
      const { rows } = await pool.query<{ tablename: string }>(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1`,
      );
      return rows.map((r) => r.tablename);
    } finally {
      await pool.end();
    }
  }

  it('crea las tablas en una base de datos vacía, también con varias instancias a la vez', async () => {
    expect(await tables()).toEqual([]);
    // Tres "instancias" arrancando a la vez: el cerrojo evita que choquen creando los mismos tipos y tablas.
    await Promise.all([1, 2, 3].map(() => runMigrations(urlFor(dbName))));
    const created = await tables();
    expect(created).toEqual(
      expect.arrayContaining(['users', 'email_codes', 'refresh_tokens']),
    );
  });

  it('es idempotente: volver a arrancar con la BD al día no falla ni cambia nada', async () => {
    const before = await tables();
    await runMigrations(urlFor(dbName));
    expect(await tables()).toEqual(before);
  });
});
