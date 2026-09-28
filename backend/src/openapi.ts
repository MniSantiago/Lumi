/**
 * Escribe `openapi.json` sin levantar el servidor ni tocar la base de datos.
 * Uso: npm run openapi (después, en app/: npm run api:generate).
 */
import { writeFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';

// Antes de importar AppModule: la validación del entorno corre al importarlo.
process.env.DATABASE_URL ??= 'postgres://localhost/openapi';
const { AppModule } = await import('./app.module.js');
const { buildOpenApi } = await import('./setup.js');

const app = await NestFactory.create(AppModule, { logger: ['error'] });
writeFileSync(
  new URL('../openapi.json', import.meta.url),
  JSON.stringify(buildOpenApi(app), null, 2) + '\n',
);
await app.close();
console.log('openapi.json actualizado');
