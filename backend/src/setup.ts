import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from '@nestjs/swagger';
import helmet from 'helmet';

import type { Env } from './config/env.js';

/** Lo común a `main.ts`, los tests e2e y la generación del OpenAPI. */
export function configureApp(app: INestApplication) {
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  app.use(helmet());
  app.enableCors({
    origin: config.get('CORS_ORIGINS', { infer: true }),
    methods: ['GET', 'POST', 'PATCH'],
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
