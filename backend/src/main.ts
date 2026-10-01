import { ConsoleLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';
import { runMigrations } from './db/run-migrations.js';
import { buildOpenApi, configureApp } from './setup.js';

async function bootstrap() {
  // Las tablas se crean aquí, antes de aceptar tráfico, sea cual sea el comando de arranque de la plataforma.
  // Si falla, el proceso termina (la plataforma no da por bueno el despliegue) en vez de servir 500.
  // DATABASE_URL se valida con el resto de variables al crear la app; aquí solo hace falta para migrar.
  if (!process.env.DATABASE_URL)
    throw new Error('Falta la variable de entorno DATABASE_URL');
  await runMigrations(process.env.DATABASE_URL);

  // En producción, logs en JSON (una línea por evento, sin colores): los entienden las plataformas de logs.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? new ConsoleLogger({ json: true, colors: false })
        : undefined,
  });
  // Detrás del proxy de la plataforma, para que el límite por IP use la IP real.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  configureApp(app);

  const config = app.get<ConfigService<Env, true>>(ConfigService);
  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    SwaggerModule.setup('docs', app, buildOpenApi(app));
  }
  await app.listen(config.get('PORT', { infer: true }));
}
await bootstrap();
