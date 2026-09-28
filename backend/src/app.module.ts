import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module.js';
import { validateEnv } from './config/env.js';
import { DatabaseModule } from './db/database.module.js';
import { HealthController } from './health.controller.js';
import { MailModule } from './mail/mail.module.js';
import { WaitlistController } from './waitlist/waitlist.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      cache: true,
    }),
    // Límite general por IP; las rutas sensibles lo bajan con @Throttle. En los tests e2e no aplica.
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 120 }],
      skipIf: () => process.env.NODE_ENV === 'test',
    }),
    DatabaseModule,
    MailModule,
    AuthModule,
  ],
  controllers: [HealthController, WaitlistController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
