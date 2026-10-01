/**
 * Aplica las migraciones de `drizzle/` a mano (sin drizzle-kit, que es dependencia
 * de desarrollo). El servidor ya lo hace solo al arrancar (ver `main.ts`); esto
 * sirve para ejecutarlo aparte. Uso: node dist/db/migrate.js
 */
import { runMigrations } from './run-migrations.js';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Falta la variable de entorno DATABASE_URL');

await runMigrations(url);
console.log('Migraciones aplicadas');
