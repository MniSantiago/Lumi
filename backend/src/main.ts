import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';
import { buildOpenApi, configureApp } from './setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
