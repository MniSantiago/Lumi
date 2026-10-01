import { fileURLToPath } from 'node:url';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

/** Carpeta `drizzle/` con las migraciones (junto a `dist/` y `src/`). */
const MIGRATIONS_FOLDER = fileURLToPath(
  new URL('../../drizzle', import.meta.url),
);

/** Número arbitrario y fijo: todas las instancias de Lampi piden el mismo cerrojo. */
const MIGRATION_LOCK_ID = 7_201_926;

/**
 * Aplica las migraciones pendientes. Es idempotente (con la BD al día no hace
 * nada) y segura con varias instancias a la vez: un cerrojo consultivo de
 * Postgres hace que solo una migre y las demás esperen y la encuentren ya hecha.
 */
export async function runMigrations(
  databaseUrl: string,
  migrationsFolder: string = MIGRATIONS_FOLDER,
): Promise<void> {
  // `max: 1`: el cerrojo es de sesión, así que bloqueo, migración y desbloqueo usan la misma conexión.
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 1 });
  try {
    await pool.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_ID]);
    try {
      await migrate(drizzle(pool), { migrationsFolder });
    } finally {
      await pool.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]);
    }
  } finally {
    await pool.end();
  }
}
