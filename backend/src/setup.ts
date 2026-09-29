import { ValidationPipe, type INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from '@nestjs/swagger';
import helmet from 'helmet';

import type { Env } from './config/env.js';
import { languageMiddleware } from './i18n.js';
import { requestLogger } from './request-logger.js';

/** Lo común a `main.ts`, los tests e2e y la generación del OpenAPI. */
export function configureApp(app: NestExpressApplication) {
  // El progreso guardado puede pasar de los 100 kB por defecto (tope real: 512 kB en ProgressController).
  app.useBodyParser('json', { limit: '1mb' });
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  app.use(requestLogger);
  app.use(languageMiddleware);
  app.use(helmet());
  app.enableCors({
    origin: config.get('CORS_ORIGINS', { infer: true }),
    methods: ['GET', 'POST', 'PUT', 'PATCH'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  app.enableShutdownHooks();
}

export function buildOpenApi(app: INestApplication): OpenAPIObject {
  const doc = new DocumentBuilder()
    .setTitle('Lumi API')
    .setDescription('Cuentas, sesión y lista de espera de Lumi.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  // operationId = nombre del método (login, getMe…): así Orval genera funciones con nombres limpios.
  return SwaggerModule.createDocument(app, doc, {
    operationIdFactory: (_controller, method) => method,
  });
}
