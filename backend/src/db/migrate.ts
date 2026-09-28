/**
 * Aplica las migraciones de `drizzle/` al arrancar en producción (sin drizzle-kit,
 * que es dependencia de desarrollo). Uso: node dist/db/migrate.js
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Falta la variable de entorno DATABASE_URL');

const pool = new pg.Pool({ connectionString: url, max: 1 });
try {
  await migrate(drizzle(pool), {
    migrationsFolder: new URL('../../drizzle', import.meta.url).pathname,
  });
  console.log('Migraciones aplicadas');
} finally {
  await pool.end();
}
